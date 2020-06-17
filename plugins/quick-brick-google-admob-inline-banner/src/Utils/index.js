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

  const banners = {
    [bannerTypes.standard]: standartBanner,
    [bannerTypes.smart]: BannerAdSize.SMART_BANNER,
    [bannerTypes.adaptive]: BannerAdSize.FLUID,
    [bannerTypes.box]: BannerAdSize.MEDIUM_RECTANGLE
  };

  return banners[bannerAdType];
}

export {
  isTablet,
  isAndroid,
  getBannerSize
};
