import { MANIFEST_NAME, validateManifest } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function validate(): Promise<any> {
	try {
		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);
		const manifest = fs.readFileSync(manifestFile).toString();
		await validateManifest(manifest);
		console.log(`Manifest ${MANIFEST_NAME} is valid.`);
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}
