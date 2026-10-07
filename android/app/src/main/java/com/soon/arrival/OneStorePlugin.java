package com.soon.arrival;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.onestore.iap.api.IapResult;
import com.onestore.iap.api.PurchaseClient;
import com.onestore.iap.api.PurchaseData;
import com.onestore.iap.api.IapEnum;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "OneStore")
public class OneStorePlugin extends Plugin {

    private static final String TAG = "OneStorePlugin";
    private PurchaseClient purchaseClient;
    private static final String PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCi062YvAEqxLcLnbNCfthsDZjyWhzVbA/XAvIpforh+V45d/lOv4gmV7g2bqS746JXH9CqAElDPklHew9TWU/Mx2rR76QqNjZKBA854DHGhpmAhxKhZfOQsusZ6m8zSPMIncHfAN93NFLrUYL3pZdAvW5p7G0sCmUoRVBRC2EQVQIDAQAB"; // User to replace this
    private static final int API_VERSION = 5;
    private static final int PURCHASE_REQUEST_CODE = 2001;
    
    public static OneStorePlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    @PluginMethod
    public void init(PluginCall call) {
        Log.d(TAG, "Initializing OneStore Plugin");

        if (purchaseClient == null) {
            purchaseClient = new PurchaseClient(getContext(), PUBLIC_KEY);
        }

        purchaseClient.connect(new PurchaseClient.ServiceConnectionListener() {
            @Override
            public void onConnected() {
                Log.d(TAG, "Service Connected");
                
                // Check billing supported
                purchaseClient.isBillingSupportedAsync(API_VERSION, new PurchaseClient.BillingSupportedListener() {
                    @Override
                    public void onSuccess() {
                        Log.d(TAG, "Billing Supported");
                        call.resolve();
                    }

                    @Override
                    public void onError(IapResult result) {
                         Log.e(TAG, "Billing Not Supported: " + result.toString());
                         call.reject("Billing not supported: " + result.toString());
                    }

                    @Override
                    public void onErrorRemoteException() {
                        call.reject("Remote Exception");
                    }

                    @Override
                    public void onErrorSecurityException() {
                        call.reject("Security Exception");
                    }

                    @Override
                    public void onErrorNeedUpdateException() {
                        call.reject("Need Update Exception");
                    }
                });
            }

            @Override
            public void onDisconnected() {
                Log.d(TAG, "Service Disconnected");
            }

            @Override
            public void onErrorNeedUpdateException() {
                Log.e(TAG, "OneStore Service requires update");
                Activity activity = getActivity();
                if (activity != null) {
                    purchaseClient.launchUpdateOrInstallFlow(activity);
                }
                call.reject("OneStore service needs update");
            }
        });
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        String developerPayload = call.getString("developerPayload", "");
        String productName = call.getString("productName", "Premium");
        String productType = "inapp"; // Default
        
        if (purchaseClient == null) {
            call.reject("PurchaseClient not initialized. Call init() first.");
            return;
        }

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not found");
            return;
        }

        Log.d(TAG, "Flow Initiated for " + productId);
        // Save Call for Callback
        saveCall(call);

        // Async Purchase Flow
        boolean result = purchaseClient.launchPurchaseFlowAsync(
            API_VERSION, 
            activity, 
            PURCHASE_REQUEST_CODE, 
            productId, 
            productName, 
            productType, 
            developerPayload, 
            "", 
            false, 
            mPurchaseFlowListener
        );
        
