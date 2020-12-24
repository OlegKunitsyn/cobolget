import { IndexOptions, indexPackage } from './api';

export async function index(nameOrUrl: string, options: IndexOptions): Promise<any> {
	try {
		const response = await indexPackage(nameOrUrl, options.token !== undefined ? options.token : null, options.organization !== undefined ? options.organization : null);
		console.log(`Package '${response.name}' has been indexed in the registry.`);
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}
