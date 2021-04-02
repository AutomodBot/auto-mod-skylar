import { Submission } from 'snoowrap';
import { client } from '../client';
import { utils } from '../utils';

const { getDescription, getFlair, match, removeUnverifiedSellerSubmission, log } = utils;

export const removeUnverifiedSellerSubmissions = async (submission: Submission) => {
	const name = String(submission.author.name);
	const flair = await getFlair('horny', submission.author.name);

	try {
		// Skip seller's message's
		if (String(flair.flair_text).toLowerCase() === 'seller') {
			log.debug('ℹ️  [SUBMISSION:SKIPPED][AUTHOR:%s][%s][%s]', submission.author.name, flair.flair_text, submission.title);
			return;
		}

		// "UNVERIFIED seller" that slipped through
		if (flair.flair_text === 'UNVERIFIED seller') {
			await removeUnverifiedSellerSubmission(submission);
			return;
		}

		// If they have no flair
		if (flair.flair_text === null) {
			// Mark them as an "UNVERIFIED seller" if they have no
			// user flair and have any known site or phrase in their profile description
			const description = await getDescription(submission.author.name);
			if (await match(submission, [
				'onlyfans',
				'cash app',
				'allmylinks',
				'only fans',
				'custom content',
				'dropbox',
				'premium',
				'selling',
				'cashapp',
				'cash.app',
				'i sell',
				'frisk.chat',
				'buy content'
			], description.toLowerCase())) {
				log.info('⚠️ [UNVERIFIED_SELLER_DETECTED][AUTHOR:%s][%s][%s]', submission.author.name, flair.flair_text, submission.title);
				// Set user's flair
				// @ts-expect-error
				await client._selectFlair({
					subredditName: 'horny',
					name,
					flair_template_id: '3d7f8042-39be-11eb-910f-0eb386cc13ed'
				}).catch((error: unknown) => {
					log.info('❌ [UNVERIFIED_SELLER_DETECTED:ERROR][AUTHOR:%s][%s][%s]', submission.author.name, flair.flair_text, error);
				});

				// Remove post
				await removeUnverifiedSellerSubmission(submission);
				return;
			}

			// No flair and we couldn't anything that points to them being a seller
			log.debug('ℹ️  [SUBMISSION:SKIPPED][AUTHOR:%s][%s][%s]', submission.author.name, flair.flair_text, submission.title);
		}
	} catch (error: unknown) {
		log.debug('❌ [UNVERIFIED_SELLER_DETECTED:ERROR][AUTHOR:%s][%s][%s]', submission.author.name, flair.flair_text, error);
	}
};
