import { Submission } from 'snoowrap';
import { client } from '../client';
import { log as logger } from '../log';
import { getDescription, getFlair, match, matchAndRemove, removeUnverifiedSellerSubmission } from '../utils';

const log = logger.createChild({
	prefix: 'submissions'
});

const spamLogger = log.createChild({
	prefix: 'spam'
});

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

export const removeUnverifiedSellerSubmissions = async (submission: Submission) => {
	const name = String(submission.author.name);
	const flair = await getFlair('horny', submission.author.name);

	// Skip reddit's automod message
	if (name === 'AutoModerator') {
		log.silly('Skipping submission by /u/AutoModerator.');
		return;
	}

	// Skip seller's message's
	if (String(flair.flair_text).toLowerCase() === 'seller') {
		log.silly('Skipping submission by /u/%s as they\'re a seller.', name);
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
		// user flair and have "onlyfans" in their profile description
		const description = await getDescription(submission.author.name);
		if (await match(submission, [
			'onlyfans',
			'cash app',
			'allmylinks',
			'only fans'
		], description.toLowerCase())) {
			log.debug('Setting user flair to "UNVERIFIED seller" for /u/%s as they have a known site in their profile description.', name);
			// Set user's flair
			// @ts-expect-error
			await client._selectFlair({
				subredditName: 'horny',
				name,
				flair_template_id: '3d7f8042-39be-11eb-910f-0eb386cc13ed'
			}).catch((error: unknown) => {
				log.error('Failed assigning user flair to /u/%s with "%s"', name, (error as Error).message);
			});

			// Remove post
			await removeUnverifiedSellerSubmission(submission);
			return;
		}

		// No flair and we couldn't anything that points to them being a seller
		log.silly('Skipping submission by /u/%s as they have no user flair and we don\'t think they\'re a seller.', name);
	}
};
