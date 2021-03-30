import { Submission } from 'snoowrap';
import { getFlair, match } from '../utils';
import { spamLogger } from './index';

export const removeSubmissionAskingForUpvotes = async (submission: Submission) => {
	if (await match(submission, ['Upvote', 'up-vote', 'up vote', 'upovte'], submission.title)) {
		const flair = await getFlair('horny', submission.author.name);
		spamLogger.debug('%s [%s] %s', submission.author.name, flair.flair_text, submission.permalink);
		// Remove post
		await submission.remove({
			spam: true
		});
	}
};
