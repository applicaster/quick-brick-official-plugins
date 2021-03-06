import React from 'react';
import { getPluginData } from '../Utils/Utils';
import { Platform } from "react-native";
import { updateString } from "../Utils/Utils";

export function getCustomPluginData(screenData) {
    const {
        instructions_text: instructionsText,
        instructions_text_font_ios: instructionsFontIOS,
        instructions_text_font_android: instructionsFontAndroid,
        instructions_text_font_size: instructionsFontSize,
        instructions_text_font_color: instructionsTextColor,
        instructions_text_transform: instructionsTextTransform,
        instructions_text_margin: instructionsTextMargin,

        challenge_text_font_ios: challengeFontIOS,
        challenge_text_font_android: challengeFontAndroid,
        challenge_text_font_size: challengeFontSize,
        challenge_text_font_color: challengeTextColor,
        challenge_text_transform: challengeTextTransform,
        challenge_text_margin: challengeTextMargin,

        error_message_text: errorMessageText,
        error_message_text_font_ios: errorMessageFontIOS,
        error_message_text_font_android: errorMessageFontAndroid,
        error_message_text_font_size: errorMessageFontSize,
        error_message_text_font_color: errorMessageTextColor,
        error_message_text_transform: errorMessageTextTransform,
        error_message_text_margin: errorMessageTextMargin,

        math_answer_text_font_ios: mathAnswerFontIOS,
        math_answer_text_font_android: mathAnswerFontAndroid,
        math_answer_text_font_size: mathAnswerFontSize,
        math_answer_text_font_color: mathAnswerTextColor,

        math_answer_underline_color: mathAnswerUnderlineColor,
        math_answer_underline_height: mathAnswerUnderlineHeight,
        math_answer_margin_bottom: mathAnswerBottomMargin,

        delete_icon_image: deleteIconURL,

        keypad_font_ios: keypadFontIOS,
        keypad_font_android: keypadFontAndroid,
        keypad_font_size: keypadFontSize,

        keypad_default_color: keypadDefaultColor,
        keypad_active_color: keypadActiveColor,
        keypad_default_background_color: keypadDefaultBackground,
        keypad_active_background_color: keypadActiveBackground,

        keypad_default_border_color: keypadDefaultBorderColor,
        keypad_active_border_color: keypadActiveBorderColor,

        keypad_border_width: keypadBorderWidth,
        keypad_corner_radius: keypadCornerRadius,

        background_type: backgroundType,
        background_color: backgroundColor,
        background_image: backgroundImageURL,
        close_button_image: closeButtonImageURL,
        close_button_position: closeButtonPosition
    } = getPluginData(screenData);


    const closeButtonStyle = {
        image: closeButtonImageURL,
        position: closeButtonPosition
    };

    const backgroundStyle = {
        type: backgroundType || 'Color',
        image: backgroundImageURL,
        color: backgroundColor
    };

    const instructionsStyle = {
        text: updateString(instructionsText, instructionsTextTransform),
        font: Platform.OS === 'ios' ? instructionsFontIOS : instructionsFontAndroid,
        fontSize: Number(instructionsFontSize) || 20,
        color: instructionsTextColor,
        bottomMargin: Number(instructionsTextMargin) || 16
    };

    const errorMessage = {
        text: updateString(errorMessageText,errorMessageTextTransform),
        font: Platform.OS === 'ios' ? errorMessageFontIOS : errorMessageFontAndroid,
        fontSize: Number(errorMessageFontSize) || 20,
        color: errorMessageTextColor,
        bottomMargin: Number(errorMessageTextMargin) || 16
    }

    const challenge = {
        font: Platform.OS === 'ios' ? challengeFontIOS : challengeFontAndroid,
        fontSize: Number(challengeFontSize) || 20,
        color: challengeTextColor,
        transform: challengeTextTransform,
        bottomMargin: Number(challengeTextMargin) || 16
    }

    const mathAnswer = {
        font: Platform.OS === 'ios' ? mathAnswerFontIOS : mathAnswerFontAndroid,
        fontSize: Number(mathAnswerFontSize) || 20,
        color: mathAnswerTextColor,

        underlineColor: mathAnswerUnderlineColor,
        underlineHeight: Number(mathAnswerUnderlineHeight) || 5,
        bottomMargin: Number(mathAnswerBottomMargin) || 16
    }

    const keypad = {
        font: Platform.OS === 'ios' ? keypadFontIOS : keypadFontAndroid,
        fontSize: Number(keypadFontSize) || 20,
        defaultColor: keypadDefaultColor,
        defaultBackground: keypadDefaultBackground,

        activeColor: keypadActiveColor,
        activeBackground: keypadActiveBackground,

        defaultBorderColor: keypadDefaultBorderColor,
        activeBorderColor: keypadActiveBorderColor,

        borderWidth: Number(keypadBorderWidth) || 2,
        keypadCornerRadius: Number(keypadCornerRadius) || 34
    }

    return {
        instructionsStyle,
        backgroundStyle,
        closeButtonStyle,
        errorMessage,
        challenge,
        mathAnswer,
        deleteIconURL,
        keypad
    };
}

export const PluginContext = React.createContext();
