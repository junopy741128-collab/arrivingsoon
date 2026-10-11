package com.soon.arrival;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.gaa.sdk.iap.PurchaseClient;
import com.gaa.sdk.iap.PurchaseData;
import com.gaa.sdk.iap.IapResult;
import com.gaa.sdk.iap.PurchaseClientStateListener;
import com.gaa.sdk.iap.PurchasesUpdatedListener;
import com.gaa.sdk.iap.PurchaseFlowParams;
import com.gaa.sdk.iap.ConsumeParams;
import com.gaa.sdk.iap.ConsumeListener;
import com.gaa.sdk.iap.PurchasesListener;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "OneStore")
public class OneStorePlugin extends Plugin implements PurchasesUpdatedListener {

    private static final String TAG = "OneStorePlugin";
    private PurchaseClient purchaseClient;
    private static final String PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCi062YvAEqxLcLnbNCfthsDZjyWhzVbA/XAvIpforh+V45d/lOv4gmV7g2bqS746JXH9CqAElDPklHew9TWU/Mx2rR76QqNjZKBA854DHGhpmAhxKhZfOQsusZ6m8zSPMIncHfAN93NFLrUYL3pZdAvW5p7G0sCmUoRVBRC2EQVQIDAQAB";
    
    public static OneStorePlugin instance;
    private PluginCall activePurchaseCall;

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
        Log.d(TAG, "Initializing OneStore Plugin V21");

        if (purchaseClient == null) {
            purchaseClient = PurchaseClient.newBuilder(getContext())
                .setBase64PublicKey(PUBLIC_KEY)
                .setListener(this)
                .build();
        }

        purchaseClient.startConnection(new PurchaseClientStateListener() {
            @Override
            public void onSetupFinished(IapResult iapResult) {
                if (iapResult.isSuccess()) {
                    Log.d(TAG, "Service Connected");
                    call.resolve();
                } else {
                    call.reject("Setup failed: " + iapResult.getMessage());
                }
            }

            @Override
            public void onServiceDisconnected() {
                Log.d(TAG, "Service Disconnected");
            }
        });
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId");
        String developerPayload = call.getString("developerPayload", "");
        String productName = call.getString("productName", "Premium");
        
        if (purchaseClient == null) {
            call.reject("PurchaseClient not initialized. Call init() first.");
            return;
        }

        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not found");
            return;
        }

        activePurchaseCall = call;

        PurchaseFlowParams params = PurchaseFlowParams.newBuilder()
            .setProductId(productId)
            .setProductType(PurchaseClient.ProductType.INAPP)
            .setDeveloperPayload(developerPayload)
            .setProductName(productName)
            .build();
            
        purchaseClient.launchPurchaseFlow(activity, params);
    }

    @Override
    public void onPurchasesUpdated(IapResult iapResult, List<PurchaseData> list) {
        if (activePurchaseCall != null) {
            if (iapResult.isSuccess() && list != null && !list.isEmpty()) {
                PurchaseData data = list.get(0);
                JSObject ret = new JSObject();
                ret.put("orderId", data.getOrderId());
                ret.put("purchaseToken", data.getPurchaseToken());
                ret.put("packageName", data.getPackageName());
                ret.put("productId", data.getProductId());
                ret.put("purchaseTime", data.getPurchaseTime());
                ret.put("securityToken", data.getDeveloperPayload());
                ret.put("signature", data.getSignature());
                ret.put("originalJson", data.getOriginalJson());
                activePurchaseCall.resolve(ret);
            } else {
                activePurchaseCall.reject("Purchase failed: " + iapResult.getMessage());
            }
            activePurchaseCall = null;
        }
    }

    @PluginMethod
    public void consume(PluginCall call) {
        String purchaseToken = call.getString("purchaseToken");
        if (purchaseClient == null) {
            call.reject("PurchaseClient not initialized");
            return;
        }

        purchaseClient.queryPurchasesAsync(PurchaseClient.ProductType.INAPP, new PurchasesListener() {
            @Override
            public void onPurchasesResponse(IapResult iapResult, List<PurchaseData> list) {
                if (iapResult.isSuccess() && list != null) {
                    for (PurchaseData data : list) {
                        if (purchaseToken.equals(data.getPurchaseToken())) {
                            ConsumeParams params = ConsumeParams.newBuilder().setPurchaseData(data).build();
                            purchaseClient.consumeAsync(params, new ConsumeListener() {
                                @Override
                                public void onConsumeResponse(IapResult consumeResult, PurchaseData purchaseData) {
                                    if (consumeResult.isSuccess()) {
                                        JSObject ret = new JSObject();
                                        ret.put("success", true);
                                        call.resolve(ret);
                                    } else {
                                        call.reject("Consume error: " + consumeResult.getMessage());
                                    }
                                }
                            });
                            return;
                        }
                    }
                    call.reject("PurchaseToken not found in user's active purchases.");
                } else {
                    call.reject("Query error: " + iapResult.getMessage());
                }
            }
        });
    }
    
    public boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        return false;
    }
}
