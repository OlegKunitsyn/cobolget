import * as rc from 'typed-rest-client/HttpClient';

const BASE_URL = 'https://cobolget.com';
export const API_AGENT = 'cobolget';
export const MODULES_DIR = 'modules';
export const MANIFEST_NAME = 'modules.json';
export const LOCK_NAME = 'modules-lock.json';
export const COPYBOOK_NAME = 'modules.cpy';
export const LIBRARY_NAME = 'modules.cbl';
export const MANIFEST_SCHEMA = BASE_URL + '/schema.json';
export const MANIFEST_INIT = {
	"name": "package-name",
	"description": "Short description",
	"modules": [],
	"dialect": "gnucobol",
	"licenses": ["MIT"],
	"authors": ["Author"],
	"dependencies": {},
	"dependencies-debug": {}
};
const client = new rc.HttpClient(API_AGENT);

export interface IndexOptions {
	token?: string;
	organization?: string;
}

export interface DependencyOptions {
	debug: boolean;
}

export interface ApiDependency {
	isDebug: boolean;
	package: string;
	satisfies: string;
}

export interface ApiVersion {
	tag: string;
	name: string;
	modules: Array<string>;
	dialect: string;
	dependencies: Array<ApiDependency>
}

export interface ApiPackage {
	name: string;
	description: string;
	url: string;
	versions: Array<ApiVersion>
}

export interface ApiError {
	message: string;
}

export interface ApiRedirect {
	url: string;
}

export async function graph(name: string, packages: Object = {}): Promise<any> {
	if (name in packages) {
		return packages[name];
	}

	const response = await client.get(`${BASE_URL}/api/packages/${encodeURIComponent(name)}`);
	if (response.message.statusCode !== 200) {
		const error: ApiError = JSON.parse(await response.readBody());
		throw Error(error.message);
	}
	const pkg: ApiPackage = JSON.parse(await response.readBody());

	packages[name] = {};
	for (let version of pkg.versions) {
		packages[name][version.tag] = {};
		for (let dependency of version.dependencies) {
			if (!dependency.isDebug) {
				await graph(dependency.package, packages);
				packages[name][version.tag][dependency.package] = dependency.satisfies;
			}
		}
	}

	return packages;
}

export async function indexPackage(nameOrUrl: string, token: string = null, name: string = null): Promise<ApiPackage> {
	if (token && !name) {
		throw new Error(`Organization name is required`);
	}
	const url = name ?
		`${BASE_URL}/api/organizations/${encodeURIComponent(name)}/packages/${encodeURIComponent(nameOrUrl)}` :
		`${BASE_URL}/api/packages/${encodeURIComponent(nameOrUrl)}`;
	const response = await client.post(url, token);
	const body = JSON.parse(await response.readBody());
	if (response.message.statusCode === 200) {
		return body as ApiPackage;
	}
	if (response.message.statusCode === 400) {
		throw new Error((body as ApiError).message);
	}
	throw new Error(`HTTP ${response.message.statusCode}`);
}

export async function getPackage(name: string): Promise<ApiPackage> {
	const response = await client.get(`${BASE_URL}/api/packages/${encodeURIComponent(name)}`);
	const body = JSON.parse(await response.readBody());
	if (response.message.statusCode === 200) {
		return body as ApiPackage;
	}
	if (response.message.statusCode === 400) {
		throw new Error((body as ApiError).message);
	}
	throw new Error(`HTTP ${response.message.statusCode}`);
}

export async function getPackages(keyword: string): Promise<ApiPackage[]> {
	const response = await client.get(`${BASE_URL}/api/packages?q=${encodeURIComponent(keyword)}`);
	const body = JSON.parse(await response.readBody());
	if (response.message.statusCode === 200) {
		return body as ApiPackage[];
	}
	if (response.message.statusCode === 400) {
		throw new Error((body as ApiError).message);
	}
	throw new Error(`HTTP ${response.message.statusCode}`);
}

export async function validateManifest(manifest: string): Promise<string> {
	const response = await client.post(`${BASE_URL}/api/schema/validate`, manifest);
	const body = JSON.parse(await response.readBody());
	if (response.message.statusCode === 200) {
		return manifest;
	}
	if (response.message.statusCode === 400) {
		throw new Error((body as ApiError).message);
	}
	throw new Error(`HTTP ${response.message.statusCode}`);
}

export async function downloadZip(name: string, version: string, token: string = null): Promise<Buffer> {
	let response = await client.put(`${BASE_URL}/api/packages/${encodeURIComponent(name)}/${encodeURIComponent(version)}/download`, token);

	if (response.message.statusCode === 302) {
		const redirect: ApiRedirect = JSON.parse(await response.readBody());
		response = await client.get(redirect.url);
	}

	if (response.message.statusCode === 200) {
		return await new Promise<Buffer>(async (resolve, reject) => {
			let chunks = [];

			response.message.on('data', (chunk) => {
				chunks.push(chunk);
			});

			response.message.on('end', () => {
				resolve(Buffer.concat(chunks));
			});

			response.message.on('error', (error) => {
				reject(error);
			});
		});
	}

	if (response.message.statusCode === 400) {
		const body = JSON.parse(await response.readBody());
		throw new Error((body as ApiError).message);
	}
	throw new Error(`HTTP ${response.message.statusCode}`);
}

const columns = process.stdout.columns ? process.stdout.columns : 80;
type ViewTableRow = string[];
type ViewTable = ViewTableRow[];

export function wordTrim(text: string, width: number = columns, indicator = '...') {
	if (text.length > width) {
		return text.substr(0, width - indicator.length) + indicator;
	}
	return text;
}

function repeatString(text: string, count: number): string {
	let result: string = '';
	for (let i = 0; i < count; i++) {
		result += text;
	}
	return result;
}

export function tableView(table: ViewTable, spacing: number = 2): string[] {
	const maxLen = {};
	table.forEach(row => row.forEach((cell, i) => maxLen[i] = Math.max(maxLen[i] || 0, cell.length)));
	return table.map(row => row.map((cell, i) => `${cell}${repeatString(' ', maxLen[i] - cell.length + spacing)}`).join(''));
}
