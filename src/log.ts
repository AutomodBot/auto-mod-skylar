import chalk from 'chalk';

const isProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line
const noop = () => {};

export const log = {
	// Yes this is a cheap way todo this but eh
	info: (message?: any, ...optionalParams: any[]) => {
		if (typeof message === 'string') {
			// Match the start of our info blocks
			message = message.replace('[SUBMISSION', '[' + chalk.magenta('SUBMISSION'));
			message = message.replace('[COMMENT', '[' + chalk.cyan('COMMENT'));
		}

		console.info(message, ...optionalParams);
	},
	debug: isProduction ? noop : console.debug,
	error: console.error,
	warn: (message?: any, ...optionalParams: any[]) => {
		if (typeof message === 'string') {
			// Match the start of our info blocks
			message = message.replace('[SUBMISSION', '[' + chalk.magenta('SUBMISSION'));
			message = message.replace('[COMMENT', '[' + chalk.cyan('COMMENT'));
		}

		console.warn(message, ...optionalParams);
	}
};

// Return true/false depending if debug logs get enabled
export const toggleDebugLogs = () => {
	// Enable debug logs
	if (log.debug === noop) {
		log.debug = console.debug;
		return true;
	}

	// Disable debug logs
	log.debug = noop;
	return false;
};
