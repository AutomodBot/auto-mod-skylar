import { SubmissionStream, CommentStream } from 'snoostorm';
import { config } from '../config';
import { getSnooClient } from '../clients/snoo';
import { registerService } from '../service';
import { ipc } from '../ipc';

// Register service with controller over ipc
registerService('firehose');

// Start service
ipc.of.skylar?.on('start-service', function (data) {
	console.log('starting service');
	const client = getSnooClient();

	// Get submissions
	const submissions = new SubmissionStream(client, {
		subreddit: config.subreddit.name,
		limit: 100,
		pollTime: 60_000
	});

	// Push each submission to the queue
	submissions.on('item', async item => {
		// Don't process AutoModerator, AutoModSkylar or OmgImAlexis' submissions
		const authorName = item.author.name.toLowerCase();
		if (['automoderator', 'automodskylar', 'omgimalexis'].includes(authorName)) {
			return;
		}

		ipc.of.skylar?.emit('new-submission', item);
	});

	// Get comments
	const comments = new CommentStream(client, {
		subreddit: config.subreddit.name,
		limit: 100,
		pollTime: 60_000
	});

	// Push each comment to the queue
	comments.on('item', async item => {
		// Don't process AutoModerator, AutoModSkylar or OmgImAlexis' comments
		const authorName = item.author.name.toLowerCase();
		if (['automoderator', 'automodskylar', 'omgimalexis'].includes(authorName)) {
			return;
		}

		ipc.of.skylar?.emit('new-comment', item);
	});
});

// Stop service
ipc.of.skylar?.on('stop-service', function (data) {
	// Kill process
	process.exit(0);
});
