import { log as logger } from '../log';

export const log = logger.createChild({
	prefix: 'submission'
});

export const spamLogger = log.createChild({
	prefix: 'spam'
});

export * from './log-submission';
export * from './record-submission-stats';
export * from './remove-spam-submission';
export * from './remove-stolen-submission';
export * from './remove-submission-asking-for-upvotes';
export * from './remove-submissions-by-deleted-users';
export * from './remove-unverified-seller-submissions';
export * from './stats';
