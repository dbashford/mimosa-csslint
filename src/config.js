"use strict";

exports.defaults = function() {
  return {
    csslint: {
      exclude: [],
      compiled: true,
      copied: true,
      vendor: false,
      rules: {}
    }
  };
};

exports.placeholder = function() {
  var ph = "\n  csslint:                    # settings for CSS linting\n" +
     "    exclude:[]               # array of strings or regexes that match files to not csslint,\n" +
     "                             # strings are paths that can be relative to the watch.sourceDir\n" +
     "                             # or absolute\n" +
     "    compiled: true           # fire csslint on successful compile of meta-language to CSS\n" +
     "    copied: true             # fire csslint for copied CSS files\n" +
     "    vendor: false            # fire csslint for copied vendor CSS files (like bootstrap)\n" +
     "    rules:                   # Settings: http://www.csslint.com/options/, these settings will\n" +
     "                             # override any settings set up in the csslintrc\n" +
     "      floats: false          # This is an example override, this is not a default\n";
  return ph;
};

exports.validate = function (config, validators) {
  var errors = [];

  if (validators.ifExistsIsObject(errors, "csslint config", config.csslint)) {
    validators.ifExistsIsObject(errors, "csslint.rules", config.csslint.rules);
    validators.ifExistsFileExcludeWithRegexAndString(errors, "csslint.exclude", config.csslint, config.watch.sourceDir);

    ["compiled", "copied", "vendor"].forEach( function(type) {
      validators.ifExistsIsBoolean(errors, "csslint." + type, config.csslint[type]);
    });
  }

  return errors;
};
