import React from 'react';
import {
    StyleSheet,
    View,
} from "react-native";
import {KeyButton} from "./KeyButton";

export function Keyboard(props) {

    function renderButton(num) {
        return KeyButton({
            callback: props.callback,
            num: num,
            styles: props.styles,
            keypad: props.keypad
        })
    }

    function renderKeyboard() {
        return (
            <View>
                <View style={styles.row} >
                    {renderButton(1)}
                    {renderButton(2)}
                    {renderButton(3)}
                </View>

                <View style={styles.row} >
                    {renderButton(4)}
                    {renderButton(5)}
                    {renderButton(6)}
                </View>

                <View style={styles.row} >
                    {renderButton(7)}
                    {renderButton(8)}
                    {renderButton(9)}
                </View>

                <View style={styles.row} >
                    {renderButton(0)}
                </View>
            </View>
        );
    }

    return renderKeyboard();
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
