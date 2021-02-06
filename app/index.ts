import { CommentStream, SubmissionStream } from 'snoostorm';
import { removeAbuseComment, removeSpamComment, logComment } from './comments';
import { removeSpamSubmission, logSubmission, removeSubmissionAskingForUpvotes, removeUnverifiedSellerSubmissions } from './submissions';
import { scanSubmissionsForViolations } from './one-time';
import { client } from './client';
import { log } from './log';
import { Comment, Submission } from 'snoowrap';

if (false) {
	const shouldWeIgnoreThisItem = async (item: Comment | Submission) => {
		// Ignore AutoModerator comments
		if (item.author.name === 'AutoModerator') {
			return true;
		}

		// Ignore myself
		if (item.author.name === 'AutoModSkylar') {
			return true;
		}

		// Ignore my creator
		if (item.author.name === 'OmgImAlexis') {
			return true;
		}

		return false;
	};

	const comments = new CommentStream(client, {
		subreddit: 'horny',
		limit: 10,
		pollTime: 2000
	});

	comments.on('item', async comment => {
		try {
			// Should we ignore this item?
			if (await shouldWeIgnoreThisItem(comment)) {
				return;
			}

			await logComment(comment);
			await removeSpamComment(comment);
			await removeAbuseComment(comment);
		} catch (error: unknown) {
			if (error instanceof Error) {
				log.error('Failed handling comment with "%s"', error.message);
			} else {
				log.error('Failed handling comment with "%s"', error);
			}
		}
	});

	const submissions = new SubmissionStream(client, {
		subreddit: 'horny',
		limit: 10,
		pollTime: 2000
	});

	submissions.on('item', async submission => {
		try {
			// Should we ignore this item?
			if (await shouldWeIgnoreThisItem(submission)) {
				return;
			}

			await logSubmission(submission);
			await removeSpamSubmission(submission);
			await removeSubmissionAskingForUpvotes(submission);
			await removeUnverifiedSellerSubmissions(submission);
		} catch (error: unknown) {
			if (error instanceof Error) {
				log.error('Failed handling submission with "%s"', error.message);
			} else {
				log.error('Failed handling submission with "%s"', error);
			}
		}
	});
} else {
	// This is for mass removal
	scanSubmissionsForViolations().catch(error => {
		log.error('Failed scanning hot for violations with "%s".', error);
	});
}