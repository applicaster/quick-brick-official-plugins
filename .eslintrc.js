module.exports = {
  extends: "airbnb",
  parser: "babel-eslint",
  env: {
    jest: true,
  },
  rules: {
    "no-use-before-define": "off",
    "switch-default": false,
    "react/jsx-filename-extension": "off",
    "react/prop-types": "off",
    "comma-dangle": "off",
    quotes: "double",
  },
  globals: {
    fetch: false,
  },
};
