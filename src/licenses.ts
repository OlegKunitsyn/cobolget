import { MODULES_DIR, MANIFEST_NAME, tableView, wordTrim, LOCK_NAME } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function licenses(): Promise<any> {
	try {
		const lockFile = path.join(process.cwd(), LOCK_NAME);
		const lock = JSON.parse(fs.readFileSync(lockFile).toString());
		let packages: Array<Package> = [];
		for (let item in lock) {
			const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), MODULES_DIR, lock[item].name, MANIFEST_NAME)).toString());
			packages.push({ name: manifest['name'], licenses: manifest['licenses'].join(', ') } as Package);
			
		}
		console.log(
			[
				...tableView([
					['Package', 'Licenses'],
					...packages.map((item) => [item.name, item.licenses])
				]),
			].map(line => wordTrim(line.replace(/\s+$/g, ''))).join('\n')
		);
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}

interface Package {
	name: string;
	licenses: string;
}
