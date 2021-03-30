import { Submission } from 'snoowrap';
import { utils } from '../utils';
import { stats } from '.';

const { getFlair, log } = utils;

export const recordSubmissionStats = async (submission: Submission) => {
	try {
		const flair = await getFlair('horny', submission.author.name);
		const stat = stats.has(flair.flair_text as any);
		if (stat) {
			const value = stats.get(flair.flair_text as any)!;
			stats.set(flair.flair_text as any, value + 1);
		}
	} catch (error: unknown) {
		log.debug('❌ [FUNC:RECORD_SUBMISSION_STATS:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
	}
};
