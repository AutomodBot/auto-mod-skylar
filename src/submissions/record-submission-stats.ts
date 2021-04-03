import { Submission } from 'snoowrap';
import { utils } from '../utils';
import { stats } from '.';

const { getFlair, log } = utils;

export const recordSubmissionStats = async (submission: Submission) => {
	try {
		const flair = await getFlair('horny', submission.author.name);
		const flairText = flair.flair_text;
		const stat = stats.has(flairText);
		if (stat) {
			const value = stats.get(flairText)!;
			stats.set(flairText, value + 1);
		}
	} catch (error: unknown) {
		log.debug('❌ [FUNC:RECORD_SUBMISSION_STATS:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
	}
};
