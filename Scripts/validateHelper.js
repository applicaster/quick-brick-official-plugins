#!/usr/bin/env node
// set -e

const {
  readFrameworkDataPlist,
  abort,
  basePathForModel
} = require("./Helpers.js");
const fs = require("fs");

function validateSingleFramework(frameworkToCheck) {
  const frameworksList = readFrameworkDataPlist();
  console.log(`\nValidating Framework: '${frameworkToCheck}'\n`);
  let pluginData = frameworksList[frameworkToCheck];
  console.log({ pluginData });
  pluginData["framework"] = frameworkToCheck;
  if (
    pluginData &&
    validateSingleFrameworkDataInPlist(pluginData) &&
    validateSingleFrameworkPathes(pluginData)
  ) {
    console.log(`\n'${frameworkToCheck}' is Valid`);
  } else {
    abort(
      `\nError: Framework: '${frameworkToCheck}' Validation failed.`
    );
  }
}

function validateSingleFrameworkDataInPlist(model) {
  const baseFolderPath = basePathForModel(model);

  const { version_id = null, framework = null } = model;
  if (framework && version_id && baseFolderPath) {
    console.log(
      `Framework: '${framework}' All keys was defined in 'FrameworksData.plist'`
    );
    return true;
  } else {
    console.log(
      `Framework: '${framework}': Required data in 'FrameworksData.plist' does not exists`
    );
    return false;
  }
}

function validateSingleFrameworkPathes(model) {
  const baseFolderPath = basePathForModel(model);

  const {framework = null } = model;

  console.log(
    `Validating requiered pathes for Framework: ${framework}, BasePath: '${baseFolderPath}'`
  );
  const succeedText = `framework: '${framework}':All required files exist`;

  if (
    fs.existsSync(`${baseFolderPath}/manifests`)
  ) {
      if (
        fs.existsSync(`${baseFolderPath}/manifests/ios.json.ejs`) ||
        fs.existsSync(`${baseFolderPath}/manifests/ios_qb.json.ejs`) ||
        fs.existsSync(`${baseFolderPath}/manifests/tvos.json.ejs`) ||
        fs.existsSync(`${baseFolderPath}/manifests/tvos_qb.json.ejs`) ||
        fs.existsSync(`${baseFolderPath}/manifests/android.json.ejs`) ||
        fs.existsSync(`${baseFolderPath}/manifests/android_qb.json.ejs`)
      ) {
        if (
          fs.existsSync(`${baseFolderPath}/package.json`)
        ) {
          console.log(succeedText);
          return true;
        }
      }
  }
  return false;
}

module.exports = { validateSingleFramework };
