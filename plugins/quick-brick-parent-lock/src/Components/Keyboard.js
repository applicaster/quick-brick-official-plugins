import React from 'react';
import * as R from 'ramda';
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight
} from "react-native";


export function Keyboard(props) {

    function addInput() {

    }

    function renderButton(num) {
        return KeyButton({
            num: num,
            styles: props.style
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
        justifyContent: 'center',
    }
});
