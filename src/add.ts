import { MANIFEST_NAME, DependencyOptions, getPackage, validateManifest } from './api';
import * as path from 'path';
import * as fs from 'fs';

export async function add(dependency: string, options: DependencyOptions): Promise<any> {
	const manifestFile = path.join(process.cwd(), MANIFEST_NAME);

	// manifest exists?
	if (!fs.existsSync(manifestFile)) {
		console.log(`No manifest ${MANIFEST_NAME} found. Please run 'init' command`);
		return;
	}

	// package exists?
	try {
		await getPackage(dependency);
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}

	let manifest = JSON.parse(fs.readFileSync(manifestFile).toString());
	if (options.debug) {
		manifest['dependencies-debug'][dependency] = '*';
	} else {
		manifest['dependencies'][dependency] = '*';
	}
	manifest = JSON.stringify(manifest, null, 2);

	// manifest valid?
	try {
		await validateManifest(manifest);
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}

	// save
	fs.writeFileSync(manifestFile, manifest);
	if (options.debug) {
		console.log(`Debug dependency '${dependency}' has been added to the manifest.`);
	} else {
		console.log(`Dependency '${dependency}' has been added to the manifest.`);
	}
}
