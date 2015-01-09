mimosa-csslint
===========

This is CSS linting module for Mimosa. It will use rules to test your CSS to ensure it is idiomatic.

* For more information regarding Mimosa, see http://mimosa.io
* For more info about csslint, check out http://www.csslint.net/

# Usage

Add `'csslint'` to your list of modules.  That's all!  Mimosa will install the module for you when you start `mimosa watch` or `mimosa build`.

# Functionality

When `mimosa watch` or `mimosa build` are executed this module will run csslint over your project's CSS files. This includes both regular `.css` as well as the output of pre-processors like SASS or LESS. csslint can be run on vendor files, but that is by default turned off.

# Default Config

```javascript
csslint: {
  exclude:[],
  compiled: true,
  copied: true,
  vendor: false,
  rules: {}
}
```

#### `csslint.exclude` array of string/regex
Files to exclude from linting. This setting is an array and can be comprised of strings or regexes. Strings are paths that can be relative to the `watch.compiledDir` or absolute. String paths must include the file name.

#### `csslint.compiled` boolean
When this property is set to `true`, compiled CSS (i.e. sass, less, stylus) will be csslinted.

#### `csslint.copied` boolean
When this property is set to `true`, copied CSS will be csslinted.

#### `csslint.vendor` boolean
When this property is set to `true`, vendor CSS will be csslinted. What files are vendor is determined by Mimosa core. Mimosa has a [`vendor`](http://mimosa.io/configuration.html#vendor) setting which indicates where vendor files are located.

#### `csslint.rules` object
If you disagree with any of the jshint settings, or want to turn some of the rules off, add [csslint overrides](https://github.com/CSSLint/csslint/wiki/Rules) as key/value pairs underneath this property.

