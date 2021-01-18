<h1 align="center">
  <br>
    <img src="https://github.com/OlegKunitsyn/cobolget/blob/master/icon.png?raw=true" alt="logo" width="200">
  <br>
  COBOL Package Manager
  <br>
  <br>
</h1>

<h4 align="center">Command-line tool for <a href="https://cobolget.com">COBOL Package Registry</a></h4>

<p align="center">
  <img src="https://github.com/OlegKunitsyn/cobolget/workflows/ci/badge.svg" />
  <a href="https://npmjs.com/package/cobolget" title="View project on NPM"><img src="https://img.shields.io/npm/dm/cobolget.svg" alt="Downloads" /></a>
</p>

### Features
- List packages in the registry
- Index (import new or update existing) packages from the repositories, such as
    - GitHub public
    - GitHub private
    - GitLab public
    - GitLab private
    - Gitee public
- Initialize and validate `Manifest`
- Add, remove and resolve dependencies into `Lockfile`
- Install COBOL packages
- COBOL dialects
    - GnuCOBOL
    - IBM Enterprise COBOL
- List licenses of the installed packages
- Run scripts

```
$ cobolget
Usage: cobolget <command> [options]

Options:
  -v, --version                         output the version number
  -h, --help                            output usage information

Commands:
  list <keyword>                        List packages in the registry
  index [options] <name|url>            Import or update the package in the registry
  init                                  Create manifest file
  validate                              Validate manifest file
  add [options] <dependency> [version]  Add package to the manifest
  remove [options] <dependency>         Remove package from the manifest
  update                                Resolve dependencies and update lockfile
  install [options]                     Install dependencies from lockfile
  licenses                              List licenses of the installed packages
  run <script*>                         Run matching script(s) defined in the manifest
```

### Requirements
- NodeJS 8+

### Installation
```
$ npm install -g cobolget
```

