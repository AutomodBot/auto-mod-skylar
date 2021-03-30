import { Submission } from 'snoowrap';
import { utils } from '../utils';

const { match } = utils;

export const removeSubmissionAskingForUpvotes = async (submission: Submission) => {
	if (await match(submission, ['Upvote', 'up-vote', 'up vote', 'upovte'], submission.title)) {
		// Remove post
		await submission.remove({
			spam: true
		});
	}
};
