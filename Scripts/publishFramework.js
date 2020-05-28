#!/usr/bin/env node

const fs = require("fs");
const shell = require("cli-task-runner/utils/shell");
const { abort, basePathForModel, runInSequence } = require("./Helpers.js");

const {
  compareVersion,
  readFrameworkDataPlist,
  isMasterBranch,
  automationVersionsDataJSON,
  updateAutomationVersionsDataJSON,
  gitTagDate
} = require("./Helpers");

const { updateTemplate, manifestPath } = require("./publishFrameworkHelper");
run();
async function run() {
  if (isMasterBranch() == false) {
    console.log("Step was skipped, 'master' branch required");
    process.exit(0);
  }

  const frameworksList = readFrameworkDataPlist();
  const frameworksAutomationList = automationVersionsDataJSON();

  let itemsToUpdate = [];
  let newAutomationObject = {};

  const keys = Object.keys(frameworksList);

  keys.forEach(key => {
    const model = frameworksList[key];
    model["framework"] = key;
    const { framework = null, version_id = null } = model;
    const automationFrameworkVersion = frameworksAutomationList[framework];
    if (
      !automationFrameworkVersion ||
      compareVersion(version_id, automationFrameworkVersion)
    ) {
      console.log(`Adding framework to update list: ${framework}`);
      itemsToUpdate.push(model);
    }
    newAutomationObject[framework] = version_id;
  });

  if (itemsToUpdate.length > 0) {
    const newGitTag = gitTagDate();
    console.log({ itemsToUpdate });
    await updateRelevantTemplates(itemsToUpdate, newGitTag);
    await updateAutomationVersionsDataJSON(newAutomationObject);
    await uploadNpmPackages(itemsToUpdate);
    await uploadManifestsToZapp(itemsToUpdate);
    await commitChangesPushAndTag(itemsToUpdate, newGitTag);
  }
  console.log("System update has been finished!");
}

async function updateRelevantTemplates(itemsToUpdate, newGitTag) {
  try {
    const promises = itemsToUpdate.map(async model => {

      const ejsData = { version_id, new_tag: newGitTag };
      
      if (plugin) {
        const iosManifestPath = manifestPath({
          model,
          platform: "ios",
          template: false
        });
        const iosTemplatePath = manifestPath({
          model,
          platform: "ios",
          template: true
        });

        const iosQBManifestPath = manifestPath({
          model,
          platform: "ios_qb",
          template: false
        });
        const iosQBTemplatePath = manifestPath({
          model,
          platform: "ios_qb",
          template: true
        });

        const tvosManifestPath = manifestPath({
          model,
          platform: "tvos",
          template: false
        });
        const tvosTemplatePath = manifestPath({
          model,
          platform: "tvos",
          template: true
        });

        const tvosQBManifestPath = manifestPath({
          model,
          platform: "tvos_qb",
          template: false
        });
        const tvosQBTemplatePath = manifestPath({
          model,
          platform: "tvos_qb",
          template: true
        });

        const androidManifestPath = manifestPath({
          model,
          platform: "android",
          template: false
        });
        const androidTemplatePath = manifestPath({
          model,
          platform: "android",
          template: true
        });

        const androidQBManifestPath = manifestPath({
          model,
          platform: "android_qb",
          template: false
        });
        const androidQBTemplatePath = manifestPath({
          model,
          platform: "android_qb",
          template: true
        });

        if (fs.existsSync(iosTemplatePath)) {
          await updateTemplate(ejsData, iosTemplatePath, iosManifestPath);
        }
        if (fs.existsSync(iosQBTemplatePath)) {
          await updateTemplate(ejsData, iosQBTemplatePath, iosQBManifestPath);
        }
        if (fs.existsSync(tvosTemplatePath)) {
          await updateTemplate(ejsData, tvosTemplatePath, tvosManifestPath);
        }
        if (fs.existsSync(tvosQBTemplatePath)) {
          await updateTemplate(ejsData, tvosQBTemplatePath, tvosQBManifestPath);
        }
        if (fs.existsSync(androidTemplatePath)) {
          await updateTemplate(ejsData, androidTemplatePath, androidManifestPath);
        }
        if (fs.existsSync(androidQBTemplatePath)) {
          await updateTemplate(ejsData, androidQBTemplatePath, androidQBManifestPath);
        }
      }
    });
    return await Promise.all(promises);
  } catch (e) {
    abort(e.message);
  }
  return Promise.resolve();
}

