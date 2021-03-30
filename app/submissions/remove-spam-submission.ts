import { Submission } from 'snoowrap';
import { getFlair, match, matchAndRemove } from '../utils';
import { spamLogger } from './index';

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
		'Mega',
		'babynicole'
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
