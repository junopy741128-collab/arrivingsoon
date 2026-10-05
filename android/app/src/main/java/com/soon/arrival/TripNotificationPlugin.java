package com.soon.arrival;

import android.content.Intent;
import android.os.Build;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

@CapacitorPlugin(name = "TripNotification")
public class TripNotificationPlugin extends Plugin {

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String packageName = getContext().getPackageName();
            android.os.PowerManager pm = (android.os.PowerManager) getContext().getSystemService(android.content.Context.POWER_SERVICE);
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                Intent intent = new Intent();
                intent.setAction(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(android.net.Uri.parse("package:" + packageName));
                getContext().startActivity(intent);
                call.resolve();
            } else {
                call.resolve();
            }
        } else {
            call.resolve();
        }
    }

    
    @PluginMethod
    public void startNotification(PluginCall call) {
        JSObject tripData = call.getObject("tripData");
        
        if (tripData == null) {
            call.reject("Trip data is required");
            return;
        }
        
        String destination = tripData.getString("destination", "목적지");
        String recipient = tripData.getString("recipient", "");
        String apiKey = tripData.getString("apiKey", "");
        String senderName = tripData.getString("senderName", "게스트");
        Integer timeRemaining = tripData.getInteger("timeRemaining", 0);
        Integer distance = tripData.getInteger("distance", 0);
        Log.d("TripNotificationPlugin", "[DEBUG-PLUGIN] Received distance: " + distance);
        Double destLat = tripData.optDouble("destLat", 0.0);
        Double destLng = tripData.optDouble("destLng", 0.0);
        Double targetDistance = tripData.optDouble("targetDistance", 12.0); // Default 12km if missing
        Double startLat = tripData.optDouble("startLat", 0.0);
        Double startLng = tripData.optDouble("startLng", 0.0);
        String status = tripData.getString("status", "waiting"); // 'waiting' or 'active'

        Intent intent = new Intent(getContext(), TripNotificationService.class);
        intent.putExtra("destination", destination);
        intent.putExtra("recipient", recipient);
        intent.putExtra("apiKey", apiKey);
        intent.putExtra("timeRemaining", timeRemaining);
        intent.putExtra("distance", distance);
        intent.putExtra("destLat", destLat);
        intent.putExtra("destLng", destLng);
        intent.putExtra("targetDistance", targetDistance);
        // Smart Start & Multi-Notification
        intent.putExtra("startLat", tripData.optDouble("startLat", 0.0));
        intent.putExtra("startLng", tripData.optDouble("startLng", 0.0));
        intent.putExtra("startPoint", tripData.getString("startPoint")); // Pass Name
        intent.putExtra("initialStatus", tripData.optString("initialStatus", "waiting")); // ✅ Read correct key
        intent.putExtra("notifications", tripData.getString("notifications")); // ✅ Pass JSON String
        intent.putExtra("waypoints", tripData.getString("waypoints")); // ✅ Pass Multi-Waypoints JSON

        // [템플릿] JS MessageManagement에서 설정한 문자 내용 전달
        String departureMsg = tripData.getString("departureMessage");
        String waypointMsg  = tripData.getString("waypointMessage");
        String arrivalMsg   = tripData.getString("arrivalMessage");
        intent.putExtra("departureMessage", departureMsg != null ? departureMsg : "");
        intent.putExtra("waypointMessage",  waypointMsg  != null ? waypointMsg  : "");
        intent.putExtra("arrivalMessage",   arrivalMsg   != null ? arrivalMsg   : "");
        intent.putExtra("departureTitle",   tripData.getString("departureTitle"));
        intent.putExtra("waypointTitle",    tripData.getString("waypointTitle"));
        intent.putExtra("arrivalTitle",     tripData.getString("arrivalTitle"));
        intent.putExtra("senderName",       senderName);

        // [FIX] enableDeparture 토글 값 전달 (기본값 true)
        // JS에서 NotificationSetup의 토글 값을 반드시 tripData에 포함해야 함
        boolean enableDeparture = tripData.optBoolean("enableDeparture", true);
        intent.putExtra("enableDeparture", enableDeparture);
        android.util.Log.d("TripNotificationPlugin", "[enableDeparture] " + enableDeparture);

        // [2단계] 발송 방식 (smsMode) 전달
        String smsMode = tripData.getString("smsMode", "sms_single");
        intent.putExtra("smsMode", smsMode);
        android.util.Log.d("TripNotificationPlugin", "[smsMode] " + smsMode);

        // Advanced Trigger Params
        intent.putExtra("triggerType", tripData.getString("triggerType"));
        // triggerValue can be int or string. Get safely.
        Object val = tripData.opt("triggerValue");
        if (val != null) intent.putExtra("triggerValue", val.toString());

        intent.putExtra("waypointLat", tripData.optDouble("waypointLat", 0.0));
        intent.putExtra("waypointLng", tripData.optDouble("waypointLng", 0.0));
        intent.putExtra("waypointName", tripData.getString("waypointName"));
        
        android.util.Log.d("TripNotificationPlugin", "Starting w/ Start: " + startLat + "," + startLng + " Status: " + status);
        
        // VISUAL DEBUG
        new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
             android.widget.Toast.makeText(getContext(), "🔔 Plugin: Starting Service...", android.widget.Toast.LENGTH_SHORT).show();
        });

        // [v34] Clear trip_completed flag to allow new reservation
        android.content.SharedPreferences prefs = getContext().getSharedPreferences("trip_config", android.content.Context.MODE_PRIVATE);
        android.content.SharedPreferences.Editor editor = prefs.edit();
        
        // [V_FIX] Clear ALL previous trip state flags to prevent persistent completion bug
        editor.putBoolean("trip_completed", false);
        editor.putBoolean("trip_active", true);
        editor.putBoolean("isArrivalSmsSent", false);
        editor.putBoolean("reservationSmsSent", false);
        editor.remove("sent_messages"); // [V_FIX] Clear history for NEW trip
        editor.remove("completed_at_str");
        editor.remove("arrival_timestamp");
        
        // Clear all waypoint sent flags
        java.util.Map<String, ?> allEntries = prefs.getAll();
        for (java.util.Map.Entry<String, ?> entry : allEntries.entrySet()) {
            if (entry.getKey().startsWith("wp_sent_")) {
                editor.remove(entry.getKey());
            }
        }
        editor.apply();
        android.util.Log.d("TripNotificationPlugin", "[V_FIX] Reset ALL SharedPreferences flags for new trip");

        // [V_FIX] Pass Supabase Credentials for Native Alimtalk
        String supabaseUrl = tripData.getString("supabaseUrl", "");
        String supabaseAnonKey = tripData.getString("supabaseAnonKey", "");
        intent.putExtra("supabaseUrl", supabaseUrl);
        intent.putExtra("supabaseAnonKey", supabaseAnonKey);
        
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to start notification service: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void updateNotification(PluginCall call) {
        // Fix: Use Broadcast to update running service instead of startService()
        // This prevents "Zombie Service" resurrection if updates are sent after stop.
        Intent intent = new Intent("com.soon.arrival.UPDATE_TRIP_DATA");
        // call.getData().optJSONObject returns an org.json.JSONObject
        JSONObject data = call.getData().optJSONObject("tripData");
        
        if (data != null) {
            // Use optDouble as these are likely numbers. Cast to int if needed by Service.
            // Service expects 'cntDist' (int), 'cntTime' (int)
            intent.putExtra("cntDist", (int)data.optDouble("distance", -1)); 
            intent.putExtra("cntTime", (int)data.optDouble("timeRemaining", -1));
        }
        
        getContext().sendBroadcast(intent);
        call.resolve();
    }
    
    @PluginMethod
    public void stopNotification(PluginCall call) {
        android.util.Log.d("TripNotificationPlugin", "Stopping notification service");
        android.util.Log.e("TripCheck", "🛑 [PLUGIN] 취소 요청 수신 - 즉시 강제 종료");

        // [Fix] SharedPreferences 상태 플래그 초기화
        android.content.SharedPreferences prefs = getContext().getSharedPreferences("trip_config", android.content.Context.MODE_PRIVATE);
        prefs.edit()
            .putBoolean("trip_completed", true)  // 재시작 방지
            .putBoolean("trip_active", false)     // 운행 종료
            .apply();
        android.util.Log.e("TripCheck", "🧹 [CLEANUP] trip_active=false, trip_completed=true 설정됨");

        // [Fix 1] 알림 즉시 제거 → 앱 아이콘 배지(1) 사라짐
        try {
            android.app.NotificationManager nm =
                (android.app.NotificationManager) getContext().getSystemService(android.content.Context.NOTIFICATION_SERVICE);
            nm.cancel(1001); // NOTIFICATION_ID = 1001
            android.util.Log.e("TripCheck", "✅ [CANCEL] 알림 즉시 제거 완료 (배지 초기화)");
        } catch (Exception e) {
            android.util.Log.e("TripCheck", "❌ [CANCEL] 알림 제거 실패: " + e.getMessage());
        }

        // [Fix 2] 서비스 직접 중지 (startForegroundService 우회 → 좀비 알림 방지)
        Intent serviceIntent = new Intent(getContext(), TripNotificationService.class);
        try {
            // 먼저 "cancel" 액션으로 서비스에 알림 (위치 업데이트 해제용)
            serviceIntent.putExtra("action", "cancel");
            getContext().stopService(serviceIntent);
            android.util.Log.e("TripCheck", "✅ [CANCEL] stopService() 직접 호출 완료");
            call.resolve();
        } catch (Exception e) {
            android.util.Log.e("TripCheck", "❌ [CANCEL] stopService 실패: " + e.getMessage());
            call.reject("Failed to stop notification service: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void checkTripStatus(PluginCall call) {
        android.util.Log.d("TripNotificationPlugin", "Checking trip status");
        
        try {
            android.content.SharedPreferences prefs = getContext().getSharedPreferences("trip_config", android.content.Context.MODE_PRIVATE);
            boolean isActive = prefs.getBoolean("trip_active", false);
            
            android.util.Log.e("TripCheck", "📊 [STATUS] trip_active = " + isActive);
            
            com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
            ret.put("isActive", isActive);
            call.resolve(ret);
        } catch (Exception e) {
            android.util.Log.e("TripCheck", "❌ [STATUS] 상태 확인 실패: " + e.getMessage());
            call.reject("Failed to check trip status: " + e.getMessage());
        }
    }
    

    @PluginMethod
    public void getLogs(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            java.io.File file = new java.io.File(getContext().getFilesDir(), "trip_box.log");
            if (!file.exists()) {
                ret.put("logs", "[[ NO LOGS YET ]]");
            } else {
                java.io.BufferedReader br = new java.io.BufferedReader(new java.io.FileReader(file));
                StringBuilder sb = new StringBuilder();
                String line;
                // Read last 300 lines to avoid overflow? Or just all. Text is small.
                while ((line = br.readLine()) != null) {
                    sb.append(line).append("\n");
                }
                br.close();
                ret.put("logs", sb.toString());
            }
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error reading logs: " + e.getMessage());
        }
    }

    @PluginMethod
    public void clearLogs(PluginCall call) {
        try {
            java.io.File file = new java.io.File(getContext().getFilesDir(), "trip_box.log");
            if (file.exists()) file.delete();
            call.resolve();
        } catch (Exception e) {
            call.reject("Error clearing logs");
        }
    }

    @PluginMethod
    public void isServiceRunning(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("running", TripNotificationService.isRunning);
        call.resolve(ret);
    }

    // [v19 NEW] Check current service status for UI synchronization
    @PluginMethod
    public void checkCurrentStatus(PluginCall call) {
        JSObject ret = new JSObject();

        // [CRITICAL FIX] SharedPreferences에서 trip_completed 먼저 확인
        // 서비스가 종료된 후 앱이 재시작되면 instance=null이라 'stopped'만 반환했음
        // → NavigationActive에서 'completed' 체크가 안 됨 → 완료 모달 미표시
        android.content.SharedPreferences prefs =
            getContext().getSharedPreferences("trip_config", android.content.Context.MODE_PRIVATE);
        boolean isCompleted = prefs.getBoolean("trip_completed", false);
        boolean isActive    = prefs.getBoolean("trip_active",    false);

        if (isCompleted || (!isActive && TripNotificationService.instance == null)) {
            // 서비스가 완료된 상태
            ret.put("isActive", false);
            ret.put("distanceMeters", 0);
            ret.put("timeMinutes", 0);
            ret.put("status", isCompleted ? "completed" : "stopped");
            
            // [V_FIX] 저장된 완료 시간 및 발송 내역 정보 추가 반환
            ret.put("completedAtStr", prefs.getString("completed_at_str", ""));
            ret.put("arrivalTimestamp", prefs.getLong("arrival_timestamp", 0));
            ret.put("sentMessages", prefs.getString("sent_messages", ""));
            
            android.util.Log.d("TripPlugin", "[checkCurrentStatus] status=" + (isCompleted ? "completed" : "stopped") + ", sent=" + prefs.getString("sent_messages", ""));
            call.resolve(ret);
            return;
        }

        // Check if service instance is alive
        if (TripNotificationService.instance != null) {
            // Get current values from service
            boolean isWaiting = TripNotificationService.instance.isWaitingMode;
            float distMeters = TripNotificationService.instance.remainingDistance;
            int timeMin = TripNotificationService.instance.estimatedTime;
            
            // If service is running but distance is 0 (just initialized), return -1 to indicate "loading"
            if (distMeters == 0) {
                distMeters = -1;
            }

            ret.put("isActive", !isWaiting); // active = not waiting
            ret.put("distanceMeters", distMeters);
            ret.put("timeMinutes", timeMin);
            ret.put("status", isWaiting ? "waiting" : "active");
            
            // [V_FIX] 운행 중에도 현재까지 발송된 내역 동기화
            ret.put("sentMessages", prefs.getString("sent_messages", ""));
            
            android.util.Log.d("TripPlugin", "[v19] checkCurrentStatus: isActive=" + !isWaiting + ", dist=" + distMeters + "m, sent=" + prefs.getString("sent_messages", ""));
        } else {
            // Service not running, not completed
            ret.put("isActive", false);
            ret.put("distanceMeters", 0);
            ret.put("timeMinutes", 0);
            ret.put("status", "stopped");
            
            android.util.Log.d("TripPlugin", "[v19] checkCurrentStatus: Service NOT running");
        }
        
        call.resolve(ret);
    }

    private android.content.BroadcastReceiver receiver;

    @Override
    public void load() {
        super.load();
        
        receiver = new android.content.BroadcastReceiver() {
            @Override
            public void onReceive(android.content.Context context, Intent intent) {
                String action = intent.getAction();
                android.util.Log.d("DEBUG_v18", "📡 [PLUGIN] Broadcast Received: " + action);
                
                if ("com.soon.arrival.TRIP_LOCATION_UPDATE".equals(action)) {
                    // Log.d("TripPlugin", "📍 Location Update Received"); // Too verbose?
                    JSObject ret = new JSObject();
                    ret.put("lat", intent.getDoubleExtra("lat", 0));
                    ret.put("lng", intent.getDoubleExtra("lng", 0));
                    ret.put("distKm", intent.getFloatExtra("distMeters", 0) / 1000.0); // Converted for JS
                    ret.put("distMeters", intent.getFloatExtra("distMeters", 0)); // Pass Raw Meters
                    ret.put("timeMin", intent.getIntExtra("timeMin", 0));
                    ret.put("status", intent.getStringExtra("status"));
                    ret.put("progress", intent.getFloatExtra("progress", 0.0f)); // [v59] Pass Progress
                    
                    // [V_FIX] 도착 시 시간 정보 포함
                    if (intent.hasExtra("completedAtStr")) {
                        ret.put("completedAtStr", intent.getStringExtra("completedAtStr"));
                        ret.put("arrivalTimestamp", intent.getLongExtra("arrivalTimestamp", 0));
                    }
                    
                    android.util.Log.d("DEBUG_v18", "📍 [PLUGIN→JS] Location Data: distMeters=" + intent.getFloatExtra("distMeters", 0) + ", timeMin=" + intent.getIntExtra("timeMin", 0) + ", progress=" + intent.getFloatExtra("progress", 0.0f));
                    notifyListeners("tripLocationUpdate", ret);
                    android.util.Log.d("DEBUG_v18", "✅ [PLUGIN] notifyListeners('tripLocationUpdate') called");
                    
                } else if ("com.soon.arrival.TRIP_STATE_UPDATE".equals(action)) {
                    String status = intent.getStringExtra("status");
                    android.util.Log.e("TripPlugin", "🔔 STATE UPDATE RECEIVED: " + status); // High Vis Log
                    android.util.Log.d("DEBUG_v18", "🔔 [PLUGIN→JS] State Update: status=" + status);
                    
                    JSObject ret = new JSObject();
                    ret.put("status", status); // 'active' 또는 'completed'
                    
                    // [V_FIX] 도착 시 시간 정보 포함
                    if (intent.hasExtra("completedAtStr")) {
                        ret.put("completedAtStr", intent.getStringExtra("completedAtStr"));
                        ret.put("arrivalTimestamp", intent.getLongExtra("arrivalTimestamp", 0));
                    }

                    notifyListeners("tripStateUpdate", ret);
                    android.util.Log.d("DEBUG_v18", "✅ [PLUGIN] notifyListeners('tripStateUpdate') called");
                    
                } else if ("com.soon.arrival.TRIP_NOTIFICATION_SENT".equals(action)) {
                    String message = intent.getStringExtra("message");
                    String recipient = intent.getStringExtra("recipient");
                    int recipientCount = intent.getIntExtra("recipientCount", 1); // [Fix] Receive count
                    
                    android.util.Log.d("DEBUG_v18", "📨 [PLUGIN→JS] SMS Sent: message=" + message + ", count=" + recipientCount);
                    
                    JSObject ret = new JSObject();
                    ret.put("message", message);
                    ret.put("recipient", recipient);
                    ret.put("recipientCount", recipientCount);
                    // [V_FIX] type 및 waypointName 누락 수정 (JS 발송 내역 및 포인트 차감 핵심)
                    ret.put("type", intent.getStringExtra("type"));
                    if (intent.hasExtra("waypointName")) {
                        ret.put("waypointName", intent.getStringExtra("waypointName"));
                    }
                    notifyListeners("tripNotificationSent", ret);
                    android.util.Log.d("DEBUG_v18", "✅ [PLUGIN] notifyListeners('tripNotificationSent') called with type=" + intent.getStringExtra("type"));
                }
            }
        };
        
        android.content.IntentFilter filter = new android.content.IntentFilter();
        filter.addAction("com.soon.arrival.TRIP_LOCATION_UPDATE");
        filter.addAction("com.soon.arrival.TRIP_STATE_UPDATE");
        filter.addAction("com.soon.arrival.TRIP_NOTIFICATION_SENT");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().registerReceiver(receiver, filter, android.content.Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(receiver, filter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (receiver != null) {
            getContext().unregisterReceiver(receiver);
        }
        super.handleOnDestroy();
    }
}
