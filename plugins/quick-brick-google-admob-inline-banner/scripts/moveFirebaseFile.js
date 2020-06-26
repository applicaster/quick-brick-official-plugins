const https = require('https');
const fs = require('fs');
const path = require('path');

const pluginIdentifier = 'google-admob-inline-banner-qb';

const targetFolderPath = path.join('..', '..', '..', '..', '..', 'firebase.json'); // put firebase.json on the same level with zapp-platform-android
const targetRootPath = path.join('..', '..', '..', '..', 'firebase.json'); // put firebase.json to the root of zapp-platform-android
const pathToPluginConfig = path.join('..', '..', '..', '..', 'config', 'android', 'plugin_configurations.json');


// eslint-disable-next-line consistent-return
function getConfigFile(dest, id) {
  try {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const pluginConfig = require(dest);

    const firebasePlugin = pluginConfig.find((item) => item.plugin.identifier === id);
    return firebasePlugin.configuration_json.admob_configuration_json;
  } catch (err) {
    console.log('Cannot find path to config file');
  }
}

function download(url, dest, cb) {
  fs.access(dest, fs.F_OK, (err) => {
    if (err) {
      const file = fs.createWriteStream(dest);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close(cb);
        });
      });
    }
  });
}

const configFileUrl = getConfigFile(pathToPluginConfig, pluginIdentifier);

if (configFileUrl) {
  download(configFileUrl, targetFolderPath);
  download(configFileUrl, targetRootPath);
}
