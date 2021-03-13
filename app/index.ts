import { app } from './app';
import { log } from './log';

app().catch((error: unknown) => {
	log.error('App closed with error "%s".', (error as Error).message);
});
