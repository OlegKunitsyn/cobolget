import * as program from 'commander';
import * as leven from 'leven';
import { list } from './list';
import { init } from './init';
import { validate } from './validate';
import { add } from './add';
import { remove } from './remove';
import { index } from './index';
import { update } from './update';
import { install } from './install';
const pkg = require('../package.json');

module.exports = function (argv: string[]): void {

	program
		.version(pkg.version, '-v, --version')
		.usage('<command> [options]');

	program
		.command('list <keyword>')
		.description('List packages in the registry')
		.action((keyword) => list(keyword));

	program
		.command('index <name|url>')
		.option('-t, --token <token>', 'Repository token for private package')
		.option('-o, --organization <organization>', 'Organization name for private package')
		.description('Import or update the package in the registry')
		.action((name, options) => index(name, options));

	program
		.command('init')
		.description('Create manifest file')
		.action(() => init());

	program
		.command('validate')
		.description('Validate manifest file')
		.action(() => validate());

	program
		.command('add <dependency>')
		.option('-d, --debug', 'Add debug package to the manifest')
		.description('Add package to the manifest')
		.action((dependency, options) => add(dependency, options));

	program
		.command('remove <dependency>')
		.option('-d, --debug', 'Remove debug package from the manifest')
		.description('Remove package from the manifest')
		.action((dependency, options) => remove(dependency, options));

	program
		.command('update')
		.description('Resolve dependencies and update lock-file')
		.action(() => update());

	program
		.command('install')
		.option('-t, --token <token>', 'Team token')
		.description('Install dependencies from lock-file')
		.action((token) => install(token));

	program
		.command('*', '', { noHelp: true })
		.action((cmd: string) => {
			program.help(help => {
				const availableCommands: string[] = program.commands.map(c => c._name);
				const suggestion: string = availableCommands.find(c => leven(c, cmd) < c.length * 0.4);
				help = `${help}\nUnknown command '${cmd}'`;
				return suggestion ? `${help}, did you mean '${suggestion}'?\n` : `${help}.\n`;
			});
		});

	program.parse(argv);

	if (process.argv.length <= 2) {
		program.help();
	}
}
