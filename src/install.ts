import { IndexOptions, LOCK_NAME, MODULES_DIR, downloadZip, MANIFEST_NAME, COPYBOOK_NAME } from './api';
import * as path from 'path';
import * as fs from 'fs';
import * as unzipper from 'unzipper';

export async function install(options: IndexOptions): Promise<any> {
	try {
		const modulesDir = path.join(process.cwd(), MODULES_DIR);
		if (!fs.existsSync(modulesDir)) {
			fs.mkdirSync(modulesDir);
		}

		let copybook: Array<string> = [];
		const lockFile = path.join(process.cwd(), LOCK_NAME);
		const lock = JSON.parse(fs.readFileSync(lockFile).toString());
		for (let item in lock) {
			// download zip
			console.log(`Downloading ${lock[item].name} ${lock[item].version}`);
			const zip = await downloadZip(lock[item].name, lock[item].version, options.token !== undefined ? options.token : null);

			const directory = await unzipper.Open.buffer(zip);
			const file = directory.files.find((entry) => entry.path.endsWith(MANIFEST_NAME));

			// add modules
			const manifest = JSON.parse((await file.buffer()).toString());
			if (lock[item].debug) {
				manifest.modules.forEach((module: string) => {
					copybook.push(`      D COPY "${module}" OF "modules/${lock[item].name}".`);
				});
			} else {
				manifest.modules.forEach((module: string) => {
					copybook.push(`       COPY "${module}" OF "modules/${lock[item].name}".`);
				});
			}

			// extract zip
			const prefix = file.path.replace(MANIFEST_NAME, '');
			for (const entry of directory.files) {
				entry.path = entry.path.replace(prefix, '');
				const file = path.join(process.cwd(), MODULES_DIR, lock[item].name, entry.path.replace(prefix, ''));
				if (entry.type === 'Directory') {
					if (!fs.existsSync(file)) {
						fs.mkdirSync(file);
					}
				} else {
					entry.stream().pipe(fs.createWriteStream(file));
				}
				console.log(file);
			}
		}
		// add EOF
		copybook.push('');

		// save copybook
		fs.writeFileSync(path.join(process.cwd(), MODULES_DIR, COPYBOOK_NAME), copybook.join("\n"));
		console.log(`Copybook ${COPYBOOK_NAME} updated.`);
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}
