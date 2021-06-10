const fs = require('fs');

const services = fs.readdirSync('./src/services').map(service => {
	const _ = service.split('.');
	return _[_.length - 2];
});

module.exports = {
	apps: [
		{
			namespace: 'skylar',
			name: 'controller',
			script: './dist/index.js',
			time: true,
			// eslint-disable-next-line
			append_env_to_name: true,
			instances: 1,
			autorestart: true,
			node_args : '-r dotenv/config',
			// eslint-disable-next-line
			max_restarts: 5,
			watch: false,
			// eslint-disable-next-line
			max_memory_restart: '100M',
			env: {
				NODE_ENV: 'production'
			}
		},
		...services.map(service => ({
			namespace: 'skylar',
			name: service,
			script: `./dist/${service}.js`,
			time: true,
			// eslint-disable-next-line
			append_env_to_name: true,
			instances: 1,
			autorestart: true,
			node_args : '-r dotenv/config',
			// eslint-disable-next-line
			max_restarts: 1,
			watch: false,
			// eslint-disable-next-line
			max_memory_restart: '100M',
			env: {
				NODE_ENV: 'production'
			}
		}))
	]
};
