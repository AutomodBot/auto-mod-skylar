import { app } from './app';
import { utils } from './utils';

const { log } = utils;

app().catch((error: unknown) => {
	log.debug('❌ [APP:ERROR][%s]', error);
});
