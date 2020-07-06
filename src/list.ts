import { getPackages } from './api';

export async function list(keyword: string): Promise<any> {
	try {
		const results = await getPackages(keyword);
		if (results.length) {
			console.log(
				[
					'Search results:',
					...tableView([
						['Package', 'Origin'],
						...results.map((item) => [item.name, item.url])
					]),
				].map(line => wordTrim(line.replace(/\s+$/g, ''))).join('\n')
			);
		} else {
			console.log('No matching results');
		}
	} catch (e) {
		console.log(`An error occurred: ${e}`);
	}
}

const columns = process.stdout.columns ? process.stdout.columns : 80;
type ViewTableRow = string[];
type ViewTable = ViewTableRow[];

function wordTrim(text: string, width: number = columns, indicator = '...') {
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
function tableView(table: ViewTable, spacing: number = 2): string[] {
	const maxLen = {};
	table.forEach(row => row.forEach((cell, i) => maxLen[i] = Math.max(maxLen[i] || 0, cell.length)));
	return table.map(row => row.map((cell, i) => `${cell}${repeatString(' ', maxLen[i] - cell.length + spacing)}`).join(''));
}
