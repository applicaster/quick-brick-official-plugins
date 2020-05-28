#!/usr/bin/env node

const renderFile = require("cli-task-runner/utils/render");
require("dotenv").config();

async function updateTemplate(ejsData, templatePath, outputPath) {
  console.log({ ejsData, templatePath, outputPath });
  return await renderFile(templatePath, outputPath, ejsData);
}

function manifestPath({ model, platform, template }) {
  const { plugin = null, framework = null } = model;
  iosPath =
    template == true
      ? `plugins/${framework}/manifests/ios.json.ejs`
      : `plugins/${framework}/manifests/ios.json`;
  iosQBPath =
    template == true
      ? `plugins/${framework}/manifests/ios_qb.json.ejs`
      : `plugins/${framework}/manifests/ios_qb.json`;
  tvosPath =
    template == true
      ? `plugins/${framework}/manifests/tvos.json.ejs`
      : `plugins/${framework}/manifests/tvos.json`;
  tvosQBPath =
    template == true
      ? `plugins/${framework}/manifests/tvos_qb.json.ejs`
      : `plugins/${framework}/manifests/tvos_qb.json`;
  androidPath =
    template == true
      ? `plugins/${framework}/manifests/android.json.ejs`
      : `plugins/${framework}/manifests/android.json`;
  androidQBPath =
    template == true
      ? `plugins/${framework}/manifests/android_qb.json.ejs`
      : `plugins/${framework}/manifests/android_qb.json`;
  if (
    (platform == "ios" || platform == "ios_qb" ||
    platform == "tvos" || platform == "tvos_qb" ||
    platform == "android" || platform == "android_qb") &&
    template != null
  ) {
    if (platform == "ios") {
      return iosPath;
    } else if (platform == "ios_qb") {
      return iosQBPath;
    } else if (platform == "tvos") {
      return tvosPath;
    } else if (platform == "tvos_qb") {
      return tvosQBPath;
    } else if (platform == "android") {
      return androidPath;
    } else if (platform == "android_qb") {
      return androidQBPath;
    }
  } else {
    return null;
  }
}

module.exports = { updateTemplate, manifestPath };
