import React, { useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { PluginContext } from '../Config/PluginData';


export default function ProviderCell({ item, setProviderID }) {
  const { title } = item;
  const { listItemStyle, logoStyle } = useContext(PluginContext);

  const logoURL = item.list_logo || item.logoURL;

  function cellImageStyle() {
    const height = logoStyle.logoHeight ? Number(logoStyle.logoHeight) : 33;
    const width = logoStyle.logoWidth ? Number(logoStyle.logoWidth) : 100;
    return { height: height, width: width, resizeMode: 'contain'};
  }

  return (
      <TouchableOpacity onPress={() => setProviderID(item)}>
        <View style={styles.cellContainer}>
          <Text style={[listItemStyle, { fontWeight: 'bold' }]}>{title}</Text>
          <Image
              style={cellImageStyle()}
              source={{ uri: logoURL }}
          />
        </View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cellContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
    paddingRight: 20,
    paddingLeft: 20
  }
});
