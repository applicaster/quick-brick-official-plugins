import React from 'react';
import { Platform } from 'react-native';
import { getPluginData, parseFontKey } from '../Utils';

export function getCustomPluginData(screenData) {
  const platformEndpoint = parseFontKey(Platform.OS);

  const {
    main_instructions_fontcolor: mainInstructionsFontColor,
    main_instructions_fontsize: mainInstructionsFontSize,
    [`main_instructions_font_${platformEndpoint}`]: mainInstructionsFont,
    go_to_url_fontcolor: goToUrlFontColor,
    go_to_url_fontsize: goToUrlFontSize,
    [`go_to_url_font_${platformEndpoint}`]: goToUrlFont,
    activation_url_fontcolor: activationUrlFontColor,
    activation_url_fontsize: activationUrlFontSize,
    [`activation_url_font_${platformEndpoint}`]: activationUrlFont,
    code_instructions_fontcolor: codeInstructionsFontColor,
    code_instructions_fontsize: codeInstructionsFontSize,
    [`code_instructions_font_${platformEndpoint}`]: codeInstructionsFont,
    activation_code_fontcolor: activationCodeFontColor,
    activation_code_fontsize: activationCodeFontSize,
    [`activation_code_font_${platformEndpoint}`]: activationCodeFont,
    qr_code_hint_fontcolor: qrCodeHintFontColor,
    qr_code_hint_fontsize: qrCodeHintFontSize,
    [`qr_code_hint_font_${platformEndpoint}`]: qrCodeHintFont,
    additional_info_fontcolor: additionalInfoFontColor,
    additional_info_fontsize: additionalInfoFontSize,
    [`additional_info_font_${platformEndpoint}`]: additionalInfoFont,
    retry_action_button_fontsize: retryButtonFontSize,
    retry_action_button_fontcolor: retryButtonFontColor,
    [`retry_action_button_font_${platformEndpoint}`]: retryButtonFont,
    close_action_button_fontsize: closeButtonFontSize,
    close_action_button_fontcolor: closeButtonFontColor,
    [`close_action_button_font_${platformEndpoint}`]: closeButtonFont,
    error_description_fontsize: errorDescriptionFontSize,
    error_description_fontcolor: errorDescriptionFontColor,
    [`error_description_font_${platformEndpoint}`]: errorDescriptionFont,
    confirmation_message_fontsize: confirmationMessageFontSize,
    confirmation_message_fontcolor: confirmationMessageFontColor,
    [`confirmation_message_font_${platformEndpoint}`]: confirmationMessageFont,
    cancel_action_button_fontsize: cancelButtonFontSize,
    cancel_action_button_fontcolor: cancelButtonFontColor,
    [`cancel_action_button_font_${platformEndpoint}`]: cancelButtonFont,
    confirm_action_button_fontsize: confirmButtonFontSize,
    confirm_action_button_fontcolor: confirmButtonFontColor,
    [`confirm_action_button_font_${platformEndpoint}`]: confirmButtonFont,
    activation_url_text: activationUrl = '',
    main_instructions_text: mainInstructions = '',
    go_to_url_text: goToUrl = '',
    code_instructions_text: codeInstructions = '',
    qr_code_hint_text: qrCodeHint = '',
    additional_info_text: additionalInfo = '',
    retry_action_button_text: retryLabel = '',
    close_action_button_text: closeLabel = '',
    confirmation_message_text: confirmationMessage = '',
    confirm_action_button_text: confirmLabel = '',
    cancel_action_button_text: cancelLabel = '',
    registration_url: registrationUrl = '',
    additional_info: isAdditionalInfo = false,
    confirm_action_button_background_color: confirmButtonBackground,
    cancel_action_button_background_color: cancelButtonBackground,
    activation_alert_background_color: errorScreenBackground,
    close_action_button_background_color: closeButtonBackground,
    retry_action_button_background_color: retryButtonBackground,
    activation_screen_background_color: loginScreenBackground
  } = getPluginData(screenData);

  const mainInstructionsStyle = {
    color: mainInstructionsFontColor,
    fontSize: mainInstructionsFontSize,
    fontFamily: mainInstructionsFont
  };

  const goToUrlStyle = {
    color: goToUrlFontColor,
    fontSize: goToUrlFontSize,
    fontFamily: goToUrlFont
  };

  const activationUrlStyle = {
    color: activationUrlFontColor,
    fontSize: activationUrlFontSize,
    fontFamily: activationUrlFont
  };

  const codeInstructionsStyle = {
    color: codeInstructionsFontColor,
    fontSize: codeInstructionsFontSize,
    fontFamily: codeInstructionsFont
  };

  const activationCodeStyle = {
    color: activationCodeFontColor,
    fontSize: activationCodeFontSize,
    fontFamily: activationCodeFont
  };

  const qrCodeHintStyle = {
    color: qrCodeHintFontColor,
    fontSize: qrCodeHintFontSize,
    fontFamily: qrCodeHintFont
  };

  const additionalInfoStyle = {
    color: additionalInfoFontColor,
    fontSize: additionalInfoFontSize,
    fontFamily: additionalInfoFont
  };

  const retryButtonStyle = {
    color: retryButtonFontColor,
    fontSize: retryButtonFontSize,
    fontFamily: retryButtonFont
  };

  const closeButtonStyle = {
    color: closeButtonFontColor,
    fontSize: closeButtonFontSize,
    fontFamily: closeButtonFont
  };

  const errorDescriptionStyle = {
    color: errorDescriptionFontColor,
    fontSize: errorDescriptionFontSize,
    fontFamily: errorDescriptionFont
  };

  const confirmationMessageStyle = {
    color: confirmationMessageFontColor,
    fontSize: confirmationMessageFontSize,
    fontFamily: confirmationMessageFont
  };

  const confirmButtonStyle = {
    color: confirmButtonFontColor,
    fontSize: confirmButtonFontSize,
    fontFamily: confirmButtonFont
  };

  const cancelButtonStyle = {
    color: cancelButtonFontColor,
    fontSize: cancelButtonFontSize,
    fontFamily: cancelButtonFont
  };

  const customText = {
    activationUrl,
    mainInstructions,
    goToUrl,
    codeInstructions,
    qrCodeHint,
    additionalInfo,
    retryLabel,
    closeLabel,
    confirmationMessage,
    confirmLabel,
    cancelLabel
  };

  const background = {
    confirmButtonBackground,
    cancelButtonBackground,
    errorScreenBackground,
    closeButtonBackground,
    retryButtonBackground,
    loginScreenBackground
  };

  return {
    mainInstructionsStyle,
    goToUrlStyle,
    activationUrlStyle,
    codeInstructionsStyle,
    activationCodeStyle,
    qrCodeHintStyle,
    additionalInfoStyle,
    retryButtonStyle,
    closeButtonStyle,
    errorDescriptionStyle,
    confirmationMessageStyle,
    confirmButtonStyle,
    cancelButtonStyle,
    customText,
    registrationUrl,
    isAdditionalInfo,
    background
  };
}

export const PluginContext = React.createContext();
