import { CommentStream, SubmissionStream } from 'snoostorm';
import { client } from './client';
import { subreddit as subredditName } from './config';
import { utils } from './utils';
import { queue } from './queues';

const { log } = utils;
const collectors = {
	live: async () => {
		// ,
		// const comments = new CommentStream(client, {
		// 	subreddit: subredditName,
		// 	limit: 1000,
		// 	pollTime: 10000
		// });

		// // Push each comment to the queue
		// comments.on('item', async item => {
		// 	log.info('Adding comment [%s]', item.id);
		// 	queue.add({
		// 		id: item.id,
		// 		status: 'idle',
		// 		type: 'comment',
		// 		item
		// 	});
		// });

		const submissions = new SubmissionStream(client, {
			subreddit: subredditName,
			limit: 100,
			pollTime: 10000
		});

		// Push each submission to the queue
		submissions.on('item', async item => {
			log.debug('ℹ️  [COLLECTOR:SUBMISSION:ADD][%s]', item.id);
			queue.add({
				id: item.id,
				status: 'idle',
				type: 'submission',
				item
			});
		});
	},
	massscan: async () => {
		const subreddit = client.getSubreddit(`/r/${subredditName}`);

		// Submissions
		const submissions = await subreddit.getHot({
			limit: 5000
		});

		// Push all to the queue
		submissions.forEach(item => {
			log.debug('ℹ️  [COLLECTOR:SUBMISSION:ADD][%s]', item.id);
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
	log.debug('✅ [COLLECTOR:%s:STARTED]', collector.toUpperCase());
	collectors[collector]().catch(error => {
		log.debug('❌ [COLLECTOR:%s:ERROR][%s]', collector.toUpperCase(), error);
	});
};

export const app = async () => {
	// Ensure the app runs even if the queue finishes
	process.stdin.resume();

	// Start queue
	queue.start().catch(error => {
		log.debug('❌ [QUEUE:ERROR][%s]', error);
	});

	// Start collectors
	await Promise.all([
		// ,
		// startCollector('massscan')
		// // ,
		startCollector('live')
	]).catch(error => {
		log.debug('❌ [COLLECTOR:ERROR][%s]', error);
	});
};
