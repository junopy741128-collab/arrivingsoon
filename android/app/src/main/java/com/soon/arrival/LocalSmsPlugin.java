package com.soon.arrival;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "LocalSms",
    permissions = {
        @Permission(strings = { Manifest.permission.SEND_SMS }, alias = "sms")
    }
)
public class LocalSmsPlugin extends Plugin {

    private static final int SMS_PERMISSION_CODE = 100;

    @PluginMethod
    public void checkPermission(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        boolean hasPermission = ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.SEND_SMS
        ) == PackageManager.PERMISSION_GRANTED;

        JSObject result = new JSObject();
        result.put("granted", hasPermission);
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.SEND_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                activity,
                new String[]{Manifest.permission.SEND_SMS},
                SMS_PERMISSION_CODE
            );
            // Save call for later response
            saveCall(call);
        } else {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void sendSms(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        // Check permission
        if (ContextCompat.checkSelfPermission(activity, Manifest.permission.SEND_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }

        String phoneNumber = call.getString("phoneNumber");
        String message = call.getString("message");

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            call.reject("Phone number is required");
            return;
        }

        if (message == null || message.isEmpty()) {
            call.reject("Message is required");
            return;
        }

        try {
            SmsManager smsManager = SmsManager.getDefault();
            
            // Split message if it's too long
            if (message.length() > 160) {
                java.util.ArrayList<String> parts = smsManager.divideMessage(message);
                smsManager.sendMultipartTextMessage(phoneNumber, null, parts, null, null);
            } else {
                smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            }

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to send SMS: " + e.getMessage());
        }
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, android.content.Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        if (requestCode == SMS_PERMISSION_CODE) {
            PluginCall savedCall = getSavedCall();
            if (savedCall != null) {
                Activity activity = getActivity();
                boolean granted = ContextCompat.checkSelfPermission(
                    activity,
                    Manifest.permission.SEND_SMS
                ) == PackageManager.PERMISSION_GRANTED;

                JSObject result = new JSObject();
                result.put("granted", granted);
                savedCall.resolve(result);
            }
        }
    }
}
