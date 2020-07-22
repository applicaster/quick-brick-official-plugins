import React from 'react';
import {
    StyleSheet
} from 'react-native';

export function getStyles(pluginData) {
    const styles = StyleSheet.create({
        backgroundColor: {
            flex: 1,
            backgroundColor: pluginData.backgroundStyle.color || 'black'
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
            fontSize: Number(pluginData.instructionsStyle.fontSize) || 20,
            fontFamily: pluginData.instructionsStyle.font,
            textAlign: 'center',
            marginBottom: Number(pluginData.instructionsStyle.bottomMargin) || 20
        },
        errorMessage: {
            color: pluginData.errorMessage.color,
            fontSize: Number(pluginData.errorMessage.fontSize) || 20,
            fontFamily: pluginData.errorMessage.font,
            textAlign: 'center',
            marginBottom: Number(pluginData.errorMessage.bottomMargin) || 20
        },
        challenge: {
            color: pluginData.challenge.color,
            fontSize: Number(pluginData.challenge.fontSize) || 20,
            fontFamily: pluginData.challenge.font,
            textAlign: 'center',
            marginBottom: Number(pluginData.challenge.bottomMargin) || 20
        },
        inputContainer: {
            flexDirection: 'row',
            marginBottom: Number(pluginData.mathAnswer.bottomMargin) || 20
        },
        inputLabelsContainer: {
            width: '50%',
            flexDirection: 'row',
            justifyContent: 'flex-end'
        },
        deleteButtonContainer: {
            flexDirection: 'row',
            width: '36%',
            justifyContent: 'flex-start'
        },
        mathLabel: {
            borderBottomWidth: Number(pluginData.mathAnswer.underlineHeight) || 2,
            borderBottomColor: pluginData.mathAnswer.underlineColor,
            width: 30,
            marginHorizontal: 10
        },
        mathText: {
            color: pluginData.mathAnswer.color,
            fontSize: Number(pluginData.mathAnswer.fontSize) || 20,
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
