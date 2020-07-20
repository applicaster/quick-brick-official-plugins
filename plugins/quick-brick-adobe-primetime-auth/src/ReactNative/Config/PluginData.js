import React from 'react';
import { getPluginData } from '../Utils';

export function getCustomPluginData(screenData) {
  const {
    header_color: headerColor,
    list_background_color: listBackgroundColor,
    list_separator_color: listSeparatorColor,
    title_text: titleText,
    title_text_fontsize: titleTextFontsize,
    title_text_color: titleTextColor,
    instructions_text: instructionsText,
    instructions_text_fontsize: instructionsTextFontsize,
    instructions_text_color: instructionsTextColor,
    list_item_fontsize: listItemFontsize,
    list_item_color: listItemColor,
    logout_dialog_message_text: logoutDialogMessageText,
    mvpd_logo_width: logoWidth,
    mvpd_logo_height: logoHeight
  } = getPluginData(screenData);

  const titleTextStyle = {
    color: titleTextColor,
    fontSize: titleTextFontsize
  };

  const instructionsTextStyle = {
    color: instructionsTextColor,
    fontSize: instructionsTextFontsize
  };

  const listItemStyle = {
    color: listItemColor,
    fontSize: listItemFontsize
  };

  const customText = {
    titleText,
    instructionsText,
    logoutDialogMessageText
  };

  const customStyle = {
    headerColor,
    listBackgroundColor,
    listSeparatorColor
  };

  const logoStyle = {
    logoHeight,
    logoWidth
  };

  return {
    titleTextStyle,
    instructionsTextStyle,
    listItemStyle,
    customText,
    customStyle,
    logoStyle
  };
}

export const PluginContext = React.createContext();
