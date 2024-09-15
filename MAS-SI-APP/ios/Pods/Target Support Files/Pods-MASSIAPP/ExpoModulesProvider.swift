/**
 * Automatically generated by expo-modules-autolinking.
 *
 * This autogenerated class provides a list of classes of native Expo modules,
 * but only these that are written in Swift and use the new API for creating Expo modules.
 */

import ExpoModulesCore
import ExpoAdapterGoogleSignIn
import ExpoAppleAuthentication
import EXApplication
import ExpoAsset
import ExpoBlur
import EXConstants
import ExpoDevice
import ExpoFileSystem
import ExpoFont
import ExpoHaptics
import ExpoImagePicker
import ExpoKeepAwake
import ExpoLinearGradient
import ExpoHead
import ExpoSystemUI
import ExpoVideo
import ExpoWebBrowser
import ReactNativeIosContextMenu
import ReactNativeIosUtilities

@objc(ExpoModulesProvider)
public class ExpoModulesProvider: ModulesProvider {
  public override func getModuleClasses() -> [AnyModule.Type] {
    return [
      AppleAuthenticationModule.self,
      ApplicationModule.self,
      AssetModule.self,
      BlurViewModule.self,
      ConstantsModule.self,
      DeviceModule.self,
      FileSystemModule.self,
      FontLoaderModule.self,
      HapticsModule.self,
      ImagePickerModule.self,
      KeepAwakeModule.self,
      LinearGradientModule.self,
      ExpoHeadModule.self,
      ExpoSystemUIModule.self,
      VideoModule.self,
      WebBrowserModule.self,
      RNIContextMenuViewModule.self,
      RNIContextMenuButtonModule.self,
      RNIDummyViewModule.self,
      RNIDetachedViewModule.self,
      RNIUtilitiesModule.self
    ]
  }

  public override func getAppDelegateSubscribers() -> [ExpoAppDelegateSubscriber.Type] {
    return [
      GoogleSignInAppDelegate.self,
      FileSystemBackgroundSessionHandler.self,
      ExpoHeadAppDelegateSubscriber.self
    ]
  }

  public override func getReactDelegateHandlers() -> [ExpoReactDelegateHandlerTupleType] {
    return [
    ]
  }
}