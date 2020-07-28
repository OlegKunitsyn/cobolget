<h1 align="center">
  <br>
    <img src="https://github.com/OlegKunitsyn/cobolget/blob/master/icon.png?raw=true" alt="logo" width="200">
  <br>
  COBOL Package Manager
  <br>
  <br>
</h1>

<h4 align="center">Command-line tool for COBOL Package Registry - cobolget.com</h4>

#### Features
- List packages in the registry
- Index (import new or update existing) packages from the repositories, such as
    - GitHub public
    - GitHub private
    - GitLab public
    - GitLab private
- Initialize and validate `Manifest`
- Add, remove and resolve dependencies into `Lockfile`
- Install COBOL packages
- COBOL dialects
    - gnucobol
    - entcobol
    - acucobol
- List licenses of the installed packages

```
$ cobolget
Usage: cobolget <command> [options]

Options:
  -v, --version                  output the version number
  -h, --help                     output usage information

Commands:
  list <keyword>                 List packages in the registry
  index [options] <name|url>     Import or update the package in the registry
  init                           Create manifest file
  validate                       Validate manifest file
  add [options] <dependency>     Add package to the manifest
  remove [options] <dependency>  Remove package from the manifest
  update                         Resolve dependencies and update lockfile
  install [options]              Install dependencies from lockfile
  licenses                       List licenses of the installed packages
```

#### Requirements
- NodeJS 8+

#### Installation
```
$ npm install -g cobolget
```

#### Package Management
The [Registry](https://cobolget.com) helps you distribute and integrate COBOL libraries into your projects by using 
[cobolget](https://github.com/OlegKunitsyn/cobolget), an open-source command-line tool.
You can transparently integrate packages from GitHub and GitLab repositories, written in `gnucobol`, `entcobol` or `acucobol` COBOL dialects.
As well as public packages, the Registry lets you import your own private packages making COBOL code shared within your 
Organization only. You can manage `Teams` and `Team Tokens` granting per-team installation rights for a limited period of time.

<h5 align="center"><img src="/sequence.svg" alt="COBOLget" width="60%"></h5>

In contrast to other Package Managers, COBOLget only analyzes `Manifest` files in [cobolget format](https://cobolget.com/schema.json) 
and does not clone nor crawl origin source-code. Package installation will fail if the maintainer decides restrict access to the repository or revoke the `Team Token`.

#### Using Packages
To start using `cobolget` in your project you need the `Manifest` file which describes the project and its dependencies.
```
$ npm install -g cobolget
$ cobolget init
Manifest modules.json created.
```

Now you can add a dependency which delivers additional functionality:
```
$ cobolget add core-datetime
Dependency 'core-datetime' has been added to the manifest.
```

By default, `cobolget` takes the latest version indexed on the Registry and adds it into `modules.json`.
```
$ cobolget update
Lockfile modules-lock.json updated.
```

The tool resolves direct and inherited dependencies in the `Manifest` and creates the `Lockfile` which contains exact versions of the packages.
Keeping `modules-lock.json` under a version control is important to re-install the same dependencies in other environments, e.g. Continuous Integration.

Let's install the dependencies:
```
$ cobolget install
Downloading core-datetime 1.0.3
modules/core-datetime
modules/core-datetime/LICENSE
modules/core-datetime/README.md
modules/core-datetime/modules.json
modules/core-datetime/src/
modules/core-datetime/src/datetime.cbl
modules/core-datetime/tests/
modules/core-datetime/tests/datetime-test.cbl
modules/core-datetime/tests/modules.cpy
Copybook modules.cpy updated.
```

Directory `modules` contains source-code from `core-datetime` package and `modules.cpy`, a Copybook with all COBOL modules ready for inclusion into your project.

For installing a private package you need the `Team Token` from your `Organization`:
```
$ cobolget -t bca12d6c4efed0627c87f2e576b72bdb5ab88e34 install
```

#### Publishing Packages
To start using `cobolget` in your library you need the `Manifest` file which describes the library and its dependencies.
```
$ npm install -g cobolget
$ cobolget init
```

Open `modules.json` in text editor, fix default values and validate the `Manifest`: 
```
$ cobolget validate
```

Make sure, that in your `Manifest`
- all `dependencies` are valid COBOLget packages;
- all `dependencies-debug` are valid COBOLget packages;
- all `modules` are COBOL modules (programs and functions) in desired dialect, valid for inclusion as a Copybook.

Commit and push `modules.json` to your repository. After release, you can import the package into the Registry by a link:
```
$ cobolget index https://gitlab.com/OlegKunitsyn/core-datetime
```

New releases of the package you can index by a name:
```
$ cobolget index core-datetime
```

For indexing private packages you must submit `Repository Token` to associate a package with the Organization. 
Follow [GitLab](https://gitlab.com/profile/personal_access_tokens) or [GitHub](https://github.com/settings/tokens/new) instructions.
In the example below Organization is `cobolget`, but use your own.
```
$ cobolget -t DMNZpM9LzMyvswqE6yzz -o cobolget index https://gitlab.com/OlegKunitsyn/core-network
```

#### Versioning
COBOLget implements [SemVer](https://semver.org/) versioning standard. You can specify constraints in the `Manifest` to satisfy concrete versions of the dependencies.

| Operator | Constraint             | Example                  |
|----------|------------------------|--------------------------|
| *        | Any (default)          | "core-string": "*"       |
| <        | Less than              | "core-string": "<1.0.2"  |
| <=       | Less or equal to       | "core-string": "<=1.0.2" |
| >        | Greater than           | "core-string": ">1.0.2"  |
| >=       | Greater or equal to    | "core-string": ">=1.0.2" |
| =        | Equal                  | "core-string": "=1.0.2"  |
| x        | Stand in               | "core-string": "1.0.x"   |
| ~        | Approximately equal to | "core-string": "~1.0.1"  |

#### Development
- [API documentation](https://cobolget.com/doc/)
- [API client](https://github.com/OlegKunitsyn/cobolget)
- [Schema](https://cobolget.com/schema.json)

Your contribution is always welcome!
