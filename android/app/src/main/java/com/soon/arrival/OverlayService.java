package com.soon.arrival;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class OverlayService extends Service {
    private WindowManager windowManager;
    private View overlayView;
    private static final String CHANNEL_ID = "OverlayServiceChannel";

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(1, createNotification());

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        addOverlayView();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Ensure service stays alive
        return START_STICKY;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Overlay Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("알림 서비스 실행 중")
                .setContentText("오버레이 화면이 표시되고 있습니다.")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent);
        
        return builder.build();
    }

    private void addOverlayView() {
        int layoutFlag;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
        }

        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT);

        // Initial position
        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 100;
        params.y = 100;

        try {
            overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_view, null);

            // Touch listener for dragging and clicking
            overlayView.setOnTouchListener(new View.OnTouchListener() {
                private int initialX;
                private int initialY;
                private float initialTouchX;
                private float initialTouchY;
                private boolean isClick;

                @Override
                public boolean onTouch(View v, MotionEvent event) {
                    switch (event.getAction()) {
                        case MotionEvent.ACTION_DOWN:
                            initialX = params.x;
                            initialY = params.y;
                            initialTouchX = event.getRawX();
                            initialTouchY = event.getRawY();
                            isClick = true;
                            return true;
                        case MotionEvent.ACTION_UP:
                            if (isClick) {
                                // Handle click: Open App
                                Intent intent = new Intent(OverlayService.this, MainActivity.class);
                                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                                startActivity(intent);
                            }
                            return true;
                        case MotionEvent.ACTION_MOVE:
                            int dx = (int) (event.getRawX() - initialTouchX);
                            int dy = (int) (event.getRawY() - initialTouchY);
                            
                            // If moved significantly, it's a drag, not a click
                            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                                isClick = false;
                            }

                            params.x = initialX + dx;
                            params.y = initialY + dy;
                            windowManager.updateViewLayout(overlayView, params);
                            return true;
                    }
                    return false;
                }
            });

            windowManager.addView(overlayView, params);
            android.widget.Toast.makeText(this, "오버레이 화면 추가됨", android.widget.Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            e.printStackTrace();
            android.widget.Toast.makeText(this, "오버레이 오류: " + e.getMessage(), android.widget.Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (overlayView != null) {
            if (windowManager != null) {
                windowManager.removeView(overlayView);
            }
        }
    }
}
