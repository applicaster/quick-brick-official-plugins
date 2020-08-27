/* eslint-disable max-len */

const R = require("ramda");

const min_zapp_sdk = {
  ios: "20.0.0",
  android: "20.0.0",
  ios_for_quickbrick: "0.1.0-alpha1",
  android_for_quickbrick: "0.1.0-alpha1",
};

const androidPlatforms = [
  "android",
  "android_for_quickbrick",
];

const api = {
  apple: {
    require_startup_execution: false,
    modules: [],
    plist: {
      NSVideoSubscriberAccountUsageDescription: "This app accesses your TV provider information in order to enable you to watch your TV shows inside the app."
    }
  },
  android: {
    require_startup_execution: false,
    class_name: "com.applicaster.adobe.login.AdobePassPackage",
    react_packages: [
      "com.applicaster.adobe.login.AdobePassPackage"
    ]
  }
};

const project_dependencies = {
  apple: [],
  android: [
    {
      "quick-brick-adobe-primetime-auth": "quick_brick/node_modules/@applicaster/quick-brick-adobe-primetime-auth/android"
    }
  ],
};

const extra_dependencies = {
  apple: [
    {
      AdobePrimetimeAuthQB: ":path => './quick_brick/node_modules/@applicaster/quick-brick-adobe-primetime-auth/ios/AdobePrimetimeAuthQB.podspec'"
    }
  ],
  android: [],
};

const baseManifest = {
  dependency_repository_url: [],
  dependency_name: "@applicaster/quick-brick-adobe-primetime-auth",
  author_name: "Olga Duk",
  author_email: "oduk@scand.com",
  name: "Adobe Primetime Authentication QuickBrick",
  description: "Adobe Access enabler library implementation for use for SSO with TV Providers - supporting Apple SSO and TVE SSO",
  type: "login",
  screen: true,
  react_native: true,
  identifier: "adobe-primetime-auth-qb",
  ui_builder_support: true,
  whitelisted_account_ids: [],
  deprecated_since_zapp_sdk: "",
  unsupported_since_zapp_sdk: "",
  preload: true,
  general: {
    fields: [
      {
        group: true,
        label: "Screen Design and Text",
        tooltip: "These fields affect the design of the main screen plugin.",
        folded: true,
        fields: [
          {
            type: "text_input",
            key: "authorization_default_error_message",
            label: "Authorization default error message",
            initial_value: "Your package doesn’t include this channel, pleas contact your TV provider"
          },
          {
            type: "color_picker_rgba",
            key: "header_color",
            label: "Header Color",
            label_tooltip: "Color for the header which contains the title and instructions texts.",
            initial_value: "rgba(45, 45, 52, 1)"
          },
          {
            type: "color_picker_rgba",
            key: "list_background_color",
            label: "List Background Color",
            label_tooltip: "Background color for the MVPD List Screen.",
            initial_value: "rgba(228, 223, 223, 1)"
          },
          {
            type: "color_picker_rgba",
            key: "list_separator_color",
            label: "List Separator Color",
            label_tooltip: "Color for the item list separator.",
            initial_value: "rgba(151, 151, 151, 1)"
          },
          {
            type: "text_input",
            key: "title_text",
            label: "Title Text",
            label_tooltip: "Text at the top of the screen. Briefly introduces the purpose of the plugin (22 characters max).",
            initial_value: "Choose Your Provider",
            placeholder: "Choose Your Provider"
          },
          {
            type: "number_input",
            key: "title_text_fontsize",
            label: "Title Text Fontsize",
            label_tooltip: "Fontsize for title Text.",
            initial_value: "28"
          },
          {
            type: "color_picker_rgba",
            key: "title_text_color",
            label: "Title Text Color",
            label_tooltip: "Color for title Text.",
            initial_value: "rgba(255, 255, 255, 1)"
          },
          {
            type: "text_input",
            key: "instructions_text",
            label: "Instructions Text",
            label_tooltip: "Text to give specific instructions to the user, about the use of the plugin. (90 characters max)",
            initial_value: "Select your cable provider and sign in(have your username and password handy)",
            placeholder: "Select your cable provider and sign in(have your username and password handy)"
          },
          {
            type: "number_input",
            key: "instructions_text_fontsize",
            label: "Instructions Text Fontsize",
            label_tooltip: "Fontsize for instructions Text.",
            initial_value: "13"
          },
          {
            type: "color_picker_rgba",
            key: "instructions_text_color",
            label: "Instructions Text Color",
            label_tooltip: "Color for instructions Text.",
            initial_value: "rgba(255, 255, 255, 1)"
          },
          {
            type: "number_input",
            key: "list_item_fontsize",
            label: "MVPD List Item Fontsize",
            label_tooltip: "Fontsize for the MVPD’s names.",
            initial_value: "21"
          },
          {
            type: "color_picker_rgba",
            key: "list_item_color",
            label: "MVPD List Item Color",
            label_tooltip: "Color for the MVPD’s names.",
            initial_value: "rgba(0, 0, 0, 1)"
          },
          {
            type: "text_input",
            key: "logout_dialog_message_text",
            label: "Logout Dialog Message Text",
            label_tooltip: "Text to double check the decision made by the user.",
            initial_value: "Are you sure you want to sign out?"
          },
          {
            type: "number_input",
            key: "mvpd_logo_width",
            label: "MVPD Logo width",
            initial_value: "100"
          },
          {
            type: "number_input",
            key: "mvpd_logo_height",
            label: "MVPD Logo height",
            initial_value: "33"
          }
        ]
      }
    ]
  },
  hooks: {
    fields: [
      {
        group: true,
        label: "Before Load",
        folded: true,
        fields: [
          {
            key: "preload_plugins",
            type: "preload_plugins_selector",
            label: "Select Plugins"
          }
        ]
      }
    ]
  },
  targets: ["mobile"],
  ui_frameworks: ["quickbrick"],
};

