package com.clothesstore

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import vn.zalopay.sdk.ZaloPaySDK
import vn.zalopay.sdk.Environment

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "ClothesStore"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    // Thêm hàm onCreate để khởi tạo ZPDK
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Khởi tạo ZalopaySDK với AppID và Environment tương ứng
        ZaloPaySDK.init(2554, Environment.SANDBOX);
    }
}

