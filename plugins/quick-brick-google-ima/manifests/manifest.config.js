const min_zapp_sdk = {
  android_tv_for_quickbrick: "0.1.0-alpha1",
  amazon_fire_tv_for_quickbrick: "0.1.0-alpha1",
  android: "20.0.0-dev",
  android_for_quickbrick: "0.1.0-alpha1",
};

const baseManifest = {
  api: {
    require_startup_execution: false,
    class_name: "com.applicaster.ima.QuickBrickGoogleIMA",
    react_packages: [
      "com.applicaster.quickbrickgoogleima.QuickBrickImaReactPackage",
    ],
  },
  dependency_repository_url: [],
  dependency_name: "@applicaster/quick-brick-google-ima",
  npm_dependencies: ["@applicaster/quick-brick-google-ima@0.3.3"],
  author_name: "Zapp Team",
  author_email: "zapp@applicaster.com",
  name: "Google Interactive Media Ads QuickBrick,",
  description:
    "This plugin allow to add Google Interactive Media Ads to supported players.",
  type: "advertisement",
  identifier: "zapp_google_interactive_media_ads",
  ui_builder_support: true,
  whitelisted_account_ids: [
    "572a0a65373163000b000000",
    "5ae06cef8fba0f00084bd3c6",
  ],
  deprecated_since_zapp_sdk: "",
  unsupported_since_zapp_sdk: "",
  react_native: true,
  react_bundle_url: "",
  extra_dependencies: [],
  project_dependencies: [
    {
      zapp_google_interactive_media_ads:
        "node_modules/@applicaster/quick-brick-google-ima/android",
    },
  ],
  targets: ["tv", "mobile"],
  ui_frameworks: ["quickbrick"],
  custom_configuration_fields: [
    {
      type: "text",
      key: "tag_vmap_url",
      tooltip_text: "VMAP URL",
      default: "",
    },
    {
      type: "text",
      key: "tag_preroll_url",
      tooltip_text: "Preroll URL",
      default: "",
    },
    {
      type: "text",
      key: "tag_postroll_url",
      tooltip_text: "Postroll URL",
      default: "",
    },
    {
      type: "text",
      key: "tag_midroll_url",
      tooltip_text: "Midroll URL",
      default: "",
    },
    {
      type: "text",
      key: "midroll_offset",
      tooltip_text: "Midroll offset",
      default: "",
    },
  ],
};

function createManifest({ version, platform }) {
  return {
    ...baseManifest,
    platform,
    manifest_version: version,
    dependency_version: version,
    min_zapp_sdk: min_zapp_sdk[platform],
  };
}

module.exports = createManifest;
