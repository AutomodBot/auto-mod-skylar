import { Submission } from 'snoowrap';
import { getFlair } from '../utils';
import { log } from './index';

export const logSubmission = async (submission: Submission) => {
	const flair = await getFlair('horny', submission.author.name);
	log.silly('%s %s"%s"', submission.author.name, flair.flair_text ? `[${flair.flair_text}] ` : '', submission.title);
};
