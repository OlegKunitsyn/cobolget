import { getPackages, tableView, wordTrim } from './api';

export async function list(keyword: string): Promise<any> {
	try {
		const results = await getPackages(keyword);
		if (results.length) {
			console.log(
				[
					'Search results:',
					...tableView([
						['Package', 'Description'],
						...results.map((item) => [item.name, item.description])
					]),
				].map(line => wordTrim(line.replace(/\s+$/g, ''))).join('\n')
			);
		} else {
			console.log('No matching results.');
		}
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}
}
