/* eslint-disable max-len */

const min_zapp_sdk = {
  ios: "20.0.0-Dev",
  android: "20.0.0-Dev",
  ios_for_quickbrick: "0.1.0-alpha1",
  android_for_quickbrick: "0.1.0-alpha1",
};

const baseManifest = {
  api: {},
  dependency_repository_url: [],
  dependency_name: "@applicaster/quick-brick-parent-lock",
  author_name: "Olga Duk",
  author_email: "oduk@scand.com",
  name: "Quick Brick Parent Lock",
  description: "Parent Lock Screen",
  type: "general",
  preload: true,
  screen: true,
  react_native: true,
  identifier: "parent-lock-qb",
  ui_builder_support: true,
  whitelisted_account_ids: [
    "5a4516fa41442c000b0195d6",
    "572a0a65373163000b000000",
  ],
  thumbnail: {},
  general: {
    fields: [
      {
        type: "switch",
        key: "import_parent_lock",
        label: "Use Parent Lock",
        label_tooltip: "Import Parent lock in other supported plugins.",
        initial_value: "true",
      },
      {
        group: true,
        label: "Screen Design and Text",
        tooltip: "These fields affect the design of the main screen plugin.",
        folded: true,
        fields: [
          {
            type: "select",
            key: "background_type",
            label: "Background type",
            label_tooltip:
              "Defines whether the background will use an image or a solid color.",
            options: [
              {
                text: "Color",
                value: "Color",
              },
              {
                text: "Image",
                value: "Image",
              },
            ],
            initial_value: "Image",
          },
          {
            type: "color_picker_rgba",
            key: "background_color",
            label: "Background Color",
            label_tooltip: "Color for the screen background.",
            initial_value: "rgba(22, 27, 38, 1)",
          },
          {
            type: "uploader",
            key: "background_image",
            label: "Background Image",
            label_tooltip: "Image for the screen background.",
          },
          {
            type: "uploader",
            key: "close_button_image",
            label: "Close Button Image",
            label_tooltip: "Image for the close button of the screen.",
          },
          {
            type: "select",
            key: "close_button_position",
            label: "Close Button Position",
            label_tooltip:
              "Determines the corner side of the screen where the button is placed.",
            options: [
              {
                text: "Left",
                value: "Left",
              },
              {
                text: "Right",
                value: "Right",
              },
            ],
            initial_value: "Right",
          },
          {
            type: "text_input",
            key: "instructions_text",
            label: "Instructions Text",
            label_tooltip:
              "General Instructions to give context about the code or challenge.",
            initial_value: "To continue, please enter the following code.",
          },
          {
            type: "ios_font_selector",
            key: "instructions_text_font_ios",
            label: "Instructions Text Font ios",
            label_tooltip: "Font for the instructions text.",
            initial_value: "SFProText-Bold",
          },
          {
            type: "android_font_selector",
            key: "instructions_text_font_android",
            label: "Instructions Text Font Android",
            label_tooltip: "Font for the instructions text.",
            initial_value: "Roboto-Black",
          },
          {
            type: "number_input",
            key: "instructions_text_font_size",
            label: "Instructions Text Font Size",
            label_tooltip: "Font size for the instructions text.",
            initial_value: "18",
          },
          {
            type: "color_picker_rgba",
            key: "instructions_text_font_color",
            label: "Instructions Text Font Color",
            label_tooltip: "Font color for the instructions text.",
            initial_value: "rgba(255, 255, 255, 1)",
          },
          {
            type: "select",
            key: "instructions_text_transform",
            label: "Instructions Text Transform",
            label_tooltip: "Reformats the Instructions Text if needed.",
            options: [
              {
                text: "None",
                value: "None",
              },
              {
                text: "Uppercase",
                value: "Uppercase",
              },
              {
                text: "Lowercase",
                value: "Lowercase",
              },
              {
                text: "Capitalize",
                value: "Capitalize",
              },
            ],
            initial_value: "None",
          },
          {
            type: "number_input",
            key: "instructions_text_margin",
            label: "Instructions Text Margin",
            label_tooltip:
              "Margin between the Instructions section and the Code/Challenge section.",
            initial_value: "16",
          },
          {
            type: "ios_font_selector",
            key: "challenge_text_font_ios",
            label: "Challenge Text Font ios",
            label_tooltip: "Font for the dynamically generated code/challenge.",
            initial_value: "SFProText-Bold",
          },
          {
            type: "android_font_selector",
            key: "challenge_text_font_android",
            label: "Challenge Text Font Android",
            label_tooltip: "Font for the dynamically generated code/challenge.",
            initial_value: "Roboto-Black",
          },
          {
            type: "number_input",
            key: "challenge_text_font_size",
            label: "Challenge Text Font Size",
            label_tooltip:
              "Font size for the dynamically generated code/challenge.",
            initial_value: "18",
          },
          {
            type: "color_picker_rgba",
            key: "challenge_text_font_color",
            label: "Challenge Text Font Color",
            label_tooltip:
              "Font color for the dynamically generated code/challenge.",
            initial_value: "rgba(255, 255, 255, 0.65)",
          },
          {
            type: "select",
            key: "challenge_text_transform",
            label: "Challenge Text Transform",
            label_tooltip: "Reformats the Code/Challenge Text if needed.",
            options: [
              {
                text: "None",
                value: "None",
              },
              {
                text: "Uppercase",
                value: "Uppercase",
              },
              {
                text: "Lowercase",
                value: "Lowercase",
              },
              {
                text: "Capitalize",
                value: "Capitalize",
              },
            ],
            initial_value: "None",
          },
          {
            type: "number_input",
            key: "challenge_text_margin",
            label: "Challenge Text Margin",
            label_tooltip:
              "Margin between the Code/Challenge section and the Indicators/Answer section.",
            initial_value: "16",
          },
          {
            type: "text_input",
            key: "error_message_text",
            label: "Error Message Text",
            label_tooltip: "Error message in case wrong answer.",
            initial_value: "Incorrect answer, please try again.",
          },
          {
            type: "ios_font_selector",
            key: "error_message_text_font_ios",
            label: "Error Message Text Font ios",
            label_tooltip: "Font for the wrong answer message.",
            initial_value: "SFProText-Bold",
          },
          {
            type: "android_font_selector",
            key: "error_message_text_font_android",
            label: "Error Message Text Font Android",
            label_tooltip: "Font for the wrong answer message.",
            initial_value: "Roboto-Black",
          },
          {
            type: "number_input",
            key: "error_message_text_font_size",
            label: "Error Message Text Font Size",
            label_tooltip: "Font size for the wrong answer message.",
            initial_value: "14",
          },
          {
            type: "color_picker_rgba",
            key: "error_message_text_font_color",
            label: "Error Message Text Font Color",
            label_tooltip: "Font color for the wrong answer message.",
            initial_value: "rgba(4, 207, 153, 1)",
          },
          {
            type: "select",
            key: "error_message_text_transform",
            label: "Error Message Text Transform",
            label_tooltip: "Reformats the Error Message Text if needed.",
            options: [
              {
                text: "None",
                value: "None",
              },
              {
                text: "Uppercase",
                value: "Uppercase",
              },
              {
                text: "Lowercase",
                value: "Lowercase",
              },
              {
                text: "Capitalize",
                value: "Capitalize",
              },
            ],
            initial_value: "None",
          },
          {
            type: "number_input",
            key: "error_message_text_margin",
            label: "Error Text Margin",
            label_tooltip:
              "Margin between the Error Message and the Indicators/Answer section.",
            initial_value: "16",
          },
          {
            type: "ios_font_selector",
            key: "math_answer_text_font_ios",
            label: "Math Answer Text Font ios",
            label_tooltip: "Font for the answer section.",
            initial_value: "SFProText-Medium",
          },
          {
            type: "android_font_selector",
            key: "math_answer_text_font_android",
            label: "Math Answer Text Font Android",
            label_tooltip: "Font for the answer section.",
            initial_value: "Roboto-Medium",
          },
          {
            type: "number_input",
            key: "math_answer_text_font_size",
            label: "Math Answer Text Font Size",
            label_tooltip: "Font size for the answer section.",
            initial_value: "28",
          },
          {
            type: "color_picker_rgba",
            key: "math_answer_text_font_color",
            label: "Math Answer Text Font Color",
            label_tooltip: "Font color for the answer section.",
            initial_value: "rgba(255, 255, 255, 1)",
          },
          {
            type: "color_picker_rgba",
            key: "math_answer_underline_color",
            label: "Math Answer Underline Color",
            label_tooltip: "Defines the color for the math answer underline.",
            initial_value: "rgba(255, 255, 255, 1)",
          },
          {
            type: "number_input",
            key: "math_answer_underline_height",
            label: "Math Answer Underline Height",
            label_tooltip: "Defines the height for the Math Answer underline.",
            initial_value: "5",
          },
          {
            type: "number_input",
            key: "math_answer_margin_bottom",
            label: "Math Answer Margin Bottom",
            label_tooltip:
              "Margin between the Math Answer  section and the keypad section.",
            initial_value: "50",
          },
          {
            type: "uploader",
            key: "delete_icon_image",
            label: "Delete Icon Image",
            label_tooltip: "Icon Image for the delete button.",
          },
          {
            type: "ios_font_selector",
            key: "keypad_font_ios",
            label: "Keypad Font Font ios",
            label_tooltip:
              "Font for the numbers presented in the numeric keyboard.",
            initial_value: "SFProText-Medium",
          },
          {
            type: "android_font_selector",
            key: "keypad_font_android",
            label: "Keypad Font Font Android",
            label_tooltip:
              "Font for the numbers presented in the numeric keyboard.",
            initial_value: "Roboto-Medium",
          },
          {
            type: "number_input",
            key: "keypad_font_size",
            label: "Keypad Font Size",
            label_tooltip:
              "Font size for the numbers presented in the numeric keyboard.",
            initial_value: "28",
          },
          {
            type: "color_picker_rgba",
            key: "keypad_default_color",
            label: "Keypad Default Color",
            label_tooltip: "Color for the keypad number.",
            initial_value: "rgba(255, 255, 255, 1)",
          },
          {
            type: "color_picker_rgba",
            key: "keypad_active_color",
            label: "Keypad Active Color",
            label_tooltip: "Color for the keypad number when it is pressed.",
            initial_value: "rgba(4, 207, 153, 1)",
          },
          {
            type: "color_picker_rgba",
            key: "keypad_default_background_color",
            label: "Keypad Default Background Color",
            label_tooltip: "Color for the keypad background.",
            initial_value: "rgba(255, 255, 255, 0.25)",
          },
          {
            type: "color_picker_rgba",
            key: "keypad_active_background_color",
            label: "Keypad Active Background Color",
            label_tooltip:
              "Color for the keypad background when it is pressed.",
            initial_value: "rgba(4, 207, 153, 0.35)",
          },
          {
            type: "color_picker_rgba",
            key: "keypad_default_border_color",
            label: "Keypad Default Border Color",
            label_tooltip: "Color for the keypad border color.",
            initial_value: "rgba(255, 255, 255, 0.25)",
          },
          {
            type: "color_picker_rgba",
            key: "keypad_active_border_color",
            label: "Keypad Active Border Color",
            label_tooltip:
              "Color for the keypad border color when it is pressed.",
            initial_value: "rgba(4, 207, 153, 1)",
          },
          {
            type: "number_input",
            key: "keypad_border_width",
            label: "Keypad Border Width",
            label_tooltip: "Width for the keypad.",
            initial_value: "2",
          },
          {
            type: "number_input",
            key: "keypad_corner_radius",
            label: "Keypad Corner Radius",
            label_tooltip: "Corner Radius for the keypad",
            initial_value: "34",
          },
        ],
      },
    ],
  },
  custom_configuration_fields: [],
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
            label: "Select Plugins",
          },
        ],
      },
    ],
  },
  export: {
    allowed_list: [
      {
        identifier: "quick-brick-inplayer",
        group: {
          label: "Allow Compatible Plugins",
          folded: true,
        },
        section: "styles",
        allowed_fields: [
          {
            section: "general",
            key: "import_parent_lock",
            min_zapp_sdk: {
              ios: "20.2.0-Dev",
              android: "20.0.0",
              ios_for_quickbrick: "0.1.0-alpha1",
              android_for_quickbrick: "0.1.0-alpha1",
            },
          },
        ],
      },
    ],
  },
  targets: ["mobile"],
  ui_frameworks: ["quickbrick"],
};

function createManifest({ version, platform }) {
  const manifest = {
    ...baseManifest,
    platform,
    dependency_version: version,
    manifest_version: version,
    min_zapp_sdk: min_zapp_sdk[platform],
    npm_dependencies: [],
  };

  return manifest;
}

module.exports = createManifest;
