"use strict";

var csslint = null,
    config = require("./config"),
    logger = null,
    lintOptions = {};

var _log = function (fileName, message) {
  var msg = "CSSLint Warning: " + message.message + " In [[ " + fileName + " ]],";
  if (message.line) {
    msg += " on line [[ " + message.line + " ]], column " + message.col + ",";
  }
  msg += " from CSSLint rule ID '" + message.rule.id + "'.";
  logger.warn(msg);
};

var _lint = function (config, options, next) {
  var hasFiles = options.files && options.files.length > 0;
  if (!hasFiles) {
    return next();
  }

  if ( !csslint ) {
    csslint = require("csslint").CSSLint;
    csslint.getRules().forEach( function(rule) {
      if (config.csslint.rules[rule.id] !== false) {
        lintOptions[rule.id] = 1;
      }
    });
  }

  options.files.forEach( function(file, i) {
    var outputText = file.outputFileText,
        fileName = file.inputFileName;

    if (outputText && outputText.length) {
      var isVendor = file.isVendor || (file.isVendor === undefined && options.isVendor);

      // excluded via string path?
      if (config.csslint.exclude && config.csslint.exclude.indexOf(fileName) !== -1) {
        logger.debug("Not linting css [[" + fileName + " ]], excluded via path");
      }

      // excluded via regex?
      else if (config.csslint.excludeRegex && fileName.match(config.csslint.excludeRegex)) {
        logger.debug("Not linting copied css [[" + fileName + " ]], excluded via regex");
      }

      // excluded because not linting copied assets?
      else if (options.isCopy && !isVendor && !config.csslint.copied) {
        logger.debug("Not linting copied css [[" + fileName + " ]]");
      }

      // excluded because not linting vendor assets?
      else if (isVendor && !config.csslint.vendor) {
        logger.debug("Not linting vendor css [[ " + fileName + " ]]");
      }

      // excluded because not linting compiled CSS
      else if (options.isJavascript && !options.isCopy && !config.csslint.compiled) {
        logger.debug("Not linting compiled css [[ " + fileName + "]]");
      }

      // linting!
      else {
        var result = csslint.verify(outputText, lintOptions);
        result.messages.forEach( function(message) {
          _log(fileName, message);
        });
      }
    }

    if (i === options.files.length - 1) {
      next();
    }
  });
};

var registration = function (config, register) {
  logger = config.log;
  var extensions = null;

  // vendor being linted, so everything needs to pass through linting
  if (config.csslint.vendor) {
    extensions = config.extensions.css;
  }

  // Linting compiled/copied CSS only
  else if (config.csslint.copied && config.csslint.compiled) {
    extensions = config.extensions.css;
  }

  // Linting copied CSS only
  else if (config.csslint.copied) {
    extensions = ["css"];
  }

  // Linting compiled CSS only
  else if (config.csslint.compiled) {
    extensions = config.extensions.css.filter(function (ext) {
      return ext !== "css";
    });
  }

  // CSS linting is entirely turned off
  else {
    extensions = [];
  }

  if ( !extensions.length ) {
    return;
  }

  register(
    ["add", "update", "buildExtension", "buildFile"],
    "beforeWrite",
    _lint,
    extensions);
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};
