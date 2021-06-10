/**
 * This is a manual import of "execall"
 * as it's not playing nicely with tsup/esbuild and commonjs
 */

function isRegexp(value: unknown): value is RegExp {
	return Object.prototype.toString.call(value) === '[object RegExp]';
}

const flagMap = {
	global: 'g',
	ignoreCase: 'i',
	multiline: 'm',
	dotAll: 's',
	sticky: 'y',
	unicode: 'u'
};

interface Options {
	/**
	Modifies the [`source`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/source) property of the cloned `RegExp` instance.
	*/
	source?: string;

	/**
	Modifies the [`global`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/global) property of the cloned `RegExp` instance.
	*/
	global?: boolean;

	/**
	Modifies the [`ignoreCase`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase) property of the cloned `RegExp` instance.
	*/
	ignoreCase?: boolean;

	/**
	Modifies the [`multiline`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/multiline) property of the cloned `RegExp` instance.
	*/
	multiline?: boolean;

	/**
	Modifies the [`dotAll`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll) property of the cloned `RegExp` instance.
	*/
	dotAll?: boolean;

	/**
	Modifies the [`sticky`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky) property of the cloned `RegExp` instance.
	*/
	sticky?: boolean;

	/**
	Modifies the [`unicode`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicode) property of the cloned `RegExp` instance.
	*/
	unicode?: boolean;

	/**
	Modifies the [`lastIndex`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex) property of the cloned `RegExp` instance.
	*/
	lastIndex?: number;
}

function cloneRegexp(regexp: RegExp, options: Options = {}) {
	if (!isRegexp(regexp)) {
		throw new TypeError('Expected a RegExp instance');
	}

	const flags = Object.keys(flagMap).map(flag => (
		(typeof options[flag] === 'boolean' ? options[flag] : regexp[flag]) ? flagMap[flag] : ''
	)).join('');

	const clonedRegexp = new RegExp(options.source ?? regexp.source, flags);

	clonedRegexp.lastIndex = typeof options.lastIndex === 'number' ?
		options.lastIndex :
		regexp.lastIndex;

	return clonedRegexp;
}

interface Match {
	match: string;
	subMatches: string[];
	index: number;
}

/**
Find multiple RegExp matches in a string.
@param regexp - Regular expression to match against the `string`.
@returns The matches.
@example
```
import execAll from 'execall';
execAll(/(\d+)/g, '$200 and $400');
// [
// 	{
// 		match: '200',
// 		subMatches: ['200'],
// 		index: 1
// 	},
// 	{
// 		match: '400',
// 		subMatches: ['400'],
// 		index: 10
// 	}
// ]
```
*/
export function execAll(regexp: RegExp, string: string): Match[] {
	let match: RegExpExecArray | null;
	const matches: Match[] = [];
	const clonedRegexp = cloneRegexp(regexp, { lastIndex: 0 });
	const isGlobal = clonedRegexp.global;

	// eslint-disable-next-line no-cond-assign
	while (match = clonedRegexp.exec(string)) {
		matches.push({
			match: match[0],
			subMatches: match.slice(1),
			index: match.index
		});

		if (!isGlobal) {
			break;
		}
	}

	return matches;
}
