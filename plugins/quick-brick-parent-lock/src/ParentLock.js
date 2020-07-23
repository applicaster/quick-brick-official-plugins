import React from 'react';
import { useState, useEffect }from "react";
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import { getCustomPluginData, PluginContext } from "./PluginData/PluginData";
import { getStyles } from "./Styles/Styles";
import { createChallenge } from "./Utils/Utils";
import { Keyboard} from "./Components/Keyboard";
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

    let challengeNumber = null;

    const [inputArray, setInputArray] = useState([]);
    const [challengeString, setChallengeString] = useState("");
    const [error, setError] = useState(false);

    const pluginData = getCustomPluginData(props.screenData, props.configuration);
    const styles = getStyles(pluginData);

    useEffect(() => {
        generateChallenge();
    }, []);

    function generateChallenge() {
        const transform = pluginData.challenge.transform;
        const result = createChallenge(transform);

        setChallengeString(result.string);
        challengeNumber = result.number;
    }

    function closeHook() {
        const { callback, payload, navigator } = props;
        return callback
            ? callback({ success: false, payload })
            : navigator.goBack();
    }

    function inputNumber(number) {
        debugger;
        number = 1;
        const newArray = inputArray + number;
        setError(false);
        setInputArray(newArray);
        if (newArray.length == 2) {
            const resultNumber = Number(inputArray[0]) * 10 + Number(inputArray[1]);
            if (resultNumber != challengeNumber) {
                setError(true);
                setInputArray([]);
                challengeNumber = null;
                generateChallenge();
            }
        }
    }

    function renderBackground() {
        const type = pluginData.backgroundStyle.type;
        const imageUrl = pluginData.backgroundStyle.image;
        if (type == 'Image' && imageUrl) {
            return (
                <ImageBackground source={{ uri: imageUrl }} style={styles.backgroundImage}>
                    {renderContent()}
                </ImageBackground>
            );
        } else {
            return (
                <View style={styles.backgroundColor}>
                    {renderContent()}
                </View>
            );
        }
    }

    function renderContent() {
        return (
            <SafeAreaView style = {{ flex: 1 }}>
                <View>{renderCloseButton()}</View>
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
            <TouchableOpacity onPress={() => closeHook()}>
                <Image source={{ uri: imageUrl }} style={styles.closeButton}/>
            </TouchableOpacity>
        )
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
        )
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
        return(
            <View>
                <View style={styles.inputContainer}>
                    <View style={styles.inputLabelsContainer}>
                        <View style={styles.mathLabel}>
                            <Text style={styles.mathText}>{inputArray[0] || ''}</Text>
                        </View>
                        <View style={styles.mathLabel}>
                            <Text style={styles.mathText}>{inputArray[1] || ''}</Text>
                        </View>
                    </View>
                    {renderDeleteButton()}
                </View>

            </View>
        );
    }

    function renderDeleteButton() {
        const imageUrl = pluginData.deleteIconURL;
        if (inputArray.length > 0) {
            return (
                <TouchableOpacity style={styles.deleteButtonContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.deleteIconURL}/>
                </TouchableOpacity>
            );
        }
    }

    function renderKeyboard() {
        return Keyboard({
            callback: () => inputNumber(),
            keypad: pluginData.keypad,
            styles: styles
        });
    }

    return renderBackground();
}

export default storeConnector(ParentLock);
