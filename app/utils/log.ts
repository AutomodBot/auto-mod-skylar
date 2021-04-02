const isProduction = process.env.NODE_ENV === 'production';

// eslint-disable-next-line
const noop = () => {};

export const log = {
	info: console.info,
	debug: isProduction ? noop : console.debug,
	error: console.error
};
