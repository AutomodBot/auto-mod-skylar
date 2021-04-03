/* eslint-disable capitalized-comments */
import pmx from '@pm2/io';
import { log, toggleDebugLogs } from '../utils/log';

// pm2 trigger auto-mod-skylar-$env toggle-debug-logs
// $env=production
pmx.action('toggle-debug-logs', (param: string, reply: (data: any) => void) => {
	toggleDebugLogs();
	reply('Toggled debug logs');
});

setInterval(function () {
	// Keep application online
}, 100);
