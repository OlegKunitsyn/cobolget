import { MANIFEST_NAME, MANIFEST_INIT, MODULES_DIR, LOCK_NAME } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function init(): Promise<any> {
	try {
		const modulesDir = path.join(process.cwd(), MODULES_DIR);
		if (fs.existsSync(modulesDir)) {
			rmdirSyncR(modulesDir);
		}
		const lockFile = path.join(process.cwd(), LOCK_NAME);
		if (fs.existsSync(lockFile)) {
			fs.unlinkSync(lockFile);
		}

		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);
		fs.writeFileSync(manifestFile, JSON.stringify(MANIFEST_INIT, null, 2));
		console.log(`Manifest ${MANIFEST_NAME} created.`);
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}

function rmdirSyncR(dir: string) {
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach(function (file) {
			var item = path.join(dir, file);
			if (fs.lstatSync(item).isDirectory()) {
				rmdirSyncR(item);
			} else {
				fs.unlinkSync(item);
			}
		});
		fs.rmdirSync(dir);
	}
}
