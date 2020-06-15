import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BannerAd } from '@react-native-firebase/admob';
import { isAndroid, isTablet, defaultFontSize, getBannerSize } from './Utils';


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

  const tabletFontSize = Number(titleTabletFontSize);
  const fontSize = Number(titleFontSize);

  const titleStyle = {
    fontSize: isTablet ? tabletFontSize : fontSize,
    color: fontColor,
    fontFamily: isAndroid ? fontAndroid : fontIos
  }

  const bannerSize = getBannerSize(bannerAdType);

  onLoadFinished();
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {
        background && <Text style={titleStyle}>{title}</Text>
      }
      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={bannerAdUnit}
          size={bannerSize}
          onAdLoaded={() => {
            console.log('Advert loaded');
          }}
          onAdFailedToLoad={(error) => {
            console.error('Advert failed to load: ', error);
          }}
        />
      </View>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    paddingTop: 13,
    paddingBottom: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerContainer: {
    width: Dimensions.get('window').width - 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
};
