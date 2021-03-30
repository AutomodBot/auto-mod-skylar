import { Submission } from 'snoowrap';
import dedent from 'dedent';
import { client } from '../client';
import { match } from '../utils';
import { log } from './index';

export const removeSketchySubmission = async (submission: Submission) => {
	if (await match(submission, [
		'barely legal',
		'barly legal',
		'bearly legal',
		'barely lagel',
		'underage',
		'minor',
		'kid',
		'child',
		'under18'
	], submission.title.toLowerCase())) {
		// T
		// await Promise.allSettled([
		// 	async () => {
		// 		// Comment on the submission to let them know why it was removed
		// 		const comment = await submission.author

		// 		// Sticky comment
		// 		if (comment) {
		// 			await client.getComment(comment.id).distinguish({
		// 				sticky: true
		// 			});
		// 		}
		// 	},
		// 	async () => {
		// 		// Remove the submission
		// 		await submission.remove().catch(error => {
		// 			log.error('Failed removing stolen submission with "%s".', (error as Error).message);
		// 		});
		// 	}
		// ]);
	}
};
