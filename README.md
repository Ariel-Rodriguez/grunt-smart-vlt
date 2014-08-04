# grunt-smart-vlt

> Friendly grunt plugin to run Adobe VLT commands.

## Getting Started
This plugin requires Grunt `>= 0.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

## Installing
Ensure you have vlt adobe tool installed in your system.

Please follow this guide: http://wem.help.adobe.com/enterprise/en_US/10-0/wem/developing/developmenttools/developing_with_eclipse.html#Installing%20FileVault%20(VLT)


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
      vaultWork: '< path to the vlt working directory>',
      host: 'http://localhost:4502/crx',
      credentials: {
        user: '< user >',
        pwd: '< password >'
      },
      params: '--verbose --force', // params for when vlt checkouts.
      stdout: < true > || < false > || < vltlog.txt > // you can specify true for console output, or a path log.
    }
  },
});
```

### Options

#### options.vaultWork
Type: `String`
Default value: `'public/content/jcr_root'`

Path where you want to checkout for svlt:init task.

#### options.host
Type: `String`
Default value: `'http://localhost:4502/crx'`

Target host used by vlt:init

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  svlt: {
    options: {

    },
  },
});

grunt.loadNpmTasks('grunt-smart-vlt');

grunt.registerTask('vlt', ['svlt:init', 'svlt']);

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
