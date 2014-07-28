"use strict";

var csslint = null,
    config = require("./config"),
    logger = null,
    lintOptions = {};

var _log = function (fileName, message) {
  var msg =  "CSSLint Warning: " + message.message + " In [[ " + fileName + " ]],";
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

    if (outputText && outputText.length > 0) {
      var doit = true;

      if (config.csslint.exclude && config.csslint.exclude.indexOf(fileName) !== -1) {
        doit = false;
      }

      if (config.csslint.excludeRegex && fileName.match(config.csslint.excludeRegex)) {
        doit = false;
      }

      if (doit) {
        if (options.isCopy && !options.isVendor && !config.csslint.copied) {
          logger.debug("Not linting copied css [[" + fileName + " ]]");
        } else if (options.isVendor && !config.csslint.vendor) {
          logger.debug("Not linting vendor css [[ " + fileName + " ]]");
        } else if (options.isJavascript && !options.isCopy && !config.csslint.compiled) {
          logger.debug("Not linting compiled css [[ " + fileName + "]]");
        } else {
          var result = csslint.verify(outputText, lintOptions);
          result.messages.forEach( function(message) {
            _log(fileName, message);
          });
        }
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

  if (config.csslint.vendor) {
    logger.debug("vendor being linted, so everything needs to pass through linting");
    extensions = config.extensions.css;
  } else if (config.csslint.copied && config.csslint.compiled) {
    logger.debug("Linting compiled/copied CSS only");
    extensions = config.extensions.css;
  } else if (config.csslint.copied) {
    logger.debug("Linting copied CSS only");
    extensions = ["css"];
  } else if (config.csslint.compiled) {
    logger.debug("Linting compiled CSS only");
    extensions = config.extensions.css.filter(function (ext) { return ext !== "css"; } );
  } else {
    logger.debug("CSS linting is entirely turned off");
    extensions = [];
  }

  if (extensions.length === 0) {
    return;
  }

  register(["add","update","buildExtension","buildFile"], "beforeWrite", _lint, extensions);
};

module.exports = {
  registration: registration,
  defaults: config.defaults,
  placeholder: config.placeholder,
  validate: config.validate
};
