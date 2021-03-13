import { Submission } from 'snoowrap';
import dedent from 'dedent';
import { client } from '../client';
import { log as logger } from '../log';
import { getDescription, getFlair, match, matchAndRemove, removeUnverifiedSellerSubmission } from '../utils';

const log = logger.createChild({
	prefix: 'submission'
});

const spamLogger = log.createChild({
	prefix: 'spam'
});

export const stats = new Map<null | 'Seller' | 'UNVERIFIED Seller', number>([
	[null, 0],
	['Seller', 0],
	['UNVERIFIED Seller', 0]
]);

export const logSubmission = async (submission: Submission) => {
	const flair = await getFlair('horny', submission.author.name);
	log.silly('%s %s"%s"', submission.author.name, flair.flair_text ? `[${flair.flair_text}] ` : '', submission.title);
};

export const removeSpamSubmission = async (submission: Submission) => {
	// Spam words
	await matchAndRemove(submission, [
		'ᴏɴʟʏғᴀɴs',
		'ᴍᴇɢᴀ',
		'ғʀᴇᴇ',
		'ʟɪɴᴋ',
		'Add her',
		'Best girl',
		'get it fast before it gets taken down',
		'nofakelink',
		'jonesandrea0056',
		'1TB',
		'Mega'
	], submission.title, spamLogger);

	// Discord spam
	await match(submission, [
		'discord.gg',
		'discord.com'
	], submission.domain).then(async submission => {
		// If the submission didn't match then bail
		if (!submission) {
			return;
		}

		// If we're a mod bail
		if (submission.author.name === 'OmgImAlexis') {
			return;
		}

		const flair = await getFlair('horny', submission.author.name);
		spamLogger.debug('%s [%s] %s', submission.author.name, flair.flair_text, submission.permalink);
		await submission.reply('**DO NOT POST DISCORD SPAM!**');
		await submission.remove({
			spam: true
		});
	});

	// Spam domains
	await matchAndRemove(submission, [
		'deepsukebe.io'
	], submission.domain, spamLogger);
};

export const removeSubmissionAskingForUpvotes = async (submission: Submission) => {
	if (await match(submission, ['Upvote', 'up-vote', 'up vote', 'upovte'], submission.title)) {
		const flair = await getFlair('horny', submission.author.name);
		spamLogger.debug('%s [%s] %s', submission.author.name, flair.flair_text, submission.permalink);
		// Remove post
		await submission.remove({
			spam: true
		});
	}
};

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
					log.error('Failed commenting on stolen submission with "%s".', (error as Error).message);
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
					log.error('Failed removing stolen submission with "%s".', (error as Error).message);
				});
			}
		]);
	}
};

export const removeSubmissionsByDeletedUsers = async (submission: Submission) => {
	const name = String(submission.author.name);
	if (name === '[deleted]') {
		log.info('[deleted] %s', submission.permalink);
		await submission.remove();
	}
};
