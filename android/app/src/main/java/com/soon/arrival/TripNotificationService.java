package com.soon.arrival;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.Date;
import android.location.Location;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.telephony.SmsManager;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Queue;
import java.util.LinkedList;
import java.util.ArrayList;

public class TripNotificationService extends Service {
    private static final String TAG = "TripNotificationService";
    public static boolean isRunning = false;
    public static TripNotificationService instance = null;
    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "trip_status_channel";
    private static final String CHANNEL_NAME = "운행 현황";

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private Handler handler;

    // Trip data
    private String destination = "목적지";
    private String recipient = "";
    private String apiKey = "";
    private String senderName = "게스트";
    private double destLat, destLng, finalDestLat, finalDestLng;
    private float targetDistanceMeters = 0f; // [v_fix] targetDistance -> targetDistanceMeters
    public int estimatedTime = 0;
    public float remainingDistance = 0f;
    private boolean smsSent = false;
    private boolean reservationSmsSent = false;
    private boolean isArrivalSmsSent = false;
    private Location lastLocation;

    // [V_FIX] Supabase Credentials for Native Alimtalk
    private String supabaseUrl = "";
    private String supabaseAnonKey = "";

    // Smart Start Data
    private double startLat, startLng;
    public boolean isWaitingMode = true; // [v_fix] initialStatus로 대체될 예정
    private boolean departureSmsSent = false;
    private String startPointName = "출발지"; // [v_fix] startPoint -> startPointName
    private String currentTripId;
    private String initialStatus = "waiting"; // [v_fix]

    // API Optimization
    private long lastApiCallTime = 0;
    private long lastWaypointLogTime = 0;
    private boolean isApiCalling = false;
    private int apiCallCount = 0;
    private long serviceStartTime = 0;
    private PowerManager.WakeLock wakeLock;

    // Tunnel Simulation
    private Timer tunnelSimulationTimer;
    private long lastGpsUpdateTime = 0;
    private float currentSpeed = 0;
    private double lastRemainingDistance = 0;
    private boolean isSimulating = false;
    private Queue<Float> speedHistory = new LinkedList<>();

    // [Phase 13] Settings
    private boolean enableDeparture = true; // Default true
    private String smsMode = "sms_single"; // [2단계]

    private String departureMessageTemplate = "{출발지}에서 출발했습니다. 약 {남은시간}분 후 도착합니다.";
    private String waypointMessageTemplate  = "{경유지}를 지나고 있습니다. 약 {남은시간}분 후 도착합니다.";
    private String arrivalMessageTemplate   = "{도착지} 근처입니다. 곧 도착예정입니다.";

    // [강조형] 강조 제목 템플릿 (카카오 전용)
    private String departureTitleTemplate = "[{출발지}] 출발.";
    private String waypointTitleTemplate  = "[{남은시간}]분 후 도착";
    private String arrivalTitleTemplate   = "[{도착지}] 근처입니다.";

    // Ratio Logic
    private float initialTotalDist = 0;
    private int initialTotalTime = 0;
    private boolean checkpoint50Visited = false;
    private double currentLat, currentLng, prevLat, prevLng;
    private float accumulatedDistanceSinceApi = 0;
    private float lastApiRemainingDistanceMeters = 0;
    private boolean needsInitialDistRecalibration = false;

    // Advanced Trigger & Waypoints
    private String triggerType = "time";
    private String triggerValue = "10";
    private ArrayList<WaypointItem> waypoints = new ArrayList<>();
    private ArrayList<NotificationItem> notificationList = new ArrayList<>();
    // [FIX] SmartStart 직후 동일 GPS 사이클에서 waypoint 즉시 발송 방지
    private boolean justActivated = false;

    // Inner Classes
    private static class WaypointItem {
        double lat, lng;
        String name;
        boolean sent = false;
        WaypointItem(double lat, double lng, String name) {
            this.lat = lat; this.lng = lng; this.name = name;
        }
    }

    private static class NotificationItem {
        String id, type, conditionType, message;
        double conditionValue;
        boolean sent;
        NotificationItem(JSONObject json) {
            try {
                this.id = json.optString("id");
                this.type = json.optString("type", "arrival");
                this.message = json.optString("message", "");
                this.sent = "sent".equals(json.optString("status"));
                JSONObject condition = json.optJSONObject("condition");
                if (condition != null) {
                    this.conditionType = condition.optString("type", "distance");
                    this.conditionValue = condition.optDouble("value", 0);
                }
            } catch (Exception e) { e.printStackTrace(); }
        }
    }

