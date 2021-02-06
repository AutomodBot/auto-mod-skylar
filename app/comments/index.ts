import { Comment } from 'snoowrap';
import { log as logger } from '../log';
import { getFlair } from '../utils';

const log = logger.createChild({
	prefix: 'comments'
});

const spamLogger = log.createChild({
	prefix: 'spam'
});

export const logComment = async (comment: Comment) => {
	const flair = await getFlair('horny', comment.author.name);
	log.silly('%s %s"%s"', comment.author.name, flair.flair_text ? `[${flair.flair_text}] ` : '', comment.body);
};

const removeSpamDomains = async (comment: Comment) => {
	const spamDomains = ['discord.gg', 'discord.com'];
	if (spamDomains.some(spamDomain => comment.body.includes(spamDomain))) {
		const flair = await getFlair('horny', comment.author.name);

		// Post comment as reply
		spamLogger.debug('%s [%s] %s', comment.author.name, flair.flair_text, comment.permalink);
		await comment.reply('**DO NOT POST DISCORD SPAM!**');

		// Remove the original comment
		await comment.remove({
			spam: true
		});
	}
};

export const removeSpamComment = async (comment: Comment) => {
	await removeSpamDomains(comment);
};

export const removeAbuseComment = async (comment: Comment) => {
//   Title (includes):
//   [
//     "stolen",
//     "leaked"
//   ]
// action: remove
// action_reason: spam
};
