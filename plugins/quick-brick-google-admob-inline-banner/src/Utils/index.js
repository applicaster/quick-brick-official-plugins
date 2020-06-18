import { Dimensions, Platform } from 'react-native';
import { BannerAdSize } from '@react-native-firebase/admob';
import { bannerTypes } from '../Config';

const { height, width } = Dimensions.get('window');
const aspectRatio = height / width;
const isMobile = !Platform.isTV;

const isTablet = isMobile && aspectRatio < 1.6;

const isAndroid = Platform.OS === 'android';

function getBannerSize(bannerAdType) {
  const standartBanner = isTablet ? BannerAdSize.LEADERBOARD : BannerAdSize.BANNER;
  // FLUID banners are not rendered on Android
  const adaptiveBanner = isAndroid ? BannerAdSize.SMART_BANNER : BannerAdSize.FLUID;

  const banners = {
    [bannerTypes.standard]: standartBanner,
    [bannerTypes.smart]: BannerAdSize.SMART_BANNER,
    [bannerTypes.adaptive]: adaptiveBanner,
    [bannerTypes.box]: BannerAdSize.MEDIUM_RECTANGLE
  };

  return banners[bannerAdType] || standartBanner;
}

function getBannersWithBackground(bannerAdType) {
  return bannerAdType === bannerTypes.standard
    || bannerAdType === bannerTypes.box;
}

export {
  isTablet,
  isAndroid,
  getBannerSize,
  getBannersWithBackground
};
