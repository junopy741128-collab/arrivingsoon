@echo off
echo [Monitoring TripNotificationService...]
echo [Press Ctrl+C to Stop]
echo.
C:\Users\NOBLAND\AppData\Local\Android\Sdk\platform-tools\adb.exe logcat -v time -s TripNotificationService TripNotificationPlugin GMaps SMS_SENT