    private BroadcastReceiver updateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("com.soon.arrival.UPDATE_TRIP_DATA".equals(intent.getAction())) {
                int dist = intent.getIntExtra("cntDist", -1);
                int time = intent.getIntExtra("cntTime", -1);
                if (dist >= 0) remainingDistance = dist;
                if (time >= 0) estimatedTime = time;
            }
        }
    };

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        this.apiKey = BuildConfig.KAKAO_API_KEY;
        instance = this;
        serviceStartTime = System.currentTimeMillis();
        createNotificationChannel();
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        handler = new Handler(Looper.getMainLooper());

        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SoonArrival:WakeLock");

        IntentFilter filter = new IntentFilter("com.soon.arrival.UPDATE_TRIP_DATA");
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(updateReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(updateReceiver, filter);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        isRunning = true;
        
        if (wakeLock != null && !wakeLock.isHeld()) {
            wakeLock.acquire(12 * 60 * 60 * 1000L); // Max 12 hours
            logToBlackbox("WakeLock acquired for background stability.");
        }
        
        // [Fix] Check for null intent first
        if (intent == null) {
             stopSelf();
             return START_NOT_STICKY;
        }

        // [CRITICAL FIX] "stop" action FIRST.
        // If started via startForegroundService, we MUST call startForeground() within 5s.
        // Even if we want to stop immediately, we must satisfy the promise.
        if ("stop".equals(intent.getStringExtra("action"))) {
            Log.d(TAG, "Received STOP action. Gracefully shutting down.");

            // 1. Satisfy Foreground Promise (Prevent Crash)
            Notification notification = createNotification("서비스 종료 중", "잠시만 기다려주세요...");
            startForeground(NOTIFICATION_ID, notification);

            // 2. 위치 업데이트 해제
            if (fusedLocationClient != null && locationCallback != null) {
                fusedLocationClient.removeLocationUpdates(locationCallback);
            }

            // 3. 알림 즉시 제거 후 서비스 중지
            stopForeground(true); // true = 알림 제거
            stopSelf();
            return START_NOT_STICKY;
        }

        SharedPreferences prefs = getSharedPreferences("trip_config", MODE_PRIVATE);
        
        // [Fix] 서비스 재시작 시 활성 상태 체크
        boolean isActive = prefs.getBoolean("trip_active", false);
        if (!isActive) {
            Log.d(TAG, "onStartCommand: Trip is NOT active (Zombie Service). Stopping.");
            
            // [Safety] If this was a forced restart by OS attempting to restore foreground service,
            // we might still crash if we don't startForeground.
            // But usually explicit starts have intent. Null intent case handled above.
            stopSelf();
            return START_NOT_STICKY;
        }

        // [New] 서비스 재시작 시 완료 여부 체크
        if (prefs.getBoolean("trip_completed", false)) {
            Log.d(TAG, "onStartCommand: Trip already completed. Stopping service.");
            stopSelf();
            return START_NOT_STICKY;
        }

        if (!intent.hasExtra("recipient")) {
            intent = loadTripConfig();
            if (intent == null) { stopSelf(); return START_NOT_STICKY; }
        } else {
            saveTripConfig(intent);
        }

        destination = intent.getStringExtra("destination");
        recipient = intent.getStringExtra("recipient");
        apiKey = intent.getStringExtra("apiKey");
        senderName = intent.getStringExtra("senderName");
        if (senderName == null || senderName.trim().isEmpty()) senderName = "게스트";

        remainingDistance = (float) intent.getIntExtra("distance", 0);
        initialTotalDist = remainingDistance; // [v59] set initial
        destLat = intent.getDoubleExtra("destLat", 0.0);
        destLng = intent.getDoubleExtra("destLng", 0.0);
        finalDestLat = destLat;
        finalDestLng = destLng;
        targetDistanceMeters = (float) (intent.getDoubleExtra("targetDistance", 0.0) * 1000.0);
        
        startLat = intent.getDoubleExtra("startLat", 0.0);
        startLng = intent.getDoubleExtra("startLng", 0.0);
        startPointName = intent.getStringExtra("startPoint");
        if (startPointName == null) startPointName = "출발지";

        initialStatus = intent.getStringExtra("initialStatus");
        departureMessageTemplate = intent.getStringExtra("departureMessage");
        waypointMessageTemplate  = intent.getStringExtra("waypointMessage");
        arrivalMessageTemplate   = intent.getStringExtra("arrivalMessage");
        estimatedTime = intent.getIntExtra("timeRemaining", 0);
        initialTotalDist = (float) intent.getIntExtra("distance", 0);
        currentTripId = intent.getStringExtra("tripId");
        isWaitingMode = "waiting".equals(intent.getStringExtra("initialStatus"));
        // [Fix3-1] startPoint를 intent에서 읽기 (없으면 "출발지" 유지)
        String sp = intent.getStringExtra("startPoint");
        if (sp != null && !sp.isEmpty()) startPointName = sp;
        
        // [FIX] enableDeparture: Intent\uc5d0\uc11c \uba3c\uc800 \uc77d\uae30 (Plugin\uc774 \uc804\ub2ec), \uc5c6\uc73c\uba74 SharedPrefs \ud3f4\ubc31
        SharedPreferences prefs2 = getSharedPreferences("trip_config", MODE_PRIVATE);
        // Intent\uc5d0 enableDeparture\uac00 \uc788\uc73c\uba74 \ud574\ub2f9 \uac12 \uc0ac\uc6a9, \uc5c6\uc73c\uba74 SharedPrefs (default true)
        if (intent.hasExtra("enableDeparture")) {
            this.enableDeparture = intent.getBooleanExtra("enableDeparture", true);
        } else {
            this.enableDeparture = prefs2.getBoolean("enableDeparture", true);
        }
        this.smsMode = intent.getStringExtra("smsMode");
        if (this.smsMode == null) this.smsMode = prefs2.getString("smsMode", "sms_single");
        
        // [V_FIX] Initialize Supabase Credentials
        this.supabaseUrl = intent.getStringExtra("supabaseUrl");
        this.supabaseAnonKey = intent.getStringExtra("supabaseAnonKey");

        // [V_FIX] Reset internal flags on new start to ensure fresh trip
        this.isArrivalSmsSent = false;
        this.reservationSmsSent = false;
        this.departureSmsSent = false;
        this.smsSent = false;
        this.checkpoint50Visited = false;
        this.justActivated = false;
        this.isSimulating = false;
        this.apiCallCount = 0;
        this.lastApiCallTime = 0;
        
        // [Fix] Reset interpolation baseline & timer for new trip
        this.prevLat = 0;
        this.prevLng = 0;
        this.serviceStartTime = System.currentTimeMillis();

        Log.d(TAG, "onStartCommand: enableDeparture=" + enableDeparture + ", smsMode=" + smsMode);

        // [템플릿] JS에서 전달받은 문자 내용 읽기 (없으면 기본값 유지)
        String dMsg = intent.getStringExtra("departureMessage");
        String wMsg = intent.getStringExtra("waypointMessage");
        String aMsg = intent.getStringExtra("arrivalMessage");
        if (dMsg != null && !dMsg.isEmpty()) this.departureMessageTemplate = dMsg;
        if (wMsg != null && !wMsg.isEmpty()) this.waypointMessageTemplate  = wMsg;
        if (aMsg != null && !aMsg.isEmpty()) this.arrivalMessageTemplate   = aMsg;

        // [강조제목]JS에서 전달받은 강조 제목 읽기
        String dTitle = intent.getStringExtra("departureTitle");
        String wTitle = intent.getStringExtra("waypointTitle");
        String aTitle = intent.getStringExtra("arrivalTitle");
        if (dTitle != null && !dTitle.isEmpty()) this.departureTitleTemplate = dTitle;
        if (wTitle != null && !wTitle.isEmpty()) this.waypointTitleTemplate = wTitle;
        if (aTitle != null && !aTitle.isEmpty()) this.arrivalTitleTemplate = aTitle;
        Log.d(TAG, "[템플릿] 출발=" + departureMessageTemplate);
        Log.d(TAG, "[템플릿] 경유=" + waypointMessageTemplate);
        Log.d(TAG, "[템플릿] 도착=" + arrivalMessageTemplate);

        parseNotifications(intent.getStringExtra("notifications"));
        parseWaypoints(intent.getStringExtra("waypoints"));

        Notification notification = createNotification(destination, "위치 확인 중...");
        startForeground(NOTIFICATION_ID, notification);
        startLocationUpdates();
        
        logToBlackbox("Service Started. Dest: " + destination + ", Mode: " + (isWaitingMode ? "Waiting" : "Active"));

        return START_REDELIVER_INTENT;
    }

    private void startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) return;
        // [Fix1] 중복 등록 방지: 이미 콜백이 등록되어 있으면 스킵
        if (locationCallback != null) {
            Log.w(TAG, "[Fix1] LocationCallback already registered. Skipping duplicate startLocationUpdates.");
            return;
        }
        LocationRequest locationRequest = LocationRequest.create()
                .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY)
                .setInterval(5000).setFastestInterval(2000);

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) return;
                for (Location location : locationResult.getLocations()) {
                    handleLocationUpdate(location);
                }
            }
        };
        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
        startTunnelSimulation();
    }

    private void handleLocationUpdate(Location location) {
        this.lastLocation = location;
        try {
            if (location == null || location.getLatitude() == 0.0) return;

            currentLat = location.getLatitude();
            currentLng = location.getLongitude();

            // [CRITICAL FIX] startLat/startLng가 0,0으로 전달된 경우 첫 번째 GPS 수신 위치로 자동 초기화
            // App.tsx가 trip.startLat=0으로 서비스 시작 → 미보정 시 SmartStart이 영원히 차단됨
            if (startLat == 0.0 || startLng == 0.0) {
                startLat = currentLat;
                startLng = currentLng;
                logToBlackbox("[AutoFix] startLat/Lng 자동 초기화: " + startLat + "," + startLng);
                // SharedPreferences에도 저장으로 서비스 재시작 시에도 보존
                getSharedPreferences("trip_config", MODE_PRIVATE).edit()
                    .putFloat("startLat", (float)startLat)
                    .putFloat("startLng", (float)startLng)
                    .apply();
            }

            // API 및 거리 계산 로직
            float[] destResults = new float[1];
            Location.distanceBetween(currentLat, currentLng, destLat, destLng, destResults);
            float straightDistance = destResults[0];

            // [New] API Optimization: Adaptive Interval
            long interval = 60000; // Default 1 min
            float distKm = remainingDistance / 1000f;
            
            if (distKm > 20) interval = 300000;      // 5 min (Highway)
            else if (distKm > 10) interval = 180000; // 3 min (Suburban)
            else if (distKm > 5) interval = 120000;  // 2 min (City approach)
            else interval = 60000;                   // 1 min (Precision)

            long timeSinceLastCall = System.currentTimeMillis() - lastApiCallTime;
            
            // Force update on significant deviation (speed change logic could go here)
            
            if (timeSinceLastCall > interval || lastApiCallTime == 0) {
                updateEstimatedTimeFromApi(currentLat, currentLng, destLat, destLng);
            } else {
                // [New] Local Interpolation (Dead Reckoning)
                // If we skip API call, update remaining distance locally based on moved distance
                if (prevLat != 0 && prevLng != 0) {
                    float[] moved = new float[1];
                    Location.distanceBetween(prevLat, prevLng, currentLat, currentLng, moved);
                    this.remainingDistance -= moved[0]; 
                    if (this.remainingDistance < 0) this.remainingDistance = 0;
                    
                    // [V_FIX] Local Countdown for Estimated Time
                    // API가 호출되지 않더라도 시간이 지남에 따라 1분씩 줄여나감
                    long now = System.currentTimeMillis();
                    if (lastGpsUpdateTime > 0 && estimatedTime > 0) {
                        long elapsedMinutes = (now - lastGpsUpdateTime) / (60 * 1000);
                        if (elapsedMinutes >= 1) {
                            estimatedTime -= (int)elapsedMinutes;
                            if (estimatedTime < 1) estimatedTime = 1; // 최소 1분 유지
                            lastGpsUpdateTime = now; // 타이머 갱신
                        }
                    } else if (lastGpsUpdateTime == 0) {
                        lastGpsUpdateTime = now;
                    }
                }
            }

            // 거리 업데이트 (보간법)
            if (lastApiRemainingDistanceMeters <= 0) {
                this.remainingDistance = straightDistance;
            }

            // Smart Start 체크
            // [FIX] startLat/startLng는 위의 AutoFix로 보정됨. 이제 안전하게 체크 가능
            if (isWaitingMode && (System.currentTimeMillis() - serviceStartTime > 30000)) {
                float[] startRes = new float[1];
                Location.distanceBetween(startLat, startLng, currentLat, currentLng, startRes);
                float speedKmh = location.getSpeed() * 3.6f;
                logToBlackbox("SmartStart Check: dist=" + (int)startRes[0] + "m, speed=" + speedKmh + "km/h");
                // [FIX] 속도 임계값 5 → 10 km/h (노이즈 차단, 너무 높으면 실주행 감지 안 됨)
                if (startRes[0] > 300 && speedKmh > 10.0f) {
                    isWaitingMode = false;
                    justActivated = true; // [FIX] 이번 사이클 checkAndSendNotifications 스킵
                    
                    // [V37 FIX] 진행률 오차 수정: 실주행 시작 시점에 총 거리를 보정하여 0%부터 시작하게 함
                    // [V38 Refine] 바로 직전 API 거리로 갱신하지 않고, 첫 Active API 호출에서 정확히 동기화
                    this.needsInitialDistRecalibration = true;
                    logToBlackbox("SmartStart: Flagged for initialTotalDist recalibration on next API call.");
                    
                    // [V37] 출발지 주소 재보정 (초기 오차 해결)
                    refreshStartAddress(currentLat, currentLng);

                    logToBlackbox("SmartStart: Moved " + (int)startRes[0] + "m, speed=" + speedKmh + "km/h. enableDeparture=" + enableDeparture);
                    if (enableDeparture && !departureSmsSent) {
                        departureSmsSent = true;
                        sendDepartureSms();
                    } else {
                        logToBlackbox("Departure SMS skipped: enableDeparture=" + enableDeparture + ", alreadySent=" + departureSmsSent);
                    }
                    sendStateUpdateToUI("active");
                }
            }

            // 알림 및 종료 체크
            // [V37 Fix] 도착지에 다 왔다면(300m 이내) 대기 모드라도 즉시 체크 시작 (단거리/테스트 대응)
            float[] straightToDestCheck = new float[1];
            Location.distanceBetween(currentLat, currentLng, finalDestLat, finalDestLng, straightToDestCheck);
            boolean isVeryNearToDest = straightToDestCheck[0] < 300;

            if (!isWaitingMode || isVeryNearToDest) {
                if (justActivated) {
                    // [FIX] SmartStart 직후 사이클은 스킵 - stale estimatedTime으로 경유지 SMS 발송 방지
                    justActivated = false;
                    logToBlackbox("[FIX] SmartStart 직후 첫 사이클 - checkAndSendNotifications 스킵");
                } else {
                    checkAndSendNotifications(remainingDistance / 1000f, estimatedTime);
                }
            }

            // [New] 진행률 계산
            float progress = 0f;
            if (isWaitingMode) {
                progress = 0f;
            } else if (initialTotalDist > 0) {
                progress = Math.max(0f, Math.min(1f, 1f - (remainingDistance / initialTotalDist)));
            }

            updateNotification(destination, estimatedTime + "분 • " + String.format("%.1f", remainingDistance/1000f) + "km");
            sendLocationUpdateToUI(currentLat, currentLng, remainingDistance, estimatedTime, isWaitingMode ? "waiting" : "active", progress);

            prevLat = currentLat;
            prevLng = currentLng;
        } catch (Exception e) { Log.e(TAG, "Error in handleLocationUpdate", e); }
    }

    private void checkAndSendNotifications(float distKm, int timeMin) {
        // 이미 도착 처리된 경우 스킵
        if (isArrivalSmsSent) return;

        // 경유지 체크
        for (WaypointItem wp : waypoints) {
            if (!wp.sent) {
                float[] res = new float[1];
                Location.distanceBetween(currentLat, currentLng, wp.lat, wp.lng, res);
                if (res[0] < 350) { // 범위를 300m -> 350m로 약간 확대 (신호 튐 대비)
                    logToBlackbox("WP Hit: " + wp.name + " (" + (int)res[0] + "m) time=" + timeMin + "min");
                    
                    // [FIX] 경유지 통과 시 남은 시간 = API가 계산한 실제 값 사용
                    // 이전의 Math.max 보정 로직 제거: 직선거리(km)=분 계산이 실제 API보다 크면
                    // 잘못된 시간이 발송됨 (예: 설악IC→목적지 37km → 37분 오발송)
                    int displayTime = timeMin;
                    float[] toDest = new float[1];
                    Location.distanceBetween(currentLat, currentLng, finalDestLat, finalDestLng, toDest);
                    float distToDestKm = toDest[0] / 1000f;

                    if (displayTime <= 0) {
                        // API 값이 0 이하면, 직선거리 기반으로 fallback (단위: 분)
                        displayTime = Math.max(1, Math.round(distToDestKm)); // 최소 1분
                    }
                    // [Fix] Safety Guard 제거: 직선거리가 짧아도 실제 우회로/산길로 인해 주행시간이 길 수 있으므로 API 값(timeMin)을 그대로 신뢰함.
                    
                    logToBlackbox("WP Time: apiTimeMin=" + timeMin + " -> displayTime=" + displayTime);

                    String wMsg = applyVariableReplacement(waypointMessageTemplate, displayTime, wp.name);
                    String wTitle = applyVariableReplacement(waypointTitleTemplate, displayTime, wp.name);
                    sendSmsNotification(wMsg, wTitle, "waypoint", wp.name);
                    wp.sent = true;
                    reservationSmsSent = true;
                    saveState();
                }
            }
        }

        // 도착 체크 - API 경로 거리 OR GPS 직선 거리
        float[] straightToDestResult = new float[1];
        Location.distanceBetween(currentLat, currentLng, finalDestLat, finalDestLng, straightToDestResult);
        float straightToDestM = straightToDestResult[0];
        boolean isNearByApi      = distKm < 0.5f;
        boolean isNearByStraight = straightToDestM < 200f;
        logToBlackbox("Arrival Check: apiDist=" + distKm + "km, straightDist=" + (int)straightToDestM + "m");

        if ((isNearByApi || isNearByStraight) && !isArrivalSmsSent) {
            logToBlackbox("🏁 Arrival Triggered! (apiDist=" + distKm + "km, straight=" + (int)straightToDestM + "m)");
            isArrivalSmsSent = true;
            
            // [Fix 도착시각] 도착 트리거 발생 시점을 즉시 캡처
            long arrivalTriggeredAt = System.currentTimeMillis();
            logToBlackbox("🏁 Arrival Timestamp: " + arrivalTriggeredAt);

            // [CRITICAL] SharedPreferences에 완료 상태 즉시 기록
            SharedPreferences.Editor ed = getSharedPreferences("trip_config", MODE_PRIVATE).edit();
            ed.putBoolean("trip_completed", true);
            ed.putBoolean("trip_active", false);
            ed.putLong("arrival_triggered_at", arrivalTriggeredAt);
            ed.apply();

            // [V_FIX] 도착 시 문자 발송 조건 완화: 
            // 경유지가 선택되지 않았거나, 경유지 문자가 아직 발송되지 않았거나, 
            // 사용자의 비즈니스 룰에 따라 '도착 시각'이 확실히 필요한 경우 전송.
            // (사용자 요청에 따라: 경유지가 없는 건은 무조건 발송)
            boolean hasWaypoints = false;
            try {
                String wpStr = getSharedPreferences("trip_config", MODE_PRIVATE).getString("waypoints", "[]");
                org.json.JSONArray wpArr = new org.json.JSONArray(wpStr);
                if (wpArr.length() > 0) hasWaypoints = true;
            } catch (Exception e) {}

            // 경유지가 없으면 무조건 발송, 경유지가 있으면 기존 룰(한 번만 발송) 유지
            if (!hasWaypoints || !reservationSmsSent) {
                String aMsg = applyVariableReplacement(arrivalMessageTemplate, timeMin, null);
                String aTitle = applyVariableReplacement(arrivalTitleTemplate, timeMin, null);
                sendSmsNotification(aMsg, aTitle, "arrival", null, arrivalTriggeredAt);
                logToBlackbox("Arrival SMS sent.");
                reservationSmsSent = true;
            } else {
                logToBlackbox("Arrival SMS skipped (Business rule: waypoint already sent).");
            }
            saveState();
            
            // UI에 즉시 동기화 신호 전송 (중복 전송으로 확실히 전달)
            sendStateUpdateToUI("completed");
            sendLocationUpdateToUI(currentLat, currentLng, 0, 0, "completed", 1.0f);
            
            // [Fix 도착시각] 도착 트리거 발생 시점을 markTripCompleted로 전달
            markTripCompleted(arrivalTriggeredAt);
        }
    }


    private void updateEstimatedTimeFromApi(double curLat, double curLng, double dLat, double dLng) {
        if (isApiCalling) return;
        isApiCalling = true;
        new Thread(() -> {
            try {
                String urlString = "https://apis-navi.kakaomobility.com/v1/directions?origin=" + curLng + "," + curLat + "&destination=" + dLng + "," + dLat + "&priority=RECOMMEND&summary=true";
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestProperty("Authorization", "KakaoAK " + apiKey);
                if (conn.getResponseCode() == 200) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    JSONObject json = new JSONObject(in.readLine());
                    JSONObject summary = json.getJSONArray("routes").getJSONObject(0).getJSONObject("summary");
                    estimatedTime = summary.getInt("duration") / 60;
                    remainingDistance = (float) summary.getInt("distance");
                    lastApiRemainingDistanceMeters = remainingDistance;
                    lastApiCallTime = System.currentTimeMillis();
                    apiCallCount++; // API 호출 횟수 증가
                    
                    // [V38] Active 모드 진입 직후 첫 API 호출에서 전체 거리(100%) 기준점 완벽 동기화
                    if (needsInitialDistRecalibration) {
                        initialTotalDist = remainingDistance;
                        needsInitialDistRecalibration = false;
                        logToBlackbox("[V38] initialTotalDist 완벽 재보정: " + initialTotalDist + "m (0% 시작 동기화)");
                    }

                    logToBlackbox("API Update: " + estimatedTime + "min, " + remainingDistance + "m (Total Calls: " + apiCallCount + ")");
                }
                conn.disconnect();
            } catch (Exception e) { 
                e.printStackTrace();
                logToBlackbox("API Fail: " + e.getMessage());
            }
            finally { isApiCalling = false; }
        }).start();
    }

    private void sendSmsNotification(String msg, String type) {
        sendSmsNotification(msg, "", type, null, 0);
    }

    private void sendSmsNotification(String msg, String title, String type, String waypointName) {
        sendSmsNotification(msg, title, type, waypointName, 0);
    }

    private void sendSmsNotification(String msg, String title, String type, String waypointName, long arrivedAt) {
        // [Fix] recipient null/empty 방어
        if (recipient == null || recipient.trim().isEmpty()) {
            logToBlackbox("[ERROR] sendSmsNotification 호출됐지만 recipient가 null/empty! type=" + type);
            return;
        }
        try {
            String[] rawRecipients = recipient.split(",");
            java.util.Set<String> uniqueRecipients = new java.util.HashSet<>();
            for (String r : rawRecipients) {
                String cleanNumber = r.trim().replaceAll("[^0-9]", "");
                if (cleanNumber.length() >= 10) uniqueRecipients.add(cleanNumber);
            }

            logToBlackbox("[sendSmsNotification] type=" + type + ", smsMode=" + smsMode + ", recipients=" + uniqueRecipients.size() + ", recipient_raw=" + recipient);

            if (!"kakao".equals(smsMode)) {
                SmsManager smsManager = SmsManager.getDefault();
                for (String num : uniqueRecipients) {
                    ArrayList<String> parts = smsManager.divideMessage(msg);
                    if (parts.size() > 1) {
                        smsManager.sendMultipartTextMessage(num, null, parts, null, null);
                    } else {
                        smsManager.sendTextMessage(num, null, msg, null, null);
                    }
                }
                logToBlackbox("SMS Sent: " + msg + " to " + uniqueRecipients.size() + " recipients");
            } else {
            logToBlackbox("Kakao mode: sending via Oltalk. type=" + type + ", title=" + title + ", wp=" + waypointName);
            sendKakaoAlimtalkNative(msg, title, type, waypointName);  // [올톡] waypointName을 VAR2로 전달
        }

        // Broadcast for JS side (point deduction)
        // [Fix ERR_280] var1~var4, title, senderName 추가 → JS에서 title 올바르게 구성 가능
        // [Fix 중복발송] kakao 모드는 네이티브에서 이미 발송했으므로 kakaoSentNative=true 전달
        String var1 = senderName != null ? senderName : "게스트";
        String var2 = "";
        String var3 = "";
        String var4 = "";
        String tag = ""; // [V_FIX] Track tag for persistence
        if ("departure".equals(type) || "waiting".equals(type)) {
            var2 = startPointName != null ? startPointName : "출발지";
            var3 = destination   != null ? destination   : "목적지";
            var4 = String.valueOf(estimatedTime);
            tag = "출발문자";
        } else if ("waypoint".equals(type)) {
            var2 = (waypointName != null && !waypointName.isEmpty()) ? waypointName : (startPointName != null ? startPointName : "경유지");
            var3 = String.valueOf(estimatedTime);
            tag = var2;
        } else if ("arrival".equals(type)) {
            var2 = destination != null ? destination : "목적지";
            var3 = String.valueOf(estimatedTime);
            tag = "도착문자";
        }

        // [V_FIX] Persist sent tag to SharedPreferences (Delimited exact match)
        if (!tag.isEmpty()) {
            SharedPreferences sp = getSharedPreferences("trip_config", MODE_PRIVATE);
            String currentSent = sp.getString("sent_messages", "");
            
            boolean exists = false;
            if (!currentSent.isEmpty()) {
                String[] parts = currentSent.split(",");
                for (String p : parts) {
                    if (tag.equals(p)) { exists = true; break; }
                }
            }

            if (!exists) {
                String updatedSent = currentSent.isEmpty() ? tag : currentSent + "," + tag;
                // [CRITICAL] Use commit() for immediate disk write to prevent loss on crash/exit
                sp.edit().putString("sent_messages", updatedSent).commit();
                logToBlackbox("Persisted tag: " + tag + " (All: " + updatedSent + ")");
            }
        }

        Intent intent = new Intent("com.soon.arrival.TRIP_NOTIFICATION_SENT");
        intent.putExtra("message", msg);
        intent.putExtra("recipient", recipient);
        intent.putExtra("recipientCount", uniqueRecipients.size());
        intent.putExtra("type", type);
        intent.putExtra("title", title != null ? title : "");
        intent.putExtra("senderName", var1);
        intent.putExtra("var1", var1);
        intent.putExtra("var2", var2);
        intent.putExtra("var3", var3);
        intent.putExtra("var4", var4);
        // [Fix 중복발송] 카카오 모드에서 네이티브가 직접 발송했음을 JS에 알림
        intent.putExtra("kakaoSentNative", "kakao".equals(smsMode));
        // [Fix 도착시각] 도착 트리거 발생 시점 타임스탬프 전달 (arrivedAt=0이면 도착 이벤트 아님)
        if (arrivedAt > 0) {
            intent.putExtra("arrivedAt", arrivedAt);
        }
        if (waypointName != null) {
            intent.putExtra("waypointName", waypointName);
        }
        sendBroadcast(intent);
            logToBlackbox("Broadcast TRIP_NOTIFICATION_SENT sent. type=" + type);

        } catch (Exception e) {
            Log.e(TAG, "SMS Failed", e);
            logToBlackbox("SMS Fail: " + e.getMessage());
        }
    }

    private void refreshStartAddress(double lat, double lng) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logToBlackbox("[Address] API Key missing, skipping refresh.");
            return;
        }

        new Thread(() -> {
            try {
                // Kakao Coord2Address API 호출 (신주소 획득 목적)
                String urlString = "https://dapi.kakao.com/v2/local/geo/coord2address.json?x=" + lng + "&y=" + lat;
                URL url = new URL(urlString);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestProperty("Authorization", "KakaoAK " + apiKey);
                
                if (conn.getResponseCode() == 200) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = in.readLine()) != null) response.append(line);
                    in.close();

                    JSONObject json = new JSONObject(response.toString());
                    JSONArray docs = json.getJSONArray("documents");
                    
                    if (docs.length() > 0) {
                        JSONObject doc = docs.getJSONObject(0);
                        String resolvedAddress = "";

                        // 1순위: 도로명 건물명
                        if (!doc.isNull("road_address")) {
                            JSONObject roadAddr = doc.getJSONObject("road_address");
                            String buildingName = roadAddr.optString("building_name", "").trim();
                            String roadName = roadAddr.optString("address_name", "").trim();
                            if (!buildingName.isEmpty()) {
                                resolvedAddress = buildingName;
                                logToBlackbox("[Address] 1순위(건물명): " + resolvedAddress);
                            } else if (!roadName.isEmpty()) {
                                resolvedAddress = roadName;
                                logToBlackbox("[Address] 2순위(도로명): " + resolvedAddress);
                            }
                        }
                        // 3순위: 지번주소
                        if (resolvedAddress.isEmpty() && !doc.isNull("address")) {
                            resolvedAddress = doc.getJSONObject("address").optString("address_name", "").trim();
                            if (!resolvedAddress.isEmpty()) {
                                logToBlackbox("[Address] 3순위(지번): " + resolvedAddress);
                            }
                        }
                        if (!resolvedAddress.isEmpty()) {
                            Intent intent = new Intent("com.soon.arrival.TRIP_START_ADDRESS_UPDATED");
                            intent.putExtra("address", resolvedAddress);
                            sendBroadcast(intent);
                        }
                    }
                }
                conn.disconnect();
            } catch (Exception e) {
                Log.e(TAG, "Kakao Address API failed", e);
                logToBlackbox("[Address] Fail: " + e.getMessage());
            }
        }).start();
    }

    private void sendDepartureSms() {
        logToBlackbox("sendDepartureSms called: enableDeparture=" + enableDeparture + ", recipient=" + recipient + ", smsMode=" + smsMode);
        if (!enableDeparture) {
            logToBlackbox("Departure SMS blocked: enableDeparture=false");
            return;
        }
        String dMsg = applyVariableReplacement(departureMessageTemplate, estimatedTime, startPointName);
        String dTitle = applyVariableReplacement(departureTitleTemplate, estimatedTime, startPointName);
        logToBlackbox("Departure message: " + dMsg + " (Title: " + dTitle + ")");
        sendSmsNotification(dMsg, dTitle, "departure", null);
        logToBlackbox("Departure SMS sent (as requested by JS toggle)");
    }

    // [New] 전체 주소에서 동/음/면/리 단위 추출
    private String extractShortAddress(String fullAddress) {
        if (fullAddress == null || fullAddress.isEmpty()) return "요시도사리";
        try {
            // 공백으로 조각내어 마지막 의미 있는 어렉 찾기 (동, 리, 음, 면, 가 등으로 끝나는)
            String[] parts = fullAddress.trim().split("\\s+");
            for (int i = parts.length - 1; i >= 0; i--) {
                String p = parts[i];
                if (p.endsWith("동") || p.endsWith("리") || p.endsWith("음") ||
                    p.endsWith("면") || p.endsWith("로") || p.endsWith("가") ||
                    p.endsWith("도") || p.endsWith("시") || p.endsWith("구") ||
                    p.endsWith("군")) {
                    return p; // 어미 기준 마지막 토큰 반환
                }
            }
            // 어미로 찾지 못하면 마지막 단어 반환
            return parts[parts.length - 1];
        } catch (Exception e) {
            return fullAddress; // 파싱 실패 시 원본 반환
        }
    }

    private void markTripCompleted() {
        markTripCompleted(System.currentTimeMillis());
    }

    // [Fix 도착시각] 도착 트리거 발생 시점 기준으로 저장 (앱을 연 시간 X)
    private void markTripCompleted(long arrivalTriggeredAt) {
        long arrivalTimestamp = arrivalTriggeredAt;
        // JS에서 new Date(str) 파싱 가능한 ISO 포맷으로 전달
        String completedAtStr = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.KOREA).format(new Date(arrivalTimestamp));

        SharedPreferences.Editor ed = getSharedPreferences("trip_config", MODE_PRIVATE).edit();
        ed.putBoolean("trip_completed", true);
        ed.putBoolean("trip_active", false);
        ed.putLong("arrival_timestamp", arrivalTimestamp);
        ed.putString("completed_at_str", completedAtStr);
        ed.apply();

        logToBlackbox("🏁 운행 종료 처리됨. 도착 시각: " + completedAtStr + ". 서비스 중지.");

        sendLocationUpdateWithTime(prevLat, prevLng, 0, 0, "completed", 1.0f, completedAtStr, arrivalTimestamp);
        sendStateUpdateWithTime("completed", completedAtStr, arrivalTimestamp);

        updateArrivalNotification(destination);

        Intent intent = new Intent("com.soon.arrival.TRIP_STATE_UPDATE");
        intent.putExtra("status", "completed");
        sendBroadcast(intent);

        if (fusedLocationClient != null && locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
            locationCallback = null;
        }

        handler.postDelayed(() -> {
            stopForeground(true);
            stopSelf();
        }, 3000);
    }

    private void parseWaypoints(String json) {
        // [Fix1] 중복 추가 방지: 파싱 전에 항상 초기화
        waypoints.clear();
        if (json == null || json.isEmpty()) return;
        try {
            JSONArray arr = new JSONArray(json);
            for (int i=0; i<arr.length(); i++) {
                JSONObject o = arr.getJSONObject(i);
                waypoints.add(new WaypointItem(o.getDouble("lat"), o.getDouble("lng"), o.getString("name")));
            }
        } catch (Exception e) { e.printStackTrace(); }
    }

    private void parseNotifications(String json) {
        // [Fix1] 중복 추가 방지
        notificationList.clear();
        if (json == null) return;
        try {
            JSONArray arr = new JSONArray(json);
            for (int i=0; i<arr.length(); i++) notificationList.add(new NotificationItem(arr.getJSONObject(i)));
        } catch (Exception e) { e.printStackTrace(); }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_LOW);
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    private Notification createNotification(String title, String text) {
        return createNotification(title, text, false);
    }

    private Notification createNotification(String title, String text, boolean isArrived) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("openScreen", "active"); // 알림 클릭 시 active 화면으로 이동하도록 플래그 추가
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        String statusLabel = isArrived ? " 도착" : " 운행 중";
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title + statusLabel)
                .setContentText(text)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOnlyAlertOnce(true)
                .build();
    }

    private void updateNotification(String title, String text) {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.notify(NOTIFICATION_ID, createNotification(title, text, false));
    }

    private void updateArrivalNotification(String title) {
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        manager.notify(NOTIFICATION_ID, createNotification(title, "목적지에 도착했습니다.", true));
    }

    private void sendLocationUpdateToUI(double lat, double lng, float dist, int time, String status, float progress) {
        sendLocationUpdateWithTime(lat, lng, dist, time, status, progress, null, 0);
    }

    private void sendLocationUpdateWithTime(double lat, double lng, float dist, int time, String status, float progress, String completedAt, long timestamp) {
        Intent intent = new Intent("com.soon.arrival.TRIP_LOCATION_UPDATE"); 
        intent.putExtra("lat", lat); intent.putExtra("lng", lng);
        intent.putExtra("distMeters", dist); 
        intent.putExtra("timeMin", time);    
        intent.putExtra("status", status);
        intent.putExtra("progress", progress);
        if (completedAt != null) {
            intent.putExtra("completedAtStr", completedAt);
            intent.putExtra("arrivalTimestamp", timestamp);
        }
        sendBroadcast(intent);
    }

    private void sendStateUpdateToUI(String status) {
        sendStateUpdateWithTime(status, null, 0);
    }

    private void sendStateUpdateWithTime(String status, String completedAt, long timestamp) {
        Intent intent = new Intent("com.soon.arrival.TRIP_STATE_UPDATE");
        intent.putExtra("status", status);
        if (completedAt != null) {
            intent.putExtra("completedAtStr", completedAt);
            intent.putExtra("arrivalTimestamp", timestamp);
        }
        sendBroadcast(intent);
    }

    private void saveTripConfig(Intent intent) {
        SharedPreferences.Editor ed = getSharedPreferences("trip_config", MODE_PRIVATE).edit();
        ed.putString("destination", intent.getStringExtra("destination"));
        ed.putString("recipient", intent.getStringExtra("recipient"));
        ed.putFloat("destLat", (float)intent.getDoubleExtra("destLat", 0.0));
        ed.putFloat("destLng", (float)intent.getDoubleExtra("destLng", 0.0));
        // [CRITICAL FIX 3] startLat/startLng 저장 수정 — 서비스 재시작 시 0,0으로 리셋되는 버그 방지
        double sLat = intent.getDoubleExtra("startLat", 0.0);
        double sLng = intent.getDoubleExtra("startLng", 0.0);
        if (sLat != 0.0 && sLng != 0.0) {
            ed.putFloat("startLat", (float) sLat);
            ed.putFloat("startLng", (float) sLng);
        }
        // [New] 전체 거리 저장 (진행률 계산용)
        if (initialTotalDist > 0) {
            ed.putFloat("initialTotalDist", initialTotalDist);
        }

        // [Task 1] 데이터 영구 저장 (Waypoints)
        String wpVal = intent.getStringExtra("waypoints");
        if (wpVal != null) ed.putString("waypoints", wpVal);

        // [2단계] 발송 방식 (smsMode) 저장
        String sMode = intent.getStringExtra("smsMode");
        if (sMode != null) ed.putString("smsMode", sMode);

        // [V_FIX] Clear old history flags for NEW trip
        ed.remove("sent_messages");
        ed.remove("completed_at_str");
        ed.remove("arrival_timestamp");
        ed.putBoolean("trip_completed", false);
        ed.putBoolean("trip_active", true);

        ed.apply();
        saveState(); // 초기 상태 저장
    }
    
    // [New] 상태 저장 메서드
    private void saveState() {
        SharedPreferences.Editor ed = getSharedPreferences("trip_config", MODE_PRIVATE).edit();
        ed.putBoolean("reservationSmsSent", reservationSmsSent);
        ed.putBoolean("isArrivalSmsSent", isArrivalSmsSent);
        // [Fix3-2] 경유지 sent 상태 저장 → 서비스 재시작 후 중복 발송 방지
        for (int i = 0; i < waypoints.size(); i++) {
            ed.putBoolean("wp_sent_" + i, waypoints.get(i).sent);
        }
        ed.apply();
    }

    private Intent loadTripConfig() {
        SharedPreferences prefs = getSharedPreferences("trip_config", MODE_PRIVATE);
        if (!prefs.contains("destination")) return null;
        
        // [New] 완료된 트립인지 확인
        if (prefs.getBoolean("trip_completed", false)) {
            Log.d(TAG, "이미 완료된 트립입니다. 서비스 시작 중단.");
            return null;
        }

        Intent intent = new Intent();
        intent.putExtra("destination", prefs.getString("destination", ""));
        intent.putExtra("recipient", prefs.getString("recipient", ""));
        intent.putExtra("destLat", (double)prefs.getFloat("destLat", 0f));
        intent.putExtra("destLng", (double)prefs.getFloat("destLng", 0f));
        
        // [New] 저장된 전체 거리 복구
        float savedTotalDist = prefs.getFloat("initialTotalDist", 0f);
        if (savedTotalDist > 0) {
            this.initialTotalDist = savedTotalDist;
            logToBlackbox("Restored Total Distance: " + initialTotalDist);
        }
        
        // [New] 상태 복구
        this.reservationSmsSent = prefs.getBoolean("reservationSmsSent", false);
        this.isArrivalSmsSent = prefs.getBoolean("isArrivalSmsSent", false);

        // [CRITICAL FIX 3] startLat/startLng 복구 — 재시작 시 0,0으로 리셋되는 버그 방지
        float savedSLat = prefs.getFloat("startLat", 0f);
        float savedSLng = prefs.getFloat("startLng", 0f);
        if (savedSLat != 0f && savedSLng != 0f) {
            this.startLat = savedSLat;
            this.startLng = savedSLng;
            logToBlackbox("startLat/Lng Restored: " + startLat + "," + startLng);
        }

        // [템플릿] 서비스 재시작 시 저장된 템플릿 복구
        String savedDep = prefs.getString("departureMessageTemplate", "");
        String savedWp  = prefs.getString("waypointMessageTemplate",  "");
        String savedArr = prefs.getString("arrivalMessageTemplate",   "");
        if (!savedDep.isEmpty()) this.departureMessageTemplate = savedDep;
        if (!savedWp.isEmpty())  this.waypointMessageTemplate  = savedWp;
        if (!savedArr.isEmpty()) this.arrivalMessageTemplate   = savedArr;

        // [2단계] 발송 방식 복구
        String sMode = prefs.getString("smsMode", "sms_single");
        intent.putExtra("smsMode", sMode);
        this.smsMode = sMode;

        // [Task 2] 경유지 복구 + [Fix3-2] sent 상태 복구
        String wpJson = prefs.getString("waypoints", "[]");
        intent.putExtra("waypoints", wpJson);
        
        if (this.waypoints == null) this.waypoints = new java.util.ArrayList<>();
        else this.waypoints.clear();
        parseWaypoints(wpJson);

        // [Fix3-2] 경유지 sent 상태 복구 (서비스 재시작 시 중복 전송 방지)
        for (int i = 0; i < waypoints.size(); i++) {
            waypoints.get(i).sent = prefs.getBoolean("wp_sent_" + i, false);
        }

        logToBlackbox("Config Restored: WP_Count=" + waypoints.size());
        
        return intent;
    }

    private void logToBlackbox(String msg) {
        Log.d("Blackbox", msg);
        // [New] 파일 로깅 구현
        try {
            java.io.File file = new java.io.File(getFilesDir(), "trip_box.log");
            java.io.FileWriter fw = new java.io.FileWriter(file, true); // append mode
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("MM-dd HH:mm:ss", java.util.Locale.getDefault());
            String timestamp = sdf.format(new java.util.Date());
            fw.write("[" + timestamp + "] " + msg + "\n");
            fw.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void startTunnelSimulation() { /* Tunnel Logic */ }

    /**
     * [v_fix] 통합 변수 치환 헬퍼
     * #{변수명} 및 {변수명} 형식을 모두 지원하며, 발송자 이름 및 위치명을 치환합니다.
     */
    private String applyVariableReplacement(String template, int time, String locationName) {
        if (template == null) return "";
        String result = template;
        
        // 특정 위치명 결정 (경유지명 우선, 없으면 출발지명 사용)
        String loc = (locationName != null && !locationName.isEmpty()) ? locationName : (startPointName != null ? startPointName : "운행 경로");
        
        // [V_LOG] 치환 시작
        try {
            // 1. 발송자 (Sender)
            result = result.replace("#{발송자}", senderName != null ? senderName : "게스트")
                           .replace("{발송자}", senderName != null ? senderName : "게스트");
            
            // 2. 남은시간/시간 (Time)
            String timeStr = String.valueOf(time);
            result = result.replace("#{남은시간}", timeStr).replace("{남은시간}", timeStr)
                           .replace("#{시간}", timeStr).replace("{시간}", timeStr)
                           .replace("#{time}", timeStr).replace("{time}", timeStr);
            
            // 3. 목적지/도착지 (Destination)
            result = result.replace("#{도착지}", destination != null ? destination : "목적지")
                           .replace("{도착지}", destination != null ? destination : "목적지")
                           .replace("#{destination}", destination != null ? destination : "목적지");
            
            // 4. 경유지/출발지/현위치 (Location)
            String startLoc = startPointName != null ? startPointName : "출발지";
            result = result.replace("#{출발지}", startLoc).replace("{출발지}", startLoc)
                           .replace("#{경유지}", loc).replace("{경유지}", loc)
                           .replace("#{현위치}", loc).replace("{현위치}", loc)
                           .replace("#{현재위치}", loc).replace("{현재위치}", loc)
                           .replace("#{currentLocation}", loc).replace("{currentLocation}", loc);
            
            // [V_LOG] 치환 결과 출력 (줄바꿈 제거하여 가독성 높임)
            logToBlackbox("📝 Substitution Result: " + result.replaceAll("\n", " "));
        } catch (Exception e) {
            logToBlackbox("❌ Substitution Error: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * [V_FIX] 백그라운드 환경(앱 프리징 등)에서도 확실한 발송을 위해
     * 네이티브 서비스에서 직접 Supabase Edge Function을 호출합니다.
     */
    private void sendKakaoAlimtalkNative(final String message, final String title, final String type) {
        sendKakaoAlimtalkNative(message, title, type, null);
    }

    /**
     * [올톡 연동] Supabase Edge Function을 통해 올톡 알림톡 발송
     * @param waypointNameForVar 경유지 알림 시 경유지 이름 (null이면 startPointName 사용)
     */
    private void sendKakaoAlimtalkNative(final String message, final String title, final String type, final String waypointNameForVar) {
        if (supabaseUrl == null || supabaseUrl.isEmpty() || supabaseAnonKey == null || supabaseAnonKey.isEmpty()) {
            logToBlackbox("[ERROR] Supabase credentials missing. Cannot send Kakao via Oltalk.");
            return;
        }

        new Thread(() -> {
            try {
                String baseUrl = supabaseUrl;
                if (baseUrl.endsWith("/")) baseUrl = baseUrl.substring(0, baseUrl.length() - 1);

                URL url = new URL(baseUrl + "/functions/v1/send-kakao-alimtalk");
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Authorization", "Bearer " + supabaseAnonKey);
                conn.setDoOutput(true);

                JSONObject body = new JSONObject();
                body.put("recipient", recipient);
                body.put("message", message);   // SMS 대체발송용 완성 메시지
                body.put("title", title);
                body.put("type", type);
                body.put("tripId", currentTripId);

                // [올톡] 템플릿 변수값 전달 (#{VAR1}~#{VAR4})
                // 타입별 VAR 매핑:
                //   departure  → VAR1=발송자, VAR2=출발지, VAR3=도착지, VAR4=남은시간
                //   waypoint   → VAR1=발송자, VAR2=경유지, VAR3=남은시간
                //   arrival    → VAR1=발송자, VAR2=도착지, VAR3=남은시간
                String var1 = senderName != null ? senderName : "게스트";
                String var2 = "";
                String var3 = "";
                String var4 = "";

                if ("departure".equals(type) || "waiting".equals(type)) {
                    var2 = startPointName != null ? startPointName : "출발지";
                    var3 = destination   != null ? destination   : "목적지";
                    var4 = String.valueOf(estimatedTime);
                } else if ("waypoint".equals(type)) {
                    var2 = (waypointNameForVar != null && !waypointNameForVar.isEmpty())
                            ? waypointNameForVar : (startPointName != null ? startPointName : "경유지");
                    var3 = String.valueOf(estimatedTime);
                } else if ("arrival".equals(type)) {
                    var2 = destination != null ? destination : "목적지";
                    var3 = String.valueOf(estimatedTime);
                }

                body.put("var1", var1);
                body.put("var2", var2);
                body.put("var3", var3);
                if (!var4.isEmpty()) body.put("var4", var4);

                logToBlackbox("[올톡] type=" + type + " VAR1=" + var1 + " VAR2=" + var2 + " VAR3=" + var3 + " VAR4=" + var4);

                java.io.OutputStream os = conn.getOutputStream();
                os.write(body.toString().getBytes("UTF-8"));
                os.close();

                int responseCode = conn.getResponseCode();
                String responseBody = "";
                try {
                    java.io.InputStream is = (responseCode >= 200 && responseCode < 300) ? conn.getInputStream() : conn.getErrorStream();
                    if (is != null) {
                        java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
                        StringBuilder sb = new StringBuilder();
                        String line;
                        while ((line = reader.readLine()) != null) sb.append(line);
                        responseBody = sb.toString();
                        is.close();
                    }
                } catch (Exception e) {
                    logToBlackbox("Error reading response: " + e.getMessage());
                }

                if (responseCode == 200 || responseCode == 201) {
                    logToBlackbox("✅ 올톡 알림톡 발송 성공 (type=" + type + ")");
                } else {
                    logToBlackbox("❌ 올톡 알림톡 발송 실패. Code=" + responseCode + ", Body=" + responseBody);
                }
                conn.disconnect();
            } catch (Exception e) {
                logToBlackbox("❌ 올톡 Native Error: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
    }


    private void stopNotification() { /* Tunnel Logic */ }

    @Override
    public void onDestroy() {
        logToBlackbox("Service Destroyed");
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            logToBlackbox("WakeLock released.");
        }
        // [Fix] 서비스 종료 시 항상 알림 제거 (배지 초기화)
        try {
            android.app.NotificationManager nm =
                (android.app.NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            nm.cancel(NOTIFICATION_ID);
        } catch (Exception e) {
            Log.e(TAG, "Failed to cancel notification on destroy", e);
        }
        stopForeground(true);
        isRunning = false;
        instance = null; // [Fix] 인스턴스 참조 해제
        if (fusedLocationClient != null && locationCallback != null)
            fusedLocationClient.removeLocationUpdates(locationCallback);
        super.onDestroy();
    }
}
