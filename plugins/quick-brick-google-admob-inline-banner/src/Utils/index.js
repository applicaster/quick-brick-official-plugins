import { Dimensions, Platform } from 'react-native';
import { BannerAdSize } from '@react-native-firebase/admob';

const { height, width } = Dimensions.get('window');
const aspectRatio = height / width;
const isMobile = !Platform.isTV;


const isTablet = isMobile && aspectRatio < 1.6;

const isAndroid = Platform.OS === 'android';

const defaultFontSize = 10;

function getBannerSize(bannerAdType) {
  const standartBanner = isTablet ? BannerAdSize.LEADERBOARD : BannerAdSize.BANNER;

  const bannerTypes = {
    standard_banner: standartBanner,
    smart_banner: BannerAdSize.SMART_BANNER,
    adaptive_banner: BannerAdSize.FLUID,
    box_banner: BannerAdSize.MEDIUM_RECTANGLE
  }

  return bannerTypes[bannerAdType];
}

export {
  isTablet,
  isAndroid,
  defaultFontSize,
  getBannerSize
}


