import * as R from "ramda";

function buildVideoAdInfo(configuration) {
  const {
    tag_vmap_url,
    tag_preroll_url,
    tag_postroll_url,
    tag_midroll_url,
    midroll_offset,
  } = configuration;

  if (tag_vmap_url) {
    return tag_vmap_url;
  }

  const video_ads = [];

  if (tag_preroll_url) {
    video_ads.push({
      offset: "preroll",
      ad_url: tag_preroll_url,
    });
  }

  if (tag_postroll_url) {
    video_ads.push({
      offset: "postroll",
      ad_url: tag_postroll_url,
    });
  }

  if (tag_midroll_url && midroll_offset) {
    video_ads.push({
      offset: String(midroll_offset),
      ad_url: tag_midroll_url,
    });
  }

  return video_ads;
}

function runHook(payload, callback, configuration) {
  const hasAdExtensions = R.pathOr(false, ['extensions', 'video_ads'], payload);

  if (!hasAdExtensions && !!configuration) {
    const videoAds = buildVideoAdInfo(configuration);
    const payloadWithAds = R.mergeDeepRight(payload, { extensions: { video_ads: videoAds } });
    return callback({ success: true, payload: payloadWithAds });
  }
  callback({ success: true, payload });
}

export default {
  hasPlayerHook: true,
  presentFullScreen: false,
  isFlowBlocker: false,
  run: runHook,
};
