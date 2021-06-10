/* eslint-disable curly */
import dedent from 'dedent';
import { execAll } from '../exec-all';
import { toRegex } from 'to-regex';
import { getSnooClient } from '../clients/snoo';
import { config } from '../config';
import { ipc } from '../ipc';
import { registerService } from '../service';
import type { Submission } from '../types/submission';

// Register service with controller over ipc
registerService('verify-me');

let started = false;

// Start service
ipc.of.skylar?.on('start-service', function () {
	started = true;
});

const sellerKeywords = [
	'onlyfans',
	'cash app',
	'allmylinks',
	'only fans',
	'custom content',
	'dropbox',
	'premium',
	'selling',
	'cashapp',
	'cash.app',
	'i sell',
	'frisk.chat',
	'buy content'
];

const removePost = async function (postId: string, message?: string) {
	const client = getSnooClient();
	const submission = client.getSubmission(postId);

	// Comment on the submission to let them know why it was removed
	if (message) {
		const comment = await submission.reply(message);

		// Sticky the mod comment
		if (comment) {
			await client.getComment(comment.id).distinguish({
				sticky: true
			});
		}
	}

	// Remove the submission
	await submission.remove();
};

const removeUnverifiedSellerPost = async function (postId: string) {
	return removePost(postId, dedent`
		You've been marked as a possible seller. Please follow the instructions in the [wiki](http://reddit.com/r/horny/wiki/verification) to be verified.
	`);
};

const sellerRegex = toRegex(sellerKeywords, { contains: true });

ipc.of.skylar?.on('new-submission', async function (data: Submission) {
	try {
		if (!started) return;
		const client = getSnooClient();
		const userFlair = await client.getSubreddit(config.subreddit.name!).getUserFlair(data.author);
		const userFlairText = userFlair.flair_text?.toLowerCase();

		// Member is already verified as a seller
		if (userFlairText === 'seller') {
			console.log('verified seller posted https://reddit.com/u/%s', data.author);
			return;
		}

		// Member is unverified and has been previously detected as a seller
		// Remove their post and add a comment stating they need to verify
		if (userFlairText === 'unverified seller') {
			await removeUnverifiedSellerPost(data.id);
			console.log('unverified seller posted, removed their post https://reddit.com/u/%s', data.author);
			return;
		}

		// Get user
		const user = await client.getUser(data.author).fetch().catch(() => {
			console.log('Failed to fetch user /u/%s', data.author);
			return null;
		});

		// User is likely suspended
		if (!user) {
			await removePost(data.id);
			console.log('failed looking up user\'s profile, user likely suspended https://reddit.com/u/%s', data.author);
			return;
		}

		// Get author's profile description
		const userProfileDescription = user.toJSON().subreddit?.public_description ?? '';

		// Check if the author has any known seller keywords in their description
		const matches = execAll(sellerRegex, userProfileDescription);
		if (matches.length >= 1) {
			await removeUnverifiedSellerPost(data.id);
			console.log('detected new unverified seller without flair https://reddit.com/u/%s', data.author, matches);
			return;
		}

		// Get author's submissions
		const submissions = await user.getSubmissions();

		// Check if the author has any known seller keywords in their submissions
		const sellerSubmissions = submissions.filter(submission => {
			const titleMatches = execAll(sellerRegex, submission.title);
			const bodyMatches = execAll(sellerRegex, submission.selftext);
			return (titleMatches.length >= 1 || bodyMatches.length >= 1);
		});
		if (sellerSubmissions.length >= 1) {
			await removeUnverifiedSellerPost(data.id);
			console.log('detected new unverified seller without flair https://reddit.com/u/%s', data.author, sellerSubmissions);
			return;
		}

		console.log('non-seller posted https://reddit.com/u/%s', data.author);
	} catch (error: unknown) {
		console.error('failed processing submission', error);
	}
});

// Stop service
ipc.of.skylar?.on('stop-service', function (data) {
	// Kill process
	process.exit(0);
});
