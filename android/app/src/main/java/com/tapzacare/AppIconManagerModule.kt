package com.tapzacare

import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppIconManagerModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "AppIconManager"

  @ReactMethod
  fun setVariant(variant: String, promise: Promise) {
    try {
      val manager = reactApplicationContext.packageManager
      val normal = ComponentName(reactApplicationContext, "com.tapzacare.MainActivityNormalIcon")
      val diwali = ComponentName(reactApplicationContext, "com.tapzacare.MainActivityDiwaliIcon")
      val useDiwali = variant == "diwali"
      val active = if (useDiwali) diwali else normal
      val inactive = if (useDiwali) normal else diwali

      // Skip when already set: toggling aliases makes some launchers redraw or briefly drop the icon.
      if (manager.getComponentEnabledSetting(inactive) == PackageManager.COMPONENT_ENABLED_STATE_DISABLED &&
        manager.getComponentEnabledSetting(active) == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) {
        promise.resolve(null)
        return
      }
      manager.setComponentEnabledSetting(active, PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
      manager.setComponentEnabledSetting(inactive, PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("ICON_CHANGE_FAILED", error)
    }
  }
}
