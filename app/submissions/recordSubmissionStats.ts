import { Submission } from 'snoowrap';
import { getFlair } from '../utils';
import { log } from './index';
import { stats } from '../submissions';

export const recordSubmissionStats = async (submission: Submission) => {
	try {
		const flair = await getFlair('horny', submission.author.name);
		const stat = stats.has(flair.flair_text as any);
		if (stat) {
			const value = stats.get(flair.flair_text as any)!;
			stats.set(flair.flair_text as any, value + 1);
		}
	} catch (error: unknown) {
		log.error('Failed recording submission stats with "%s".', (error as Error).message);
	}
};
