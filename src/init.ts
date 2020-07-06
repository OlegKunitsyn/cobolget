import { MANIFEST_NAME, MANIFEST_INIT } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function init(): Promise<any> {
	try {
		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);
		fs.writeFileSync(manifestFile, JSON.stringify(MANIFEST_INIT, null, 2));
		console.log(`Manifest ${MANIFEST_NAME} created`);
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}
}
