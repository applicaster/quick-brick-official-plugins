import React from 'react';
import * as R from 'ramda';
import {
    StyleSheet,
    View,
    Text
} from "react-native";

export function PinKeyboard(props) {

    function renderButton(num) {
        return (<Text
                      style={styles.btn}>{num}
        </Text>);
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
    },
    btn: {
        color: 'white',
        fontSize: 50,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 35,
        textAlign: 'center',
        margin: 10,
    }
});
