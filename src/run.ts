import { MANIFEST_NAME } from './api';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

export async function run(script: string): Promise<any> {
	try {
		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);

		// manifest exists?
		if (!fs.existsSync(manifestFile)) {
			console.log(`No manifest ${MANIFEST_NAME} found. Please run 'init' command.`);
			return;
		}
		let manifest = JSON.parse(fs.readFileSync(manifestFile).toString());


		// script exists?
		if (!manifest.hasOwnProperty('scripts')) {
			console.log(`No scripts found.`);
			return;
		}

		for (let name of Object.keys(manifest['scripts'])) {
			if (name.startsWith(script)) {
				execSync(manifest['scripts'][name], {stdio: 'inherit'});
			}
		}
		
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}
