import { ipc } from './ipc';
import { Service, ServiceOfflineEvent, ServiceOnlineEvent, services } from './service';

// IPC server
const server = function () {
	// Service has come online
	ipc.server.on('service-online', function (data: ServiceOnlineEvent, socket: any) {
		// Grab the service type
		const service = data.service;

		// If we don't have a field for this service then don't allow it to register
		if (!services[service]) {
			return;
		}

		// Register service with controller
		services[service].set(data.id, new Service(data.id, data.service));

		// Log message
		console.log(`service-online: ${data.id}`);

		// Start the service
		ipc.server.emit(socket, 'start-service');
	});

	// Service has gone offline
	ipc.server.on('service-offline', function (data: ServiceOfflineEvent, socket: any) {
		// Grab the service type
		const service = data.service;

		// Register service with controller
		services[service].delete(data.id);

		// Log message
		console.log(`service-offline: ${data.id}`);
	});

	// Relay new-submission event to all connected clients
	ipc.server.on('new-submission', function (data: any) {
		// @ts-expect-error
		ipc.server.broadcast('new-submission', data);
	});
};

// Start ipc server
ipc.serve(server);
ipc.server.start();
