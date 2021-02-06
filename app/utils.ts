import { Logger } from 'logger';
import { Comment, Submission } from 'snoowrap';
import { client } from './client';

export const getDescription = async (name: string) => {
	const user = await client.getUser(name).fetch();
	return String(user.toJSON().subreddit?.public_description);
};

export const getFlair = async (subreddit: string, name: string) => {
	const flair = await client.getSubreddit(subreddit).getUserFlair(name);
	return flair;
};

export const match = async<Item = Submission | Comment> (item: Item, needles: any[], haystack: string): Promise<Item | false> => {
	if (!needles.some(needle => haystack.includes(needle))) {
		return false;
	}

	return item;
};

export const matchAndRemove = async (item: Submission | Comment, needles: any[], haystack: string, spamLogger: Logger) => {
	if (await match(item, needles, haystack)) {
		const flair = await getFlair('horny', item.author.name);
		spamLogger.debug('%s [%s] %s', item.author.name, flair.flair_text, item.permalink);
		// Await item.reply('**DO NOT POST DISCORD SPAM!**');
		// await item.remove({
		// 	spam: true
		// });
	}
};

export const removeUnverifiedSellerSubmission = async (submission: Submission) => {
	// Comment on the submission to let them know why it was removed
	const message = 'You\'ve been marked as a possible seller. Please follow the instructions in the [wiki](http://reddit.com/r/horny/wiki/verification) to be verified.';
	const comment = await submission.reply(message);

	// Sticky comment
	await client.getComment(comment.id).distinguish({
		sticky: true
	});

	// Remove the submission
	await submission.remove();
};
