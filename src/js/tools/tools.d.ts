export function joinObjects<T>(...objects: any[]): T;

declare module './FunctionMap' {
	export class FunctionMap {
		add(id: string, fn: Function): void;
		exec(idOrFn: string | Function | null, ...args: any[]): any;
		execOnMaps(idOrFn: string | Function | null, mapsIn: Array<Object>, ...args: any[]): any;
	}
}
