import exitHook from 'exit-hook';
import { machineIdSync } from 'node-machine-id';
import { ipc } from './ipc';

export type ServiceType = 'firehose' | 'spaminator' | 'verify-me';

export type ServiceEvent = {
	id: string;
	service: ServiceType;
};
export type ServiceOnlineEvent = ServiceEvent;
export type ServiceOfflineEvent = ServiceEvent;

export class Service {
	constructor(public id: string, public type: ServiceType) {}
}

export const services: Record<string, Map<string, Service>> = {
	firehose: new Map(),
	spaminator: new Map(),
	'verify-me': new Map()
};

export const registerService = (service: string) => {
	ipc.config.id = `${service}-${machineIdSync()}`;

	// Connect to the "skylar" ipc channel
	ipc.connectTo('skylar', function () {
		ipc.of.skylar?.on('connect', function () {
			// On application "exit" send message to controller marking it as offline
			exitHook(() => {
				ipc.of.skylar?.emit('service-offline', {
					id: ipc.config.id,
					service
				});
			});

			// Log for debugging
			console.log('Connected to controller!');

			// Register self with controller
			ipc.of.skylar?.emit('service-online', {
				id: ipc.config.id,
				service
			});
		});
	});
};
