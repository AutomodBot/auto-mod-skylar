import { Submission } from 'snoowrap';
import { utils } from '../utils';

const { getFlair, log } = utils;

export const logSubmission = async (submission: Submission) => {
	const flair = await getFlair('horny', submission.author.name);
	log.info('ℹ️  [SUBMISSION:%s][AUTHOR:%s][%s][%s]', submission.id, submission.author.name, flair.flair_text, submission.title);
};
