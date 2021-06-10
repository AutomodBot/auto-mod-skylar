import { IPC } from 'node-ipc';

const ipc = new IPC();

// The name of this service
ipc.config.id = 'skylar';
ipc.config.silent = true;
ipc.config.retry = 1500;

export { ipc };
