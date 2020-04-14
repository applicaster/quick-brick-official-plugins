//
//  AdobePrimetimeAuthProvider.m
//  AdobeAccessEnablerQB
//
//  Created by brel on 3/24/20.
//

@import React;
#import <React/RCTEventEmitter.h>
@interface RCT_EXTERN_REMAP_MODULE(AdobePassContract, AdobePrimetimeAuthProvider, RCTEventEmitter)

RCT_EXTERN_METHOD(setupAccessEnabler:(NSDictionary*) pluginConfig)
RCT_EXTERN_METHOD(setProviderID:(NSString*) providerID)
RCT_EXTERN_METHOD(startLoginFlow:(NSDictionary*) additionalParameters callback:(RCTResponseSenderBlock) callback)
RCT_EXTERN_METHOD(logout:(RCTResponseSenderBlock) callback)
@end
