import { Submission } from 'snoowrap';
import { ipc } from '../ipc';
import { registerService } from '../service';

// Register service with controller over ipc
registerService('spaminator');

// Start service
ipc.of.skylar?.on('start-service', function (data) {
	ipc.of.skylar?.on('new-submission', function (data: Submission) {
		// |
		// console.log('new-submission');
	});
});

// Stop service
ipc.of.skylar?.on('stop-service', function (data) {
	// Kill process
	process.exit(0);
});
