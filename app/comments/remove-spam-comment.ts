import { Comment } from 'snoowrap';
import { removeSpamDomains } from './remove-spam-domains';
import { removeSpamSubreddits } from './remove-spam-subreddits';

export const removeSpamComment = async (comment: Comment) => {
	await removeSpamDomains(comment);
	await removeSpamSubreddits(comment);
};
