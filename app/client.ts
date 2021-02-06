import Snoowrap from 'snoowrap';

export const client = new Snoowrap({
	userAgent: 'AutoModSkylar',
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
	clientId: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET
});
