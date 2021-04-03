const isProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line
const noop = () => {};

export const log = {
	info: console.info,
	debug: isProduction ? noop : console.debug,
	error: console.error
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
