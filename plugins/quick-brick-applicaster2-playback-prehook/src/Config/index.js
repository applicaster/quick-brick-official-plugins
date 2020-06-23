const CONFIG = {
  BASE_URL: 'https://admin.applicaster.com/v12/accounts',
  ver: '1.2',
  os_version: 28,
  bver: '2.1.6',
  JWT: 'JWT',
  HS256: 'HS256',
  ADOBE_EXP_IN: 86400,
  LINK_HREF_PATH: ['link', 'href'],
  VOD_ITEM_STREAM_URL_PATH: ['vod_item', 'stream_url'],
  CHANNEL_STREAM_URL_PATH: ['channel', 'stream_url'],
  CONFIG_AUTH_PROVIDER_ID_PATH: ['configuration', 'auth_provider_id'],
  PAYLOAD_REQUIRE_AUTH_PATH: ['extensions', 'requires_authentication'],
  PATH_TO_APPLICASTER2_NAMESPACE: ['zapp', 'applicaster.v2'],
  JWT_SECRET_PATH: ['configuration', 'jwt_secret'],
  REQUEST_TO_APPLICASTER2_FAILED_ERROR_MESSAGE: 'request to applicaster failed',
  NO_JWT_MESSAGE: 'no jwt secret found in configuration'
};

export default CONFIG;
