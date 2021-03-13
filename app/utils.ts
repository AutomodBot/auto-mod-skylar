import { Logger } from 'logger';
import { Comment, Submission } from 'snoowrap';
import { client } from './client';
import { log } from './log';
import { Task } from './queues/task';

export const getDescription = async (name: string) => {
	const user = await client.getUser(name).fetch();
	return String(user.toJSON().subreddit?.public_description);
};

export const getFlair = async (subreddit: string, name: string) => {
	return client.getSubreddit(subreddit).getUserFlair(name);
};

export const banUser = async (subreddit: string, name: string) => {
	console.log('banning %s in %s', name, subreddit);
	// Test
	// return client.getSubreddit(subreddit).banUser({
	// 	name,
	// 	banMessage: 'You posted subreddit spam, you\'re now banned.',
	// 	banNote: 'Posted subreddit spam.'
	// });
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
		await item.remove({
			spam: true
		});
	}
};

export const removeUnverifiedSellerSubmission = async (submission: Submission) => {
	// Comment on the submission to let them know why it was removed
	log.silly('I think %s is a seller so I\'m going to remove their submission.', submission.author.name);
	const message = 'You\'ve been marked as a possible seller. Please follow the instructions in the [wiki](http://reddit.com/r/horny/wiki/verification) to be verified.';
	const comment = await submission.reply(message).catch(error => {
		log.error('Failed commenting on a submission by an "UNVERIFIED Seller" with "%s".', (error as Error).message);
	});

	// Sticky comment
	if (comment) {
		log.silly('Marking comment as sticky and mod as distinguished.');
		await client.getComment(comment.id).distinguish({
			sticky: true
		});
	}

	// Remove the submission
	await submission.remove().catch(error => {
		log.error('Failed removing a submission by an "UNVERIFIED Seller" with "%s".', (error as Error).message);
	});
};

export const shouldWeIgnoreThisTask = async (task: Task) => {
	// Ignore AutoModerator posts
	if (task.item.author.name === 'AutoModerator') {
		log.debug('Skipping %s %s by %s as they\'re a moderator.', task.type, task.item.id, task.item.author.name);
		return true;
	}

	// Ignore myself
	if (task.item.author.name === 'AutoModSkylar') {
		log.debug('Skipping %s %s by %s as I posted this myself.', task.type, task.item.id, task.item.author.name);
		return true;
	}

	// Ignore my creator
	if (task.item.author.name === 'OmgImAlexis') {
		log.debug('Skipping %s %s by %s as they\'re a moderator.', task.type, task.item.id, task.item.author.name);
		return true;
	}

	return false;
};

export const sleepForNSeconds = async (seconds: number) => {
	return new Promise<void>(resolve => {
		setTimeout(() => {
			resolve();
		}, seconds * 1000);
	});
};
