/* eslint-disable curly */
const config = {
	subreddit: {
		name: process.env.SUBREDDIT_NAME
	},
	snoo: {
		username: process.env.SNOO_USERNAME,
		password: process.env.SNOO_PASSWORD,
		client: {
			id: process.env.SNOO_CLIENT_ID,
			secret: process.env.SNOO_CLIENT_SECRET
		}
	}
};

let notSet: string | undefined;

if (!config.subreddit.name) notSet = 'SUBREDDIT_NAME';
if (!config.snoo.username) notSet = 'SNOO_USERNAME';
if (!config.snoo.password) notSet = 'SNOO_PASSWORD';
if (!config.snoo.client.id) notSet = 'SNOO_CLIENT_ID';
if (!config.snoo.client.secret) notSet = 'SNOO_CLIENT_SECRET';

if (notSet) {
	console.log('SNOO_USERNAME env is not set');
	process.exit(1);
}

export {
	config
};
