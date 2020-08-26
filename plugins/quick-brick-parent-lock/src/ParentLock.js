import React from 'react';
import { useState, useEffect }from "react";
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import { getCustomPluginData, PluginContext } from "./PluginData/PluginData";
import { getStyles } from "./Styles/Styles";
import { createChallenge } from "./Utils/Utils";
import { Keyboard } from "./Components/Keyboard";
import LoadingComponent from "./Components/LoadingComponent";
import {
    ImageBackground,
    Image,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity
} from "react-native";

const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
    const values = Object.values(state.rivers);
    const screenData = values.find(
        ({ type }) => type === 'parent-lock-qb'
    );
    return { screenData };
});

function ParentLock(props) {

    const [challengeNumber, setChallengeNumber] = useState(0);
    const [inputArray, setInputArray] = useState([]);
    const [challengeString, setChallengeString] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const pluginData = getCustomPluginData(props.screenData);
    const styles = getStyles(pluginData);

    useEffect(() => {
        generateChallenge();
    }, []);

    function generateChallenge() {
        const transform = pluginData.challenge.transform;
        const result = createChallenge(transform);

        setChallengeString(result.string);
        setChallengeNumber(result.number);
    }

    function successHook() {
        const { callback, payload, navigator } = props;
        return callback
            ? callback({ success: true, payload })
            : navigator.goBack();
    }

    function closeHook() {
        const { callback, payload, navigator } = props;
        return callback
            ? callback({ success: false, payload })
            : navigator.goBack();
    }

    function inputNumber(number) {
        const newArray = inputArray;
        newArray.push(number);
        setError(false);
        setInputArray(newArray);
        if (newArray.length === 2) {
            const resultNumber = inputArray[0] * 10 + inputArray[1];
            setLoading(true);
            setTimeout(() => {
                validateAnswer(resultNumber);
            }, 1000)
        }
    }

    function validateAnswer(resultNumber) {
        if (resultNumber !== challengeNumber) {
            setLoading(false);
            setError(true);
            setInputArray([]);
            setChallengeNumber(0);
            generateChallenge();
        } else {
            successHook();
        }
    }

    function deleteNumber() {
        setInputArray([]);
    }

    function renderBackground() {
        const type = pluginData.backgroundStyle.type;
        const imageUrl = pluginData.backgroundStyle.image;
        if (type == 'Image' && imageUrl) {
            return (
                <ImageBackground source={{ uri: imageUrl }} style={styles.backgroundImage}>
                    {renderContent()}
                    {loading && <LoadingComponent />}
                </ImageBackground>
            );
        } else {
            return (
                <View style={styles.backgroundColor}>
                    {renderContent()}
                    {loading && <LoadingComponent />}
                </View>
            );
        }
    }

    function renderContent() {
        return (
            <SafeAreaView  style={{flex: 1}}>
                {renderCloseButton()}
                <View style = {styles.controlsContainer}>
                    {renderInstructions()}
                    {renderError()}
                    {renderChallenge()}
                    {renderInput()}
                    {renderKeyboard()}
                </View>
            </SafeAreaView>
        )
    }

    function renderCloseButton() {
        const imageUrl = pluginData.closeButtonStyle.image;
        return (
            <View style={styles.closeButtonContainer}>
                <TouchableOpacity onPress={() => closeHook()}>
                    <Image source={{ uri: imageUrl }} style={styles.closeButton}/>
                </TouchableOpacity>
            </View>
        );
    }

    function renderInstructions() {
        return (
            <Text
                style={styles.instructions}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {pluginData.instructionsStyle.text}
            </Text>
        );
    }

    function renderError() {
        return (
            <Text
                style={styles.errorMessage}
                numberOfLines={1}
            >
                {error ? pluginData.errorMessage.text : null}
            </Text>
        );
    }

    function renderChallenge() {
        if (challengeString) {
            return (
                <Text
                    style={styles.challenge}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {challengeString}
                </Text>
            );
        }
    }

    function renderInput() {
        const valueOne = typeof inputArray[0] !== 'undefined' ? inputArray[0] : '';
        const valueTwo = typeof inputArray[1] !== 'undefined' ? inputArray[1] : '';
        return(
            <View>
                <View style={styles.inputContainer}>
                    <View style={styles.leftSideContainer}>
                        <View style={styles.mathLabel}>
                            <Text style={styles.mathText}>{valueOne}</Text>
                        </View>
                    </View>
                    <View style={styles.rightSideContainer}>
                        <View style={styles.mathLabel}>
                            <Text style={styles.mathText}>{valueTwo}</Text>
                        </View>
                        {renderDeleteButton()}
                    </View>
                </View>

            </View>
        );
    }

    function renderDeleteButton() {
        const imageUrl = pluginData.deleteIconURL;
        if (inputArray.length > 0) {
            return (
                <TouchableOpacity
                    onPress={() => deleteNumber()}
                    style={styles.deleteButtonContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.deleteIcon}/>
                </TouchableOpacity>
            );
        }
    }

    function renderKeyboard() {
        return Keyboard({
            callback: (number) => inputNumber(number),
            keypad: pluginData.keypad,
            styles: styles
        });
    }

    return renderBackground();
}

export default storeConnector(ParentLock);
