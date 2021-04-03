import { app } from './app';
import { log } from './log';

app().catch((error: unknown) => {
	log.debug('❌ [APP:ERROR][%s]', error);
});
