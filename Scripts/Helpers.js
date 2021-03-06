#!/usr/bin/env node

const fs = require("fs");
const plist = require("plist");
const semver = require("semver");
const moment = require("moment");

function readFrameworkDataPlist() {
  const plistData = fs.readFileSync("./FrameworksData.plist", "utf8");
  const parsedData = plist.parse(plistData);
  return parsedData;
}

function proccessArgs() {
  return process.argv.slice(2);
}

function abort(message) {
  console.log(message);
  process.exit(1);
}

function circleBranch() {
  const { CIRCLE_BRANCH } = process.env;
  return CIRCLE_BRANCH;
}

function isMasterBranch() {
  return circleBranch() == "master";
}

function compareVersion(ver1, ver2) {
  return semver.gt(ver1, ver2);
}

function automationVersionsDataJSON() {
  const json = fs.readFileSync(".versions_automation.json", "utf8");
  try {
    return JSON.parse(json);
  } catch (e) {
    return {};
  }
}

async function updateAutomationVersionsDataJSON(data) {
  const json = JSON.stringify(data);
  fs.writeFileSync(".versions_automation.json", json, {
    encoding: "utf8"
  });
  return true;
}

function gitTagDate() {
  return moment().format("Y.M.D.H-M-S");
}

function basePathForModel(model) {
  if (model) {
    const { framework = null} = model;
    return `Plugins/${framework}`;
  }
  return null;
}

async function runInSequence(items, asyncFunc) {
  return items.reduce(async (previous, current) => {
    await previous;
    return asyncFunc(current);
  }, Promise.resolve());
}

async function runInParallel(commands) {
  const promises = commands.map(command => command());
  const result = await Promise.all(promises);
  return result;
}

module.exports = {
  basePathForModel,
  readFrameworkDataPlist,
  proccessArgs,
  abort,
  circleBranch,
  compareVersion,
  isMasterBranch,
  automationVersionsDataJSON,
  updateAutomationVersionsDataJSON,
  gitTagDate,
  runInSequence,
  runInParallel
};
