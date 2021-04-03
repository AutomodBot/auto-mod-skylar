import dedent from 'dedent';
import { Submission } from 'snoowrap';
import { getClient } from '../client';
import { utils } from '../utils';

const { match, log } = utils;

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
		'under18',
		'loli',
		'kids',
		'kiddy',
		'wickr',
		'no limits'
	], submission.title.toLowerCase())) {
		// Remove post and add a stickied comment stating why it was removed
		await Promise.allSettled([
			async () => {
				// Comment on the submission to let them know why it was removed
				const comment = await submission.reply(dedent`
					The title of this post violates our community guidelines. Please re-read by clicking [here](https://www.reddit.com/r/horny/wiki/guidelines/community) or by visiting our wiki.
				`).catch(error => {
					log.error('❌ [FUNC:REMOVE_SKETCHY_SUBMISSION:ADD_COMMENT:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
				});

				// Post stickied comment
				if (comment) {
					await getClient().getComment(comment.id).distinguish({
						sticky: true
					});
				}
			},
			async () => {
				// Remove the submission
				await submission.remove().catch(error => {
					log.error('❌ [FUNC:REMOVE_SKETCHY_SUBMISSION:REMOVE_SUBMISSION:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
				});
			}
		]).then(() => {
			// Log post removal
			log.warn('🔞 [FUNC:REMOVE_SKETCHY_SUBMISSION:REMOVED_SUBMISSION][AUTHOR:%s][%s]', submission.author.name, submission.permalink);
		});
	}
};
