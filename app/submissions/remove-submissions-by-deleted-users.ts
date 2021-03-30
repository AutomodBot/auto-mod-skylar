import { Submission } from 'snoowrap';
import { log } from './index';

export const removeSubmissionsByDeletedUsers = async (submission: Submission) => {
	const name = String(submission.author.name);
	if (name === '[deleted]') {
		log.info('[deleted] %s', submission.permalink);
		await submission.remove();
	}
};
