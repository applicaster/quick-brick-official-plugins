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
  const { listItemStyle } = useContext(PluginContext);

  const logoURL = item.list_logo || item.logoURL;

  return (
    <TouchableOpacity onPress={() => setProviderID(item)}>
      <View style={styles.cellContainer}>
        <Text style={[listItemStyle, { fontWeight: 'bold' }]}>{title}</Text>
        <Image
          style={styles.cellImage}
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
  },
  cellImage: {
    height: 33,
    width: 100,
    resizeMode: 'contain'
  }
});
