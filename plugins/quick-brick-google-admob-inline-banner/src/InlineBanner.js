import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { BannerAd, BannerAdSize } from '@react-native-firebase/admob';
import {
  isAndroid,
  isTablet,
  getBannerSize,
  getBannersWithBackground
} from './Utils';
import { defaultFontSize, adaptiveBannerRatio, bannerTypes } from './Config';
import trackEvent from './Analytics';
import BannerWrapper from './BannerWrapper';

const { width } = Dimensions.get('window');
const adaptiveBannerHeight = width / adaptiveBannerRatio;


export default function InlineBanner(props) {
  const {
    onLoadFinished,
    component: {
      styles: customStyles = {}
    } = {}
  } = props;

  const {
    background,
    background_color: backgroundColor = '',
    banner_ad_unit: bannerAdUnit = '',
    banner_ad_type: bannerAdType = '',
    title_font_android: fontAndroid = '',
    title_font_ios: fontIos = '',
    title_fontcolor: fontColor = '',
    title_fontsize: titleFontSize = defaultFontSize,
    title_tablet_fontsize: titleTabletFontSize = defaultFontSize,
    title_text: title = ''
  } = customStyles;

  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const tabletFontSize = Number(titleTabletFontSize);
  const fontSize = Number(titleFontSize);

  const titleStyle = {
    fontSize: isTablet ? tabletFontSize : fontSize,
    color: fontColor,
    fontFamily: isAndroid ? fontAndroid : fontIos
  };

  const bannerSize = getBannerSize(bannerAdType);
  const isAdaptive = bannerSize === BannerAdSize.FLUID;
  const bannersWithBackground = getBannersWithBackground(bannerAdType);
  const showBackground = loaded && background;

  const getBannerStyle = () => {
    if (isAdaptive) {
      return { height: adaptiveBannerHeight, width };
    }
    if (bannersWithBackground) {
      return { alignSelf: 'center' };
    }
    return {};
  };

  const errorHandler = (err) => {
    setError(err);
    trackEvent(err?.code, bannerAdUnit);
    console.log('Advert failed to load: ', err?.code);
  };

  onLoadFinished();

  if (error || !bannerAdUnit) return null;

  return (
    <BannerWrapper
      bannersWithBackground={bannersWithBackground}
      showBackground={showBackground}
      backgroundColor={backgroundColor}
      titleStyle={titleStyle}
      title={title}
      accessible={false}
      accessibilityLabel={bannerAdUnit}
    >
      <BannerAd
        unitId={bannerAdUnit}
        size={bannerSize}
        style={getBannerStyle()}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={errorHandler}
      />
    </BannerWrapper>
  );
}
