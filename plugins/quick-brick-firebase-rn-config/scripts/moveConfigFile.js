const https = require('https');
const fs = require('fs');
const path = require('path');

const targetPath = path.join('..', '..', '..', '..', 'firebase.json'); // put firebase.json to the root
const pathToRivers = path.join('..', '..', '..', '..', 'config', 'android', 'plugin_configurations.json');

// eslint-disable-next-line import/no-dynamic-require
const pluginConfig = require(pathToRivers);

const firebasePlugin = pluginConfig.find((item) => item.plugin.identifier === 'firebase-rn-config-android');
const configFileUrl = firebasePlugin.configuration_json.admob_configuration_json;


function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      console.log('firebase.json downloaded!');
      file.close(cb);
    });
  });
}

fs.access(targetPath, fs.F_OK, (err) => {
  console.log('Checking firebase.json file in the root directory');
  if (err) {
    console.log('No file, downloading');
    return download(configFileUrl, targetPath);
  }
  console.log('File exists, skipping');
  return;
});
