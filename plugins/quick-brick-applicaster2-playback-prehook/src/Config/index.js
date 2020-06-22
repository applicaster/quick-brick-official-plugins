const CONFIG = {
  BASE_URL: 'https://admin.applicaster.com/v12/accounts',
  ver: '1.2',
  os_version: 28,
  PATH_TO_APPLICASTER2_NAMESPACE: ['zapp', 'applicaster.v2'],
  LINK_HREF_PATH: ['link', 'href'],
  VOD_ITEM_STREAM_URL_PATH: ['vod_item', 'stream_url'],
  CHANNEL_STREAM_URL_PATH: ['channel', 'stream_url'],
  REQUEST_TO_APPLICASTER2_FAILED_ERROR_MESSAGE: 'request to applicaster failed',
  JWT: 'JWT',
  HS256: 'HS256',
  CONFIG_AUTH_PROVIDER_ID_PATH: ['configuration', 'auth_provider_id'],
  JWT_SECRET_PATH: ['configuration', 'jwt_secret'],
  NO_JWT_MESSAGE: 'no jwt secret found in configuration'
};

export default CONFIG;
