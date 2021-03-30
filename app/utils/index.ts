import { decorate } from './decorate';
import { trace } from './trace';
import { Comment, Submission } from 'snoowrap';
import { Task } from '../queues/task';
import EnhancedMap from 'enmap';

const flairCache = new EnhancedMap('flair-cache');

const utils = {
	log: console,
	/**
	 * Sleep for ms
	 */
	async sleep(ms: number) {
		return new Promise<void>(resolve => {
			setTimeout(() => {
				resolve();
			}, ms);
		});
	},
	async random() {
		const toWait = Math.random() ? Math.random() * 1000 : Math.random();
		this.log.info('Waiting %sms', toWait);
		await this.sleep(toWait);
		return Math.random();
	},
	async getClient() {
		const { client } = await import('../client');
		return client;
	},
	async shouldWeIgnoreThisTask(task: Task) {
		// Ignore AutoModerator posts
		if (task.item.author.name === 'AutoModerator') {
			this.log.debug('ℹ️ [TASK:IGNORED][AUTHOR:AutoModerator][%s]', task.item.id);
			return true;
		}

		// Ignore myself
		if (task.item.author.name === 'AutoModSkylar') {
			this.log.debug('ℹ️ [TASK:IGNORED][AUTHOR:AutoModSkylar][%s]', task.item.id);
			return true;
		}

		// Ignore my creator
		if (task.item.author.name === 'OmgImAlexis') {
			this.log.debug('ℹ️ [TASK:IGNORED][AUTHOR:OmgImAlexis][%s]', task.item.id);
			return true;
		}

		return false;
	},
	async getFlair(subreddit: string, name: string) {
		const flairKey = `${subreddit}_${name}`;
		const isFlairCached = flairCache.has(flairKey);

		// If missing cache it
		if (!isFlairCached) {
			const client = await this.getClient();
			const flair = await client.getSubreddit(subreddit).getUserFlair(name);
			flairCache.set(flairKey, flair);
			return flair;
		}

		// Return cached flair
		return flairCache.get(flairKey);
	},
	async getDescription(name: string) {
		const client = await this.getClient();
		const user = await client.getUser(name).fetch();
		return String(user.toJSON().subreddit?.public_description);
	},
	async banUser(subreddit: string, name: string, options?: {
		notes?: {
			user?: string;
			mod?: string;
		};
		reason?: string;
		duration?: number;
	}) {
		this.log.info('banning %s in %s', name, subreddit);

		const banUserOptions = {
			name,
			...(options?.notes?.mod ? {
				banNote: options.notes.mod
			} : {}),
			...(options?.notes?.user ? {
				memberNote: options.notes.user
			} : {}),
			...(options?.reason ? {
				banReason: options.reason
			} : {})
		};
		const client = await this.getClient();
		return client.getSubreddit(subreddit).banUser(banUserOptions);
	},
	async match<Item = Submission | Comment>(item: Item, needles: any[], haystack: string): Promise<Item | false> {
		if (!needles.some(needle => haystack.includes(needle))) {
			return false;
		}

		return item;
	},
	async matchAndRemove(item: Submission | Comment, needles: any[], haystack: string) {
		if (await this.match(item, needles, haystack)) {
			await item.remove({
				spam: true
			});
		}
	},
	async removeUnverifiedSellerSubmission(submission: Submission) {
		// Comment on the submission to let them know why it was removed
		this.log.debug('⚠️ [SUBMISSION:SELLER_DETECTED][AUTHOR:%s][%s]', submission.author.name, submission.id);
		const message = 'You\'ve been marked as a possible seller. Please follow the instructions in the [wiki](http://reddit.com/r/horny/wiki/verification) to be verified.';
		const comment = await submission.reply(message).catch(error => {
			this.log.debug('❌ [SUBMISSION:SELLER_DETECTED:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
		});

		// Sticky comment
		if (comment) {
			const client = await this.getClient();
			await client.getComment(comment.id).distinguish({
				sticky: true
			});
		}

		// Remove the submission
		await submission.remove().catch(error => {
			this.log.debug('❌ [SUBMISSION:SELLER_DETECTED:ERROR][AUTHOR:%s][%s]', submission.author.name, error);
		});
	}
};

// Apply trace to utils in non-production
if (process.env.NODE_ENV !== 'production') {
	decorate([trace()], utils, 'banUser', 1);
	decorate([trace()], utils, 'getDescription', 1);
	decorate([trace()], utils, 'getFlair', 1);
	decorate([trace()], utils, 'match', 1);
	decorate([trace()], utils, 'matchAndRemove', 1);
	decorate([trace()], utils, 'random', 1);
	decorate([trace()], utils, 'removeUnverifiedSellerSubmission', 1);
	decorate([trace()], utils, 'shouldWeIgnoreThisTask', 1);
	decorate([trace()], utils, 'sleep', 1);
}

export {
	utils
};
