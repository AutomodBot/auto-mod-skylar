type DecoratorFunction = (_target: Record<string, any>, _propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

// Borrowed from Typescript's compiler <3
// https://github.com/microsoft/TypeScript/search?q=__decorate
export const decorate = (decorators: DecoratorFunction[], target: Record<string, any>, propertyKey: string, kind: number) => {
	let result = kind > 1 ? undefined : kind ? Object.getOwnPropertyDescriptor(target, propertyKey) : target;
	for (let index = decorators.length - 1, decorator; index >= 0; index--) {
		decorator = decorators[index];
		if (decorator) {
			result = (kind ? decorator(target, propertyKey, result) : decorator(result)) || result;
		}
	}

	if (kind && result) {
		Object.defineProperty(target, propertyKey, result);
	}

	return result;
};
