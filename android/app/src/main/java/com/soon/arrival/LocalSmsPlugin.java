package com.soon.arrival;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.telephony.SmsManager;
import android.util.Log;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.PermissionState;

@CapacitorPlugin(
    name = "LocalSms",
    permissions = {
        @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms")
    }
)
public class LocalSmsPlugin extends Plugin {
    private static final String TAG = "LocalSmsPlugin";

    @PluginMethod
    public void checkPermission(PluginCall call) {
        Context context = getContext();
        boolean hasPermission = false;
        if (context != null) {
            hasPermission = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.SEND_SMS
            ) == PackageManager.PERMISSION_GRANTED;
        }

        JSObject result = new JSObject();
        result.put("granted", hasPermission);
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Context context = getContext();
        if (context != null && ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }

        requestPermissionForAlias("sms", call, "smsPermsCallback");
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        Context context = getContext();
        boolean granted = false;
        if (context != null) {
            granted = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.SEND_SMS
            ) == PackageManager.PERMISSION_GRANTED;
        }

        JSObject result = new JSObject();
        result.put("granted", granted);
        call.resolve(result);
    }

    @PluginMethod
    public void sendSms(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("Context not available");
            return;
        }

        // Check permission
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }

        String phoneNumber = call.getString("phoneNumber");
        String message = call.getString("message");

        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            call.reject("Phone number is required");
            return;
        }

        if (message == null || message.trim().isEmpty()) {
            call.reject("Message is required");
            return;
        }

        // Clean phone number (keep digits and +)
        String cleanNumber = phoneNumber.replaceAll("[^0-9+]", "");

        try {
            SmsManager smsManager = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                smsManager = context.getSystemService(SmsManager.class);
            }
            if (smsManager == null) {
                smsManager = SmsManager.getDefault();
            }

            Log.d(TAG, "Sending SMS to " + cleanNumber + ", length: " + message.length());

            // Korean SMS character threshold for multipart
            if (message.length() > 70) {
                java.util.ArrayList<String> parts = smsManager.divideMessage(message);
                smsManager.sendMultipartTextMessage(cleanNumber, null, parts, null, null);
            } else {
                smsManager.sendTextMessage(cleanNumber, null, message, null, null);
            }

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to send SMS: " + e.getMessage(), e);
            call.reject("Failed to send SMS: " + e.getMessage());
        }
    }
}
