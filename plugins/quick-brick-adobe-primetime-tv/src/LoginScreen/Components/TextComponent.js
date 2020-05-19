import React, { useContext } from 'react';
import {
  View,
  Text,
  ActivityIndicator
} from 'react-native';
import { PluginContext } from '../Config/PluginData';

function TextComponent(props) {
  const {
    loading = false,
    pinCode = ''
  } = props;

  const {
    mainInstructionsStyle,
    goToUrlStyle,
    activationUrlStyle,
    codeInstructionsStyle,
    activationCodeStyle,
    customText
  } = useContext(PluginContext);

  return (
    <>
      <Text
        style={[mainInstructionsStyle, styles.title]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {customText.mainInstructions}
      </Text>
      <Text
        style={[goToUrlStyle, styles.text]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {customText.goToUrl}
      </Text>
      <Text
        style={[activationUrlStyle, styles.url]}
      >
        {customText.activationUrl}
      </Text>
      <Text
        style={codeInstructionsStyle}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {customText.codeInstructions}
      </Text>
      <View style={styles.activationCode}>
        {
          loading
            ? <ActivityIndicator size="small" color="#D8D8D8" />
            : (
              <Text
                style={activationCodeStyle}
                adjustsFontSizeToFit
              >
                {pinCode}
              </Text>
            )
        }
      </View>
    </>
  );
}

export default TextComponent;

const styles = {
  title: {
    marginTop: '1.4%',
    marginBottom: '8%'
  },
  text: {
    marginBottom: '1.4%'
  },
  url: {
    marginBottom: '2%',
  },
  activationCode: {
    marginTop: '5.2%',
    width: '80%'
  }
};
