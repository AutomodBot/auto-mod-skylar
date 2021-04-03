import { Submission } from 'snoowrap';

export const removeSubmissionsByDeletedUsers = async (submission: Submission) => {
	const name = String(submission.author.name);
	if (name === '[deleted]') {
		await submission.remove();
	}
};
