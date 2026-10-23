#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

@interface RCTAppIconManager : NSObject <RCTBridgeModule>
@end

@implementation RCTAppIconManager

RCT_EXPORT_MODULE(AppIconManager)

RCT_REMAP_METHOD(setVariant,
                 setVariant:(NSString *)variant
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (![UIApplication sharedApplication].supportsAlternateIcons) {
    resolve(nil);
    return;
  }

  NSString *iconName = [variant isEqualToString:@"diwali"] ? @"AppIconDiwali" : nil;
  dispatch_async(dispatch_get_main_queue(), ^{
    // Only change when needed: every change shows iOS's "You have changed the icon" alert.
    NSString *current = [UIApplication sharedApplication].alternateIconName;
    if ((current == nil && iconName == nil) || [current isEqualToString:iconName]) {
      resolve(nil);
      return;
    }
    [[UIApplication sharedApplication] setAlternateIconName:iconName completionHandler:^(NSError * _Nullable error) {
      if (error != nil) {
        reject(@"ICON_CHANGE_FAILED", error.localizedDescription, error);
      } else {
        resolve(nil);
      }
    }];
  });
}

@end
