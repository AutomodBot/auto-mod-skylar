import { Comment } from 'snoowrap';
import { utils } from '../utils';

const { banUser } = utils;

export const removeSpamSubreddits = async (comment: Comment) => {
	const spamSubreddits = [
		'r/dirty18girls',
		'r/bestofyoungnsfwreddit',
		'r/Sexybabesgonewild',
		'r/TikTokGirlSex',
		'r/Youngbabesgonewild',
		'r/Gonewildhotchicks',
		'r/CasualsHookups'
	];

	if (spamSubreddits.some(spamSubreddit => comment.body.toLowerCase().includes(spamSubreddit))) {
		// Remove the original comment
		await comment.remove({
			spam: true
		});

		// Ban commenter
		await banUser('horny', comment.author.name);
	}
};
