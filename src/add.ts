import { MANIFEST_NAME, DependencyOptions, getPackage, validateManifest } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function add(dependency: string, version: string = '*', options: DependencyOptions): Promise<any> {
	try {
		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);

		// manifest exists?
		if (!fs.existsSync(manifestFile)) {
			console.log(`No manifest ${MANIFEST_NAME} found. Please run 'init' command.`);
			return;
		}
		let manifest = JSON.parse(fs.readFileSync(manifestFile).toString());

		// package exists?
		await getPackage(dependency);

		if (options.debug) {
			manifest['dependencies-debug'][dependency] = version;
		} else {
			manifest['dependencies'][dependency] = version;
		}
		
		// manifest valid?
		manifest = JSON.stringify(manifest, null, 2);
		await validateManifest(manifest);

		// save
		fs.writeFileSync(manifestFile, manifest);
		if (options.debug) {
			console.log(`Debug dependency '${dependency}' has been added to the manifest.`);
		} else {
			console.log(`Dependency '${dependency}' has been added to the manifest.`);
		}
	} catch (e) {
		console.log(`An error occurred: ${e}.`);
	}
}
