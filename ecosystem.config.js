module.exports = {
	apps: [
		{
			name: 'auto-mod-skylar',
			script: 'npm start',
			time: true,
			// eslint-disable-next-line
			append_env_to_name: true,
			instances: 1,
			autorestart: true,
			// eslint-disable-next-line
			max_restarts: 50,
			watch: false,
			// eslint-disable-next-line
			max_memory_restart: '250M',
			env: {
				LOG_LEVEL: 'debug',
				NODE_ENV: 'production'
			}
		}
	],
	deploy: {
		production: {
			user: 'xo',
			host: '165.227.220.113',
			key: '~/.ssh/deploy.key',
			ref: 'origin/main',
			repo: 'https://github.com/automodbot/auto-mod-skylar',
			path: '/home/xo/code/automodbot/auto-mod-skylar',
			'pre-deploy': 'git reset --hard',
			'post-deploy': 'npm install && npm run build && pm2 startOrGracefulReload ecosystem.config.js --env production'
		}
	}
};
