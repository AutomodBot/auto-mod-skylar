import { CommentStream, SubmissionStream } from 'snoostorm';
import { getClient } from './client';
import { subreddit as subredditName } from './config';
import { log } from './log';
import { queue } from './queues';

const collectors = {
	live: async () => {
		// Comments
		const comments = new CommentStream(getClient(), {
			subreddit: subredditName,
			limit: 500,
			pollTime: 30000
		});

		// Push each comment to the queue
		comments.on('item', async item => {
			log.info('ℹ️  [COLLECTOR:COMMENT:ADD][%s]', item.id);
			queue.add({
				id: item.id,
				status: 'idle',
				type: 'comment',
				item
			});
		});

		const submissions = new SubmissionStream(getClient(), {
			subreddit: subredditName,
			limit: 100,
			pollTime: 10000
		});

		// Push each submission to the queue
		submissions.on('item', async item => {
			log.info('ℹ️  [COLLECTOR:SUBMISSION:ADD][%s]', item.id);
			queue.add({
				id: item.id,
				status: 'idle',
				type: 'submission',
				item
			});
		});
	},
	massscan: async () => {
		const subreddit = getClient().getSubreddit(`/r/${subredditName}`);

		// Submissions
		const submissions = await subreddit.getHot({
			limit: 5000
		});

		// Push all to the queue
		submissions.forEach(item => {
			log.info('ℹ️  [COLLECTOR:SUBMISSION:ADD][%s]', item.id);
			queue.add({
				id: item.id,
				status: 'idle',
				type: 'submission',
				item
			});
		});

		// // Comments
		// const comments = await subreddit.getNewComments({
		// 	limit: 50
		// });

		// // Push all to the queue
		// comments.forEach(item => {
		// 	log.info('Adding comment [%s]', item.id);
		// 	queue.add({
		// 		id: item.id,
		// 		status: 'idle',
		// 		type: 'comment',
		// 		item
		// 	});
		// });
	}
};

export const startCollector = async (collector: 'live' | 'massscan') => {
	if (!Object.keys(collectors).includes(collector)) {
		throw new TypeError(`Expected "live" or "massscan" got "${collector}".`);
	}

	// Start collector
	log.info('✅ [COLLECTOR:%s:STARTED]', collector.toUpperCase());
	collectors[collector]().catch(error => {
		log.error('❌ [COLLECTOR:%s:ERROR][%s]', collector.toUpperCase(), error);
	});
};

export const app = async () => {
	// Ensure the app runs even if the queue finishes
	process.stdin.resume();

	// Start queue
	queue.start().catch(error => {
		log.error('❌ [QUEUE:ERROR][%s]', error);
	});

	// Start collectors
	await Promise.all([
		// ,
		// startCollector('massscan')
		// // ,
		startCollector('live')
	]).catch(error => {
		log.error('❌ [COLLECTOR:ERROR][%s]', error);
	});
};
