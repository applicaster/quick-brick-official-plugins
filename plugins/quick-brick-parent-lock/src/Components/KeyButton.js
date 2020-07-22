import React from 'react';
import * as R from 'ramda';
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight
} from "react-native";

export function KeyButton(props) {

    let isClicked = false;

    function onHideUnderlay() {
        isClicked = false;
    }

    function onShowUnderlay() {
        isClicked = true;
    }

    function renderButton() {
        return (
            <TouchableHighlight
                activeOpacity={1}
                style={
                    isClicked
                        ? styles.circleDefault
                        : styles.circleActive
                }
                underlayColor="green"
                onHideUnderlay={() => onHideUnderlay()}
                onShowUnderlay={() => onShowUnderlay()}
                onPress={() => addInput()}
            >
                <Text style={
                    isClicked
                        ? styles.keyNumberActive
                        : styles.keyNumberDefault
                }
                >
                    {num}
                </Text>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    circleActive: {
        width: 100,
        height: 100,
        backgroundColor:'red',
        borderWidth: 5,
        borderRadius: 30,
        borderColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 35,
        margin: 10,
    },
    circleDefault: {
        width: 100,
        height: 100,
        backgroundColor:'white',
        borderWidth: 5,
        borderRadius: 30,
        borderColor: 'blue',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 35,
        margin: 10
    },
    keyNumberActive: {
        width: 100,
        height: 100,
        color: 'red',
        fontSize: 50
    },
    keyNumberDefault: {
        width: 100,
        height: 100,
        color: 'white',
        fontSize: 50
    }
});