const getConfiguration = (basePlatform) => {
  const isAndroid = basePlatform === "android";
  const key = isAndroid ? "android" : "ios";

  const additionalFields = [{
    type: "text_input",
    key: "deep_link",
    label: "Deep Link (Android)",
    label_tooltip: "Redirect uri assigned by adobe for the specific client's application"
  }];

  const configFields = [
    {
      type: "text_input",
      key: `base_url_${key}`,
      label: `Base URL ${key}`,
      label_tooltip: "Determines which Adobe’s backend environment the plugin should use.",
      placeholder: "Enter your base url here"
    },
    {
      type: "text_input",
      key: "software_statement",
      label: "Software Statement",
      label_tooltip: "JWT token issued by Adobe for the specific client’s application."
    },
    {
      type: "text_input",
      key: "requestor_id",
      label: "Requestor ID",
      label_tooltip: "The ID assigned for the client by Adobe."
    },
    {
      type: "text_input",
      key: "resource_id",
      label: "Resource ID",
      label_tooltip: "The ID assigned for the client’s resource by Adobe."
    },
    {
      type: "switch",
      key: "enable_custom_logos",
      label: "Enable custom logos",
      label_tooltip: "Enable custom logos for auth providers"
    },
    {
      type: "uploader",
      key: "custom_logos_json_file",
      label: "Custom logos json file",
      label_tooltip: "Json file with custom logos"
    }
  ];

  return [
    {
      group: true,
      label: "Adobe Authentication Settings",
      folded: true,
      fields: addFieldsIfNeeded(configFields, additionalFields, isAndroid)
    }
  ];
};

function addFieldsIfNeeded(baseFields, additionalFields, condition) {
  return condition ? baseFields.concat(additionalFields) : baseFields;
}

function createManifest({ version, platform }) {
  const basePlatform = R.includes(platform, androidPlatforms)
    ? "android"
    : "apple";

  const manifest = {
    ...baseManifest,
    platform,
    dependency_version: version,
    manifest_version: version,
    api: api[basePlatform],
    project_dependencies: project_dependencies[basePlatform],
    extra_dependencies: extra_dependencies[basePlatform],
    min_zapp_sdk: min_zapp_sdk[platform],
    custom_configuration_fields: getConfiguration(basePlatform),
    npm_dependencies: [],
  };

  return manifest;
}

module.exports = createManifest;