async function uploadManifestsToZapp(itemsToUpdate) {
  console.log("Uploading manifests to Zapp");
  try {
    const promises = itemsToUpdate.map(async model => {
      const { framework = null, plugin = null } = model;

      const zappToken = process.env["ZAPP_TOKEN"];
      const zappAccount = process.env["ZAPP_ACCOUNT"];
      if (zappToken) {
        console.log(`Uploading manifests for: ${framework}`);

        const iosManifestPath = manifestPath({
          model,
          platform: "ios",
          template: false
        });
        const iosQBManifestPath = manifestPath({
          model,
          platform: "ios_qb",
          template: false
        });
        const tvosManifestPath = manifestPath({
          model,
          platform: "tvos",
          template: false
        });
        const tvosQBManifestPath = manifestPath({
          model,
          platform: "tvos_qb",
          template: false
        });
        const androidManifestPath = manifestPath({
          model,
          platform: "android",
          template: false
        });
        const androidQBManifestPath = manifestPath({
          model,
          platform: "android_qb",
          template: false
        });

        if (iosManifestPath && fs.existsSync(iosManifestPath)) {
          await shell.exec(
            `zappifest publish --manifest ${iosManifestPath} --access-token ${zappToken} --account ${zappAccount}`
          );
        }
        if (iosQBManifestPath && fs.existsSync(iosQBManifestPath)) {
          await shell.exec(
            `zappifest publish --manifest ${iosQBManifestPath} --access-token ${zappToken} --account ${zappAccount}`
          );
        }
        if (tvosManifestPath && fs.existsSync(tvosManifestPath)) {
          await shell.exec(
            `zappifest publish --manifest ${tvosManifestPath} --access-token ${zappToken} --account ${zappAccount}`
          );
        }
        if (tvosQBManifestPath && fs.existsSync(tvosQBManifestPath)) {
          await shell.exec(
            `zappifest publish --manifest ${tvosQBManifestPath} --access-token ${zappToken} --account ${zappAccount}`
          );
        }
        if (androidManifestPath && fs.existsSync(androidManifestPath)) {
          await shell.exec(
            `zappifest publish --manifest ${androidManifestPath} --access-token ${zappToken} --account ${zappAccount}`
          );
        }
        if (androidQBManifestPath && fs.existsSync(androidQBManifestPath)) {
          await shell.exec(
            `zappifest publish --manifest ${androidQBManifestPath} --access-token ${zappToken} --account ${zappAccount}`
          );
        }
      }
    });
    await Promise.all(promises);
  } catch (e) {
    abort(e.message);
  }
  return Promise.resolve();
}

async function commitChangesPushAndTag(itemsToUpdate, newGitTag) {
  try {
    await shell.exec("git add docs");
    await shell.exec("git add Frameworks");
    await shell.exec("git add README.md");
    await shell.exec("git add .versions_automation.json");
    let commitMessage = `System update, expected tag:${newGitTag}, frameworks:`;
    const promises = itemsToUpdate.map(async model => {
      const baseFolderPath = basePathForModel(model);

      const { framework = null, plugin = null } = model;
      if (!plugin) {
        await shell.exec(`git add ${framework}.podspec`);
      }

      await shell.exec(`git add ${baseFolderPath}`);
    });
    await Promise.all(promises);
    itemsToUpdate.forEach(model => {
      const { framework = null, version_id = null } = model;
      commitMessage += ` [${framework}:${version_id}]`;
    });
    console.log(`Message to commit: ${commitMessage}`);
    await shell.exec(`git commit -m "${commitMessage}"`);
    await shell.exec("git push origin master");
    await shell.exec(`git tag ${newGitTag}`);
    await shell.exec(`git push origin ${newGitTag}`);
  } catch (e) {
    abort(e.message);
  }

  return Promise.resolve();
}

async function uploadNpmPackages(itemsToUpdate) {
  const promises = itemsToUpdate.map(async model => {
    const baseFolderPath = basePathForModel(model);

    const { version_id = null, framework = null } = model;
    if (plugin) {
      console.log(`Publishing plugin:${framework}, version:${version_id}`);
      try {
        await shell.exec(
          `cd ${baseFolderPath} && yarn publish --new-version ${version_id} --no-git-tag-version`
        );
      } catch (e) {
        abort(e.message);
      }
    }
  });
  return await Promise.all(promises);
}
