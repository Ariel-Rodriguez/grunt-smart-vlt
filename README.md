# grunt-smart-vlt

> Friendly grunt plugin to run Adobe VLT commands.
> Run svlt task to automatically commit the changes from your local work.
>
> Call to svlt task after any change on your cq vault directory and all vlt operations will be performed.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

## Installing
If VLT command line is not installed, please follow next:

1. In your file system, go to <cq-installation-dir>/crx-quickstart/opt/filevault. The build is available in both tgz and zip formats.

2. Extract the archive.

3. Add `<cq-installation-dir>/crx-quickstart/opt/filevault/vault-cli-<version>/bin` to your environment PATH so that the command files vlt or vlt.bat are accessed as appropriate. For example, `<cq-installation-dir>/crx-quickstart/opt/filevault/vault-cli-1.1.2/bin`

Open a command line shell and execute `vlt --help`. Make sure it doesn't throw an error.


```[Adobe Guide Reference](http://wem.help.adobe.com/enterprise/en_US/10-0/wem/developing/developmenttools/developing_with_eclipse.html#Installing%20FileVault%20(VLT))


```shell
npm install grunt-smart-vlt --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-smart-vlt');
```

## The "svlt" task

### Overview
In your project's Gruntfile, add a section named `svlt` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  svlt: {
    options: {
      vaultWork: 'target/vault-work/jcr_root',
      src: ['**','**/{*.*,.*.xml}', '!**/.vlt*'],
      stdout: true

      checkout: {
        host: {
          uri: 'http://localhost:4502/crx',
          user: 'admin',
          password: 'admin'
        },
        autoforce: true,
        params: '--verbose',
        stdout: true
      }
    }
  },
});
```

### Options

#### options.vaultWork
Type: `String`
**value required**

This path is where the working directory is loacated.

**NOTE: svlt:co will checkout to this path.**

#### options.checkout.params
Type: `Array`

You must specify all directories and file filters that you want to commit under work directory.

#### Host.User

Set false if you won't use credentials, or pass a valid string with user name.

#### options.checkout.params
Type: `String`

You can pass next optional arguments to checkout: '--verbose --force -q -f'

#### options.checkout.autoforce
Type: `Boolean`

pass true if svlt:co should run in --force mode only when work directory has never been initialized yet.

### Usage Examples

```js
grunt.initConfig({
  svlt: {
   ...
  },
});

grunt.loadNpmTasks('grunt-smart-vlt');

grunt.registerTask('vlt', ['svlt:co', 'svlt']);

```

### Usage With grunt-contrib-watch

You can call 'svlt' after some watch event.

```js
grunt.initConfig({
  svlt : { ... },
  watch : {
    coffee: {
      files: [...],
      tasks: ['coffee', 'svlt']
    }
  }
});

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
