import { Comment } from 'snoowrap';
import { utils } from '../utils';

const { getFlair } = utils;

export const removeSpamDomains = async (comment: Comment) => {
	const spamDomains = ['discord.gg', 'discord.com'];
	if (spamDomains.some(spamDomain => comment.body.includes(spamDomain))) {
		const flair = await getFlair('horny', comment.author.name);

		// Post comment as reply
		await comment.reply('**DO NOT POST DISCORD SPAM!**');

		// Remove the original comment
		await comment.remove({
			spam: true
		});
	}
};
