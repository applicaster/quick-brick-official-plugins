import React from 'react';
import { useState } from "react";
import {
    Text,
    TouchableHighlight
} from "react-native";

export function KeyButton(props) {

    const keypad = props.keypad;
    const [isClicked, setIsClicked] = useState(false);

    function onPress() {
        props.callback(props.num);
    }

    function onHideUnderlay() {
        setIsClicked(false);
    }

    function onShowUnderlay() {
        setIsClicked(true);
    }

    function buttonStyle() {
        return {
            width: 68,
            height: 68,
            borderRadius: keypad.keypadCornerRadius,
            backgroundColor: keypad.defaultBackground,
            borderWidth: keypad.borderWidth,
            borderColor: isClicked ? keypad.activeBorderColor : keypad.defaultBorderColor,
            margin: 10,
            alignItems: 'center',
            justifyContent: 'center'
        }
    }

    function numberStyle() {
        return {
            width: 68,
            color: isClicked ? keypad.activeColor : keypad.defaultColor,
            fontSize: keypad.fontSize,
            fontFamily: keypad.font,
            textAlign: 'center',
            textAlignVertical: 'center'
        }
    }

    function renderButton() {
        return (
            <TouchableHighlight
                activeOpacity={1}
                underlayColor={keypad.activeBackground}
                style={buttonStyle()}
                onShowUnderlay={() => onShowUnderlay()}
                onHideUnderlay={() => onHideUnderlay()}
                onPress={() => onPress()}
            >
                <Text style={numberStyle()}>
                    {props.num}
                </Text>
            </TouchableHighlight>
        );
    }

    return renderButton();
}
