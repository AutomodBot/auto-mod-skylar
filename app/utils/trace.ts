import prettyMs from 'pretty-ms';
import { performance } from 'perf_hooks';

export const trace = () => {
	return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const targetMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const start = performance.now();
			const returnValue = targetMethod.apply(this, args);
			return Promise.resolve(returnValue).finally(() => {
				const end = performance.now();
				const timeTaken = prettyMs(end - start, { formatSubMilliseconds: true, compact: true });
				console.debug('ℹ️ [DEBUG][TRACE][%s][%s]', propertyKey, timeTaken);
			});
		};

		return descriptor;
	};
};