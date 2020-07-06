<h1 align="center">
  <br>
    <img src="https://github.com/OlegKunitsyn/cobolget/blob/master/icon.png?raw=true" alt="logo" width="200">
  <br>
  COBOL Package Manager
  <br>
  <br>
</h1>

<h4 align="center">Command-line tool for COBOL Package Registry - cobolget.com</h4>

<p align="center">
  <img src="https://github.com/OlegKunitsyn/cobolget/workflows/Docker%20Image%20CI/badge.svg?branch=master" />
</p>

### Features
- List packages in the registry
- Index (import new or update existing) packages from the repositories, such as
    - GitHub public
    - GitHub private
    - GitLab public
    - GitLab private
- Initialize and validate `Manifest`
- Add, remove and resolve dependencies into `Lock-file`
- Install COBOL packages
- COBOL dialects
    - gnucobol
    - entcobol
    - acucobol

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
  update                         Resolve dependencies and update lock-file
  install [options]              Install dependencies from lock-file                             
```

### Requirements
- NodeJS 8+

### Installation
```
$ npm install -g cobolget
```

### Using Packages
To start using `cobolget` in your project you need `Manifest` file that describes project and dependencies.
```
$ cobolget init
```

Now you can add a package which delivers additional functions e.g. hashing:
```
$ cobolget add core-string
```

By default `cobolget` requests the latest version indexed in Cobolget.com registry and put it into `modules.json`.
```
$ cobolget update
```

The tool resolves added as well as inherited dependencies in `Manifest` and creates `Lock-file` that contains exact versions of the packages.
Keeping `modules-lock.json` under a version control is important to re-install the same dependencies in other environments, e.g. CI.

Let's install the dependencies:
```
$ cobolget install
Downloading core-string 1.0.1
modules/core-string
modules/core-string/LICENSE
modules/core-string/README.md
modules/core-string/modules.json
modules/core-string/src/
modules/core-string/src/keccak.cbl
modules/core-string/src/string.cbl
modules/core-string/tests/
modules/core-string/tests/modules.cpy
modules/core-string/tests/string-test.cbl
Copybook modules.cpy updated
```

Now directory `modules` contains source-code from `core-string` package and `modules.cpy` copybook with all COBOL modules for inclusion into your project.

In order to install private package you need `Team Token` from `Organization` registered on cobolget.com:
```
$ cobolget -t private-team-token install
```

### Publishing Packages
To start using `cobolget` in your project you need `Manifest` file.
```
$ cobolget init
```

Please fix default values `modules.json` and validate `Manifest`: 
```
$ cobolget validate
```

Make sure, that in your `Manifest`
- all dependencies are valid Cobolget packages;
- all dependencies-debug are valid Cobolget packages;
- all modules are COBOL *modules* (programs and functions) in desired dialect are valid for inclusion.

Commit and push `modules.json` to your repository. After release you may index the package on the registry:
```
$ cobolget index https://github.com/OlegKunitsyn/core-string
```

New releases of the package you can index by name
```
$ cobolget index core-string
```

In order to index private packages you need your `Repository Token` and registered `Organization` to associate the packages with.
Please follow [GitLab](https://gitlab.com/profile/personal_access_tokens) or [GitHub](https://github.com/settings/tokens/new) instructions.
```
$ cobolget -t repository-token -o company index https://github.com/company/repository
```

### Security

Cobolget.com analyzes `Manifest` files only and does not store nor crawl your source-code. Therefore, package management will fail if you delete origin repository or restrict an access to it.

You may choose Cobolget registry to share private COBOL source-code with colleagues or customers without publishing it.
Under `Organization` umbrella you can manage Teams and their `Team Tokens` to assign per-team installation permissions for a limited period of time.

### Development
- Cobolget API documentation - [https://cobolget.com/doc/](https://cobolget.com/doc/)
- `Manifest` schema - [https://cobolget.com/schema.json](https://cobolget.com/schema.json)

Your contribution is always welcome!
