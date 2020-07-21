import React from 'react';
import { View, Text } from 'react-native';


export default function BannerWrapper(props) {
  const {
    bannersWithBackground,
    showBackground,
    backgroundColor,
    titleStyle,
    title,
    children,
    accessibilityLabel
  } = props;

  const bannerBackground = showBackground ? backgroundColor : '';

  if (!bannersWithBackground) {
    return (
      <View style={styles.bannerContainer}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bannerBackground }, accessibilityLabel]}>
      {
        showBackground && (
          <Text
            style={titleStyle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        )
      }
      <View
        accessibilityLabel={accessibilityLabel}
        testID={accessibilityLabel}
      >
        {children}
      </View>
    </View>
  );
}

const defaultContainerStyle = {
  paddingTop: 13,
  paddingBottom: 12,
  marginBottom: 10,
};

const styles = {
  container: {
    flex: 1,
    ...defaultContainerStyle,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerContainer: {
    maxHeight: 90,
    ...defaultContainerStyle
  },
  banner: {
    alignSelf: 'center'
  }
};
