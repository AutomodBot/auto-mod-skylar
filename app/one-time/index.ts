import pThrottle from 'p-throttle';
import { Submission } from 'snoowrap';
import { client } from '../client';
import { log } from '../log';
import { getDescription, getFlair, match } from '../utils';
import { removeUnverifiedSellerSubmissions } from '../submissions';

const onceASecond = pThrottle({
	limit: 1,
	interval: 1000
});

export const scanSubmissionsForViolations = async () => {
	const subreddit = client.getSubreddit('horny');
	const submissions = await subreddit.getHot({
		limit: 200
	});
	const throttled = onceASecond(async index => {
		await removeUnverifiedSellerSubmissions(submissions[index]).catch(error => {
			log.error('Failed processing submission with "%s"', error.message);
		});
	});

	// Process the submissions
	log.silly('Got %s submissions from the hot list, processing...', submissions.length);
	for (let index = 0; index < submissions.length; index++) {
		throttled(index);
	}
};
