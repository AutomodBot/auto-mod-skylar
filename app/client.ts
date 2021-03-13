import Snoowrap from 'snoowrap';

const client = new Snoowrap({
	userAgent: 'AutoModSkylar',
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET
});

// Ensure we don't throw when we hit a rate limit
client.config({
	continueAfterRatelimitError: true
});

export {
	client
};
