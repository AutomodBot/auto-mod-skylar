import { Submission } from 'snoowrap';
import { client } from '../client';
import { getDescription, getFlair, match, removeUnverifiedSellerSubmission } from '../utils';
import { log } from './index';

export const removeUnverifiedSellerSubmissions = async (submission: Submission) => {
	try {
		const name = String(submission.author.name);
		const flair = await getFlair('horny', submission.author.name);

		// Skip seller's message's
		if (String(flair.flair_text).toLowerCase() === 'seller') {
			log.silly('Skipping submission by u/%s as they\'re a seller.', name);
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
				log.info('Setting user flair to "UNVERIFIED seller" for u/%s as they have a known site or phrase in their profile description.', name);
				// Set user's flair
				// @ts-expect-error
				await client._selectFlair({
					subredditName: 'horny',
					name,
					flair_template_id: '3d7f8042-39be-11eb-910f-0eb386cc13ed'
				}).catch((error: unknown) => {
					log.error('Failed assigning user flair to u/%s with "%s"', name, (error as Error).message);
				});

				// Remove post
				await removeUnverifiedSellerSubmission(submission);
				return;
			}

			// No flair and we couldn't anything that points to them being a seller
			log.info('Skipping submission by u/%s as they have no user flair and we don\'t think they\'re a seller.', name);
		}
	} catch (error: unknown) {
		log.error('Failed processing submission with "%s"', (error as Error).message);
	}
};
