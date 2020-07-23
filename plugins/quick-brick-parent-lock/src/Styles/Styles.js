import React from 'react';
import {
    StyleSheet
} from 'react-native';

export function getStyles(pluginData) {
    const styles = StyleSheet.create({
        backgroundColor: {
            flex: 1,
            backgroundColor: pluginData.backgroundStyle.color
        },
        backgroundImage: {
            flex: 1,
            resizeMode: 'cover',
            justifyContent: 'center'
        },
        closeButton: closeButtonStyle(pluginData),
        controlsContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            top: 50,
            paddingLeft: 30,
            paddingRight: 30
        },
        instructions: {
            color: pluginData.instructionsStyle.color,
            fontSize: pluginData.instructionsStyle.fontSize,
            fontFamily: pluginData.instructionsStyle.font,
            textAlign: 'center',
            marginBottom: pluginData.instructionsStyle.bottomMargin
        },
        errorMessage: {
            height: 30,
            color: pluginData.errorMessage.color,
            fontSize: pluginData.errorMessage.fontSize,
            fontFamily: pluginData.errorMessage.font,
            textAlign: 'center',
            marginBottom: pluginData.errorMessage.bottomMargin
        },
        challenge: {
            color: pluginData.challenge.color,
            fontSize: pluginData.challenge.fontSize,
            fontFamily: pluginData.challenge.font,
            textAlign: 'center',
            marginBottom: pluginData.challenge.bottomMargin
        },
        inputContainer: {
            flexDirection: 'row',
            marginBottom: pluginData.mathAnswer.bottomMargin
        },
        leftSideContainer: {
            width: '50%',
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        rightSideContainer: {
            width: '50%',
            flexDirection: 'row',
            justifyContent: 'flex-start'
        },
        deleteButtonContainer: {
            height: 60,
            marginHorizontal: 30,
            justifyContent: 'center',
            alignItems: 'center'
        },
        mathLabel: {
            borderBottomWidth: pluginData.mathAnswer.underlineHeight,
            borderBottomColor: pluginData.mathAnswer.underlineColor,
            height: 60,
            width: 40,
            marginHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        mathText: {
            color: pluginData.mathAnswer.color,
            fontSize: pluginData.mathAnswer.fontSize,
            fontFamily: pluginData.mathAnswer.font,
            textAlign: 'center'
        },
        deleteIcon: {
            width: 40,
            height: 40,
            resizeMode: 'contain'
        }
    });

    return styles;
}

function closeButtonStyle(pluginData) {
    const position = pluginData.closeButtonStyle.position;
    if (position == "Right") {
        return {
            position: 'absolute',
            top: 10,
            right: 10,
            width: 50,
            height: 50,
            resizeMode: 'contain'
        }
    } else {
        return {
            position: 'absolute',
            top: 10,
            left: 10,
            width: 50,
            height: 50,
            resizeMode: 'contain'
        }
    }
}
