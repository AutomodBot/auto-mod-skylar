import { Submission } from 'snoowrap';
import dedent from 'dedent';
import { client } from '../client';
import { utils } from '../utils';

const { match, log } = utils;

export const removeStolenSubmission = async (submission: Submission) => {
	if (await match(submission, [
		'kayx1010'
	], submission.title.toLowerCase())) {
		await Promise.allSettled([
			async () => {
				// Comment on the submission to let them know why it was removed
				const comment = await submission.reply(dedent`
					I'm pretty sure this is stolen content and/or the person posting this is a known scammer.
					If this was a false positive please send a message to the humans who run this sub via mod mail and they'll look into it.
				`).catch(error => {
					log.debug('❌ [FUNC:REMOVE_STOLEN_SUBMISSION:REMOVE_COMMENT:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
				});

				// Sticky comment
				if (comment) {
					await client.getComment(comment.id).distinguish({
						sticky: true
					});
				}
			},
			async () => {
				// Remove the submission
				await submission.remove().catch(error => {
					log.debug('❌ [FUNC:REMOVE_STOLEN_SUBMISSION:REMOVE_SUBMISSION:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
				});
			}
		]);
	}
};
