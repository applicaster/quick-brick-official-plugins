const baseManifest = {
  plugin: {
    api: {},
    dependency_repository_url: ["https://github.com/applicaster/zapp-pipes"],
    author_name: "Zapp",
    author_email: "zapp@applicaster.com",
    name: "Test TS DSP",
    description:
      "General Data Source provider plugin, which is used for parsing atom xml, json, and web url data sources",
    type: "data_source_provider",
    identifier: "demo-ts-dsp",
    dependency_name: "@applicaster/zapp-pipes-provider-demo-typescript-dsp",
    scheme: "demo-ts-dsp",
    whitelisted_account_ids: [],
    min_zapp_sdk: "",
    ui_builder_support: true,
    data_types: [
      {
        label: "Feed",
        value: "feed",
        documentation: {
          link: "https://developer.applicaster.com/Zapp-Pipes/5.-Feed-API.html",
          input_description: "A JSON based spec for RSS or ATOM Feeds",
          input_placeholder: "Type in the json feed url",
          input_description_image_url: "",
        },
      },
    ],
    targets: ["mobile", "tv"],
  },
  configuration_json: null,
};

const minZappSdk = {
  ios: "20.0.0",
  android: "20.1.0",
};

function createManifest({ version, platform }) {
  const manifest = {
    ...baseManifest,
    platform,
    manifest_version: version,
    dependency_version: version,
  };

  manifest.min_zapp_sdk = minZappSdk[platform];

  if (platform === "android") {
    manifest.api = {
      class: "",
      proguard_rules: [],
    };
  }
}

module.exports = createManifest;
