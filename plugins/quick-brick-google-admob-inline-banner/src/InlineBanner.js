import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BannerAd } from '@react-native-firebase/admob';
import { isAndroid, isTablet, getBannerSize } from './Utils';
import { defaultFontSize, adaptiveBannerRatio, bannerTypes } from './Config';
import trackEvent from './Analytics';

const { width } = Dimensions.get('window');
const adaptiveBannerHeight = width / adaptiveBannerRatio;


export default function InlineBanner(props) {
  const {
    onLoadFinished,
    onLoadFailed,
    component: {
      styles: customStyles
    }
  } = props;

  const {
    background,
    background_color: backgroundColor = '',
    banner_ad_unit: bannerAdUnit = '',
    banner_ad_type: bannerAdType,
    title_font_android: fontAndroid = '',
    title_font_ios: fontIos = '',
    title_fontcolor: fontColor = '',
    title_fontsize: titleFontSize = defaultFontSize,
    title_tablet_fontsize: titleTabletFontSize = defaultFontSize,
    title_text: title = ''
  } = customStyles;

  const [error, setError] = useState(null);

  const tabletFontSize = Number(titleTabletFontSize);
  const fontSize = Number(titleFontSize);

  const titleStyle = {
    fontSize: isTablet ? tabletFontSize : fontSize,
    color: fontColor,
    fontFamily: isAndroid ? fontAndroid : fontIos
  };

  const bannerSize = getBannerSize(bannerAdType);
  const isAdaptive = bannerAdType === bannerTypes.adaptive;
  const showBackground = background
    && (bannerAdType === bannerTypes.standard
      || bannerAdType === bannerTypes.box);

  onLoadFinished();
  if (error) return null;

  return (
    <View style={[styles.container, showBackground && { backgroundColor }]}>
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
      <BannerAd
        unitId={bannerAdUnit}
        size={bannerSize}
        style={[styles.banner, isAdaptive && { height: adaptiveBannerHeight, width }]}
        onAdFailedToLoad={(err) => {
          setError(err);
          trackEvent(err, bannerAdUnit);
          console.log('Advert failed to load: ', err);
          onLoadFailed();
        }}
      />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    paddingTop: 13,
    paddingBottom: 12,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  banner: {
    alignSelf: 'center'
  }
};
