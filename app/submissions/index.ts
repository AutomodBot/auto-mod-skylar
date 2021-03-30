import { log as logger } from '../log';

export const log = logger.createChild({
	prefix: 'submission'
});

export const spamLogger = log.createChild({
	prefix: 'spam'
});

export * from './log-submission';
export * from './recordSubmissionStats';
export * from './removeSpamSubmission';
export * from './removeStolenSubmission';
export * from './removeSubmissionAskingForUpvotes';
export * from './remove-submissions-by-deleted-users';
export * from './removeUnverifiedSellerSubmissions';
export * from './stats';
