import { MANIFEST_NAME, LOCK_NAME, graph } from './api';
import { Resolver } from './resolver';
import * as path from 'path';
import * as fs from 'fs';
import * as lodash from 'lodash';

export async function update(): Promise<any> {
	try {
		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);
		const lockFile = path.join(process.cwd(), LOCK_NAME);

		// manifest exists?
		if (!fs.existsSync(manifestFile)) {
			console.log(`No manifest ${MANIFEST_NAME} found. Please run 'init' command.`);
			return;
		}

		const manifest = JSON.parse(fs.readFileSync(manifestFile).toString());
		let packages: Object = {};
		for (let name in manifest['dependencies']) {
			await graph(name, packages);
		}
		for (let name in manifest['dependencies-debug']) {
			await graph(name, packages);
		}

		new Resolver(packages, manifest['dependencies']).resolve().then(
			resolution => {
				new Resolver(packages, manifest['dependencies-debug']).resolve().then(
					debug => {
						resolution = lodash.mapValues(resolution, (value, key) => {
							return {
								name: key,
								version: value,
								debug: false
							}
						});
						debug = lodash.mapValues(debug, (value, key) => {
							return {
								name: key,
								version: value,
								debug: true
							}
						});
						fs.writeFileSync(lockFile, JSON.stringify(lodash.merge(debug, resolution), null, 2));
						console.log(`Lockfile ${LOCK_NAME} updated.`);
					},
					error => {
						throw Error(error);
					}
				);
			},
			error => {
				throw Error(error);
			}
		);
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}
}
