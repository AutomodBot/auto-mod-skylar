import Snoowrap from 'snoowrap';
import { config } from '../config';

// Store client
let client: Snoowrap;

export const getSnooClient = () => {
	if (!client) {
		// Create client
		client = new Snoowrap({
			userAgent: 'AutoModSkylar',
			username: config.snoo.username,
			password: config.snoo.password,
			clientId: config.snoo.client.id,
			clientSecret: config.snoo.client.secret
		});

		// Ensure we don't throw when we hit a rate limit
		client.config({
			continueAfterRatelimitError: true
		});
	}

	return client;
};