### Package Management
The [Registry](https://cobolget.com) helps you distribute and integrate COBOL libraries into your projects by using
[cobolget](https://www.npmjs.com/package/cobolget), an open-source command-line tool.
You can transparently integrate packages from GitHub, GitLab or Gitee repositories, written in `gnucobol` or `entcobol` COBOL dialects.
As well as public packages, the Registry lets you import your own private packages making COBOL code shared within your
Organization only. You can manage `Teams` and `Team Tokens` granting per-team installation rights for a limited period of time.

<h5 align="center"><img src="/sequence.svg" alt="COBOLget" width="60%"></h5>

In contrast to other Package Managers, COBOLget only analyzes `Manifest` files in [JSON format](https://cobolget.com/schema.json)
and does not clone nor crawl origin source-code. Package installation will fail if the maintainer decides restrict access to the repository or revoke the `Team Token`.

### Using Packages
To start using `cobolget` in your project you need the `Manifest` file which describes the project and its dependencies.
```
$ npm install -g cobolget
$ cobolget init
Manifest modules.json created.
```

Now you can add a dependency which delivers additional functionality:
<details>
<summary>GnuCOBOL</summary>

```
$ cobolget add core-datetime
Dependency 'core-datetime' has been added to the manifest.
```
</details>
<details>
<summary>Enterprise COBOL</summary>

```
$ cobolget add main-string
Dependency 'main-string' has been added to the manifest.
```
</details>

By default, `cobolget` takes the latest (highest) version available in the Registry and adds it into `modules.json`.
```
$ cobolget update
Lockfile modules-lock.json updated.
```

The tool resolves direct and inherited dependencies in the `Manifest` and creates the `Lockfile` which contains exact versions of the packages.
Keeping `modules-lock.json` under a version control is important to re-install the same dependencies in other environments, e.g. Continuous Integration.

Let's install the dependencies:
<details>
<summary>GnuCOBOL</summary>

```
$ cobolget install
Downloading core-datetime 3.0.5
modules/core-datetime
modules/core-datetime/.gitignore
modules/core-datetime/.gitlab-ci.yml
modules/core-datetime/Dockerfile
modules/core-datetime/LICENSE
modules/core-datetime/README.md
modules/core-datetime/coboldoc/
modules/core-datetime/coboldoc/README.md
modules/core-datetime/coboldoc/datetime.cbl.md
modules/core-datetime/modules.json
modules/core-datetime/src/
modules/core-datetime/src/datetime.cbl
modules/core-datetime/tests/
modules/core-datetime/tests/datetime-test.cbl
modules/core-datetime/tests/modules.cpy
Modules modules.cpy and modules.cbl updated.
```
Directory `modules` contains source-code of the package and `modules.cpy` ready for inclusion into your project.
</details>
<details>
<summary>Enterprise COBOL</summary>

```
$ cobolget install
Downloading main-string 6.2.1
modules/main-string
modules/main-string/.gitignore
modules/main-string/LICENSE
modules/main-string/README.md
modules/main-string/coboldoc/
modules/main-string/coboldoc/README.md
modules/main-string/coboldoc/string.cbl.md
modules/main-string/modules.json
modules/main-string/src/
modules/main-string/src/string.cbl
modules/main-string/tests/
modules/main-string/tests/tests.cbl
modules/main-string/tests/tests.jcl
Modules modules.cpy and modules.cbl updated.
```
Directory `modules` contains source-code of the package and `modules.cbl` ready for compilation and linking with your project.
</details>

For installing a private package you need the `Team Token` from your `Organization`:
<details>
<summary>GnuCOBOL</summary>

```
$ cobolget add core-network
$ cobolget update
$ cobolget -t bca12d6c4efed0627c87f2e576b72bdb5ab88e34 install
```
</details>
<details>
<summary>Enterprise COBOL</summary>

```
$ cobolget add main-bitwise
$ cobolget update
$ cobolget -t bca12d6c4efed0627c87f2e576b72bdb5ab88e34 install
```
</details>

### Publishing Packages
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
- all `modules` are COBOL modules (programs and functions) in desired dialect, without termination statements e.g. `STOP RUN`.

Commit and push `modules.json` to your repository. After release, you can import the package into the Registry by a link:
<details>
<summary>GnuCOBOL</summary>

```
$ cobolget index https://gitlab.com/OlegKunitsyn/core-datetime
```
</details>
<details>
<summary>Enterprise COBOL</summary>

```
$ cobolget index https://github.com/OlegKunitsyn/main-string
```
</details>

New releases of the package you can index by a name:
<details>
<summary>GnuCOBOL</summary>

```
$ cobolget index core-datetime
```
</details>
<details>
<summary>Enterprise COBOL</summary>

```
$ cobolget index main-string
```
</details>

For indexing private packages you must submit `Repository Token` to associate a package with the Organization.
Follow [GitLab](https://gitlab.com/profile/personal_access_tokens) or [GitHub](https://github.com/settings/tokens/new) instructions.
In the example below Organization is `cobolget`, but use your own.
<details>
<summary>GnuCOBOL</summary>

```
$ cobolget -t DMNZpM9LzMyvswqE6yzz -o cobolget index https://gitlab.com/OlegKunitsyn/core-network
```
</details>
<details>
<summary>Enterprise COBOL</summary>

```
$ cobolget -t DMNZpM9LzMyvswqE6yzz -o cobolget index https://gitlab.com/OlegKunitsyn/main-bitwise
```
</details>

### Versioning
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


### Scripting
You can specify a command within `scripts` property and run it
```
$ cobolget run <script>
```

or specify a script that runs several commands at once
```
{
  ...
  "scripts": {
    "cobolget": "cobolget update && cobolget install"
  }  
}
```
or specify nested automation scenarios grouping scripts by a name:
```
{
  ...
  "scripts": {
    "build:docs": "coboldoc generate src/* -o docs",
    "build:package:update": "cobolget update",
    "build:package:install": "cobolget install",
    "build:upload": "zowe zos-files upload file-to-data-set modules/modules.cbl <USER ID>.CBL",
    "tests:upload": "zowe zos-files upload file-to-data-set tests/tests.cbl <USER ID>.CBL",
    "tests:run": "zowe jobs submit local-file tests/tests.jcl --view-all-spool-content"
  }
}
```

Delimiter can be any. In this example argument `build:package` will match two scripts, and next example will execute all `build` scripts one by one:
```
$ cobolget run b
```
The batch of commands stops upon the first failure (non-zero exit code).

### Development
- [API documentation](https://cobolget.com/doc/)
- [API client](https://github.com/OlegKunitsyn/cobolget)
- [Schema](https://cobolget.com/schema.json)

### Roadmap
- Inline copybooks in `modules.cbl`.
- Support `netcobol` (Fujitsu NetCOBOL by GT Software) dialect.

Your contribution is always welcome!
