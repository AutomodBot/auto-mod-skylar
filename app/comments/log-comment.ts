import { Comment } from 'snoowrap';
import { utils } from '../utils';

const { getFlair, log } = utils;

export const logComment = async (comment: Comment) => {
	const flair = await getFlair('horny', comment.author.name);
	log.info('ℹ️ [COMMENT:%s][AUTHOR:%s][%s][%s]', comment.id, comment.author.name, flair.flair_text, comment.body.replace(/\n$/, '↵'));
};