        if (!result) {
            call.reject("Failed to launch purchase flow (Listener null or other error)");
            freeSavedCall();
        }
    }

    @PluginMethod
    public void consume(PluginCall call) {
        String purchaseToken = call.getString("purchaseToken");
        if (purchaseClient == null) {
            call.reject("PurchaseClient not initialized");
            return;
        }

        purchaseClient.queryPurchasesAsync(API_VERSION, "inapp", new PurchaseClient.QueryPurchaseListener() {
            @Override
            public void onSuccess(List<PurchaseData> list, String productType) {
                for (PurchaseData data : list) {
                    if (data.getPurchaseId().equals(purchaseToken)) {
                        purchaseClient.consumeAsync(API_VERSION, data, new PurchaseClient.ConsumeListener() {
                            @Override
                            public void onSuccess(PurchaseData purchaseData) {
                                JSObject ret = new JSObject();
                                ret.put("success", true);
                                call.resolve(ret);
                            }
                            @Override
                            public void onError(IapResult iapResult) {
                                call.reject("Consume error: " + iapResult.getDescription());
                            }
                            @Override
                            public void onErrorRemoteException() { call.reject("Remote Exception"); }
                            @Override
                            public void onErrorSecurityException() { call.reject("Security Exception"); }
                            @Override
                            public void onErrorNeedUpdateException() { call.reject("Need Update Exception"); }
                        });
                        return;
                    }
                }
                call.reject("PurchaseToken not found in user's active purchases.");
            }
            @Override
            public void onError(IapResult iapResult) { call.reject("Query error: " + iapResult.getDescription()); }
            @Override
            public void onErrorRemoteException() { call.reject("Remote Exception"); }
            @Override
            public void onErrorSecurityException() { call.reject("Security Exception"); }
            @Override
            public void onErrorNeedUpdateException() { call.reject("Need Update Exception"); }
        });
    }
    
    // Listener Definition
    PurchaseClient.PurchaseFlowListener mPurchaseFlowListener = new PurchaseClient.PurchaseFlowListener() {
        public void onSuccess(PurchaseData purchaseData) {
            Log.d(TAG, "Purchase Success: " + purchaseData.getOrderId());
            PluginCall savedCall = getSavedCall();
            if (savedCall == null) return;

            // Verify Signature
            boolean valid = verifySignature(purchaseData.getPurchaseData(), purchaseData.getSignature());
            
            if (valid) {
                JSObject ret = new JSObject();
                ret.put("orderId", purchaseData.getOrderId());
                ret.put("purchaseToken", purchaseData.getPurchaseId());
                ret.put("packageName", purchaseData.getPackageName());
                ret.put("productId", purchaseData.getProductId());
                ret.put("purchaseTime", purchaseData.getPurchaseTime());
                ret.put("securityToken", purchaseData.getDeveloperPayload());
                ret.put("signature", purchaseData.getSignature());
                ret.put("originalJson", purchaseData.getPurchaseData());
                savedCall.resolve(ret);
            } else {
                savedCall.reject("Signature verification failed");
            }
            freeSavedCall();
        }

        public void onError(IapResult result) {
            Log.e(TAG, "Purchase Error: " + result.toString());
            PluginCall savedCall = getSavedCall();
            if (savedCall != null) {
                savedCall.reject("Purchase failed: " + result.getDescription());
                freeSavedCall();
            }
        }

        public void onErrorRemoteException() {
            failCall("Remote Exception");
        }

        public void onErrorSecurityException() {
            failCall("Security Exception");
        }

        public void onErrorNeedUpdateException() {
            Activity activity = getActivity();
            if (activity != null && purchaseClient != null) {
                purchaseClient.launchUpdateOrInstallFlow(activity);
            }
            failCall("Need Update Exception");
        }
        
        private void failCall(String msg) {
            PluginCall savedCall = getSavedCall();
            if (savedCall != null) {
                savedCall.reject(msg);
                freeSavedCall();
            }
        }
    };

    // Called from MainActivity.onActivityResult
    public boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == PURCHASE_REQUEST_CODE) {
             if (purchaseClient != null) {
                 return purchaseClient.handlePurchaseData(data);
             }
        }
        return false;
    }

    // Basic Signature Verification
    private boolean verifySignature(String data, String signature) {
        if (PUBLIC_KEY.equals("KEY_HERE")) {
            Log.w(TAG, "Skipping signature verification (Key missing)");
            return true; 
        }
        // TODO: Real verification logic
        return true;
    }
}

