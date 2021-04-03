import pThrottle from 'p-throttle';
import { getClient } from '../client';
import { utils } from '../utils';
import pWaitFor from 'p-wait-for';
import {
	removeSubmissionsByDeletedUsers,
	removeStolenSubmission,
	removeUnverifiedSellerSubmissions,
	recordSubmissionStats,
	stats
} from '../submissions';

const { log } = utils;

const onceASecond = pThrottle({
	limit: 1,
	interval: 2500
});

export const scanSubmissionsForViolations = async () => {
	const subreddit = getClient().getSubreddit('horny');
	const submissions = await subreddit.getNew({
		limit: 250
	});
	let submissionsToProcess = submissions.length;
	const throttled = onceASecond(async (index: number) => {
		try {
			await removeSubmissionsByDeletedUsers(submissions[index]);
			await removeStolenSubmission(submissions[index]);
			await removeUnverifiedSellerSubmissions(submissions[index]);
			await recordSubmissionStats(submissions[index]);
		} catch (error: unknown) {
			log.error('Failed scanning submission for violations with "%s".', (error as Error).message);
		} finally {
			// Mark this submission as processed
			submissionsToProcess--;
		}
	});

	// Process the submissions
	log.debug('Got %s submissions from the new list, processing...', submissions.length);
	for (let index = 0; index < submissionsToProcess; index++) {
		throttled(index).catch(console.error);
	}

	// Wait until all submissions are processed
	await pWaitFor(() => submissionsToProcess === 0);

	// Log stats
	log.debug('Members - %s | UNVERIFIED Sellers - %s | Sellers - %s', stats.get(null), stats.get('UNVERIFIED Seller'), stats.get('Seller'));
};
