import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { PluginContext } from '../Config/PluginData';


function AdditionalInfo() {
  const {
    additionalInfoStyle,
    customText: {
      additionalInfo
    }
  } = useContext(PluginContext);

  return (
    <View style={styles.bottomText}>
      <Text
        style={additionalInfoStyle}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {additionalInfo}
      </Text>
    </View>
  );
}

const styles = {
  bottomText: {
    marginTop: 88
  }
};

export default AdditionalInfo;
