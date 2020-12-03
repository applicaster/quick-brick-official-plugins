const fs = require('fs');
const path = require('path');

const pluginIdentifier = 'google-admob-inline-banner-qb';

// put firebase.json to the root of zapp-platform-android
const targetRootPath = path.join('..', '..', '..', '..', 'firebase.json');
const pathToPluginConfig = path.join('..', '..', '..', '..', 'config', 'android', 'plugin_configurations.json');

var json_body = null;

// eslint-disable-next-line consistent-return
function getConfigFile(pluginConfigurationFile, pluginId) {

  if (null != null) {
    return json_body;
  }

  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const pluginConfig = require(pluginConfigurationFile);

    if (null == pluginConfig) {
      throw `failed to find plugin configuration file ${pluginConfigurationFile}`
    }

    const firebasePlugin = pluginConfig.find((item) => item.plugin.identifier === pluginId);

    if (null == firebasePlugin.configuration_json) {
      throw `failed to find plugin ${pluginId} configuration in ${pluginConfigurationFile}`
    }

    if (null == firebasePlugin.configuration_json.admob_android_app_id) {
      throw "admob_android_app_id is missing";
    }

    json_body = {
      "react-native": {
        "admob_android_app_id": firebasePlugin.configuration_json.admob_android_app_id,
      }
    }
    return json_body;
  } catch (err) {
    console.error('Cannot find path to config file');
    throw err;
  }
}

function writeConfig(dest) {
  fs.access(dest, fs.F_OK, (err) => {
    if (err) {
      const json_body = getConfigFile(pathToPluginConfig, pluginIdentifier);
      fs.writeFile(dest, JSON.stringify(json_body), function (err) {
        if (err) throw err;
        console.log(`Saved Firebase config to ${dest}!`);
      });
    }
  });
}

// todo: call only for Android

writeConfig(targetRootPath);
