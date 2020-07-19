import { MANIFEST_NAME, DependencyOptions, validateManifest } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function remove(dependency: string, options: DependencyOptions): Promise<any> {
	try {
		const manifestFile = path.join(process.cwd(), MANIFEST_NAME);

		// manifest exists?
		if (!fs.existsSync(manifestFile)) {
			console.log(`No manifest ${MANIFEST_NAME} found. Please run 'init' command`);
			return;
		}
		let manifest = JSON.parse(fs.readFileSync(manifestFile).toString());
		
		if (options.debug) {
			delete manifest['dependencies-debug'][dependency];
		} else {
			delete manifest['dependencies'][dependency];
		}

		// manifest valid?
		manifest = JSON.stringify(manifest, null, 2);
		await validateManifest(manifest);

		// save
		fs.writeFileSync(manifestFile, manifest);
		if (options.debug) {
			console.log(`Debug dependency '${dependency}' has been removed from the manifest.`);
		} else {
			console.log(`Dependency '${dependency}' has been removed from the manifest.`);
		}
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}
}
