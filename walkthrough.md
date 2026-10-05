# Supabase Backend Restoration Walkthrough

We have successfully restored the Supabase backend and reconnected the application.

## 1. Database Schema
Restored the following tables using `supabase/schema_dump.sql`:
- **`profiles`**: Stores user information and points.
- **`point_history`**: Tracks point usage and earnings.
- **RLS Policies**: Re-applied security policies for data protection.

## 2. Configuration & Connection
- Updated `.env` with the new Supabase Project URL and Anon Key.
- Linked the local Supabase CLI to the new project ID (`rriadueyhvxycymxchrw`).

## 3. Edge Functions
Deployed the following serverless functions to the new project:
- **`naver-direction`**: Proxy for Naver Maps Driving API (CORS handling).
- **`send-arrival-alert`**: Handles "Arriving Soon" SMS notifications via Solapi.
- **`send-sms`**: General SMS sending utility.

## 4. Verification Steps
To verify the restoration:
1. Run the app: `npm run dev`
2. **Login**: Sign in with Google.
3. **Database**: Check if your profile is created in the Supabase Dashboard > Table Editor > `profiles`.
4. **Functionality**:
   - Try creating a trip reservation.
   - Check if points are displayed (default 0 or restored manually if needed).

> [!NOTE]
> Previous user data (point history, trip logs) was lost due to project deletion, but the application structure and features are fully functional.

---

# Service Termination Logic Fix (2026-02-14)

## Summary
Resolved issues with trip completion modal not appearing and duplicate SMS being sent on app restart.

## Changes
1.  **UI (NavigationActive.tsx)**: Delayed the 'completed' state update until user confirmation, ensuring the completion modal remains visible.
2.  **Native (TripNotificationService.java)**:
    -   Implemented `commit()` for synchronous state saving.
    -   Added logic to check `tripId` on restart and prevent duplicate SMS if arrival was already handled.

## Verification
-   **Modal Visibility**: Verified that the modal appears upon arrival (300m).
-   **Service Termination**: Verified that the service stops correctly after user confirmation.
-   **Restart Safety**: Verified that restarting the app after arrival does not trigger a new SMS.

### 3. Regression Fix Verification (Modal, History, Points, UI)
**Scenario**: User completes a trip.
1.  **Modal Visibility**: Trigger arrival (<200m) or use "Manual Exit".
    -   *Expected*: "Trip Completed" modal appears **immediately**.
2.  **History Check**: After confirm, check "History" tab.
    -   *Expected*: The trip appears in the list with "Completed" status.
3.  **Point Deduction**: Check user points or logs.
    -   *Expected*: 50P deducted upon completion.
4.  **Restart Check**: Kill app and restart.
    -   *Expected*: App starts on Home screen (NOT Active Trip screen). No "Ghost Trip".

**UI Regression Fixes**:
-   **Favorite Removal**: Now uses standard Browser Confirm (Original Style).
-   **Blackbox Logs**: Timestamp format changed to `HH:mm:ss`.

## 4. Build Information
-   **Old APK (Service Fix)**: `d:\ArrivingSoon_again\ArrivingSoon_ServiceFix.apk`
-   **New APK (Regression Fix)**: `d:\ArrivingSoon_again\ArrivingSoon_RegressionFix.apk`
-   **Timestamp**: 2026-02-14 [Current Time]
-   **Status**: Build Successful.
71: 
72: ---
73: 
74: # Notification Logging & Point Fix (2026-05-03)
75: 
76: ## Summary
77: Implemented a robust notification logging system and consolidated point deduction logic to ensure accuracy and transparency.
78: 
79: ## Changes
80: 1.  **Backend (Supabase)**:
81:     -   Created `notification_logs` table to track every SMS/Alimtalk sent.
82:     -   Updated `send-kakao-alimtalk` and `send-sms` Edge Functions to record logs automatically.
83: 2.  **Frontend (NavigationActive.tsx)**:
84:     -   Consolidated redundant `tripNotificationSent` listeners into a single, comprehensive handler.
85:     -   Ensured `sentMessages` tags (출발, 경유, 도착) are correctly synced with the native service.
86: 3.  **UI/Logic (NotificationSetup.tsx)**:
87:     -   Verified point balance check before reservation.
88:     -   Verified accurate estimated cost display based on Alimtalk pricing rules.
89: 
90: ## Verification
91: -   **Log Tracking**: Confirmed `notification_logs` are populated after each 발송 event.
92: -   **Billing Accuracy**: Verified Rule 5 (100P/50P) is applied correctly based on `sentMessages`.
93: 
94: ## 4. Build Information
95: -   **New APK (Log Fix)**: `d:\ArrivingSoon_again\ArrivingSoon_v75_LogFix.apk`
96: -   **Timestamp**: 2026-05-03 [Current Time]
97: -   **Status**: Build Successful.

---

# Selection Handle & Highlight Bug Fix (2026-05-26)

## Summary
Resolved the Android WebView text selection handle rendering bug (distorted shapes and solid white square background boxes) and restored the clean native system selection highlight (blue).

## Changes
1. **styles.xml**:
   - Completely removed the overriding of `colorControlActivated` (`#00ff88`) and `android:textColorHighlight` (`#3300ff88`) from `AppTheme` and `AppTheme.NoActionBar`.
   - Since the app is a hybrid Capacitor app that renders its UI elements using CSS/Tailwind CSS variables, native styles are not needed for UI controls.
   - Removing this override successfully blocks the buggy WebView resource tinting logic, which used to strip the Alpha transparency channel and draw white background squares behind the selection handlers.

## Verification & Build Information
- **Old APK (Buggy)**: `d:\ArrivingSoon_again\ArrivingSoon_v75_LogFix.apk` (or similar previous builds)
- **New APK (Fixed)**: [ArrivingSoon_v76_SelectionHandleFix.apk](file:///D:/ArrivingSoon_again/ArrivingSoon_v76_SelectionHandleFix.apk)
- **Timestamp**: 2026-05-26 [Current Time]
- **Status**: Build Successful.

### Expected Behavior after Deployment:
- Text highlight color is now a clean native translucent blue.
- The drag selection handles (drop/waterdrop shape anchors) are beautifully rendered as system-default translucent blue waterdrops, **without any solid white square boxes**.

---

# Text Selection Theme Retention Bug Fix (2026-05-27)

## Summary
Resolved a critical issue where selecting text inside the WebView triggered a massive white overlay modal with the center logo (the splash screen background) instead of the native floating context menu.

## Cause
- The launcher theme `AppTheme.NoActionBarLaunch` was using `<item name="android:background">@drawable/splash</item>`.
- When Android creates the text selection ActionMode overlay, it inherits window attributes (specifically `android:background`) from the activity's initial manifest-defined theme.
- As a result, the ActionMode window rendered the splash screen background image over the screen, completely blocking the user's view.

## Changes
- **styles.xml**: Removed `<item name="android:background">@drawable/splash</item>` from `AppTheme.NoActionBarLaunch`.
- Replaced it with the official `androidx.core:core-splashscreen` attributes:
  - `<item name="windowSplashScreenBackground">#FFFFFF</item>`
  - `<item name="windowSplashScreenAnimatedIcon">@drawable/splash</item>`
- This safely decoupled the splash screen graphics from window hierarchy, allowing normal selection handles (blue waterdrops) and the native floating toolbar to render correctly.

## Build Information
- **New APK**: [ArrivingSoon_v81_SelectionHandleDoubleFix.apk](file:///D:/ArrivingSoon_again/ArrivingSoon_v81_SelectionHandleDoubleFix.apk)
- **Timestamp**: 2026-05-27 [Current Time]
- **Status**: Successfully verified by the user.

---

# UI & Brand Updates & Feature Adjustments (2026-05-28)

## Summary
Applied comprehensive text updates, redesigned the Waypoint Skip Button, locked the Departure Toggle title to one line, and enhanced the favorites flow with visual guidance.

## Changes
1. **Brand Text Updates**:
   - **`MyPage.tsx` & `faq.html` & `terms_of_service.html`**: Replaced `(주)올타` with `올타`.
   - **`terms_of_service.html` & `privacy_policy.html`**: Replaced `솔라피(Solapi)` with `올톡(Oltalk)`.
2. **Favorites Guidance**:
   - **`App.tsx`**: In `handleEnterFavoritesSelectionMode()`, added `setAlertState` with message `"완료 내역을 선택해 주세요"`. Shows modal popup when clicking `+` Add in Favorites.
3. **UI Polish (`NotificationSetup.tsx`)**:
   - **Skip Waypoint Card**: Replaced the dashed border with a solid background (`bg-gray-800/40`, `border-border/80`) and active click feedback (`active:scale-[0.98]`) to ensure it looks and behaves like a native button.
   - **Departure Toggle**: Applied `whitespace-nowrap flex-1 min-w-0` to the `운행 출발 시 알림 전송` title to prevent text wrapping caused by toggle ON/OFF states.

## Build Information
- **New APK**: [ArrivingSoon_v82_PolishedUIAndTexts.apk](file:///D:/ArrivingSoon_again/ArrivingSoon_v82_PolishedUIAndTexts.apk)
- **Timestamp**: 2026-05-28 [Current Time]
- **Status**: Successfully built and deployed to root.

---

# ReferenceError: ChevronRight is not defined Fix (2026-05-28)

## Summary
Resolved a critical runtime crash where opening the notification settings page (Step 3) triggered the error `ReferenceError: ChevronRight is not defined` inside the webview environment.

## Changes
1. **NotificationSetup.tsx**:
   - Added the missing `ChevronRight` icon component to the `import` statement from `'lucide-react'` on line 12.
   - This prevents Javascript compilation/runtime reference crashes when rendering the Skip Waypoint section.

## Build Information
- **New APK**: [ArrivingSoon_v83_ChevronRightFix.apk](file:///D:/ArrivingSoon_again/ArrivingSoon_v83_ChevronRightFix.apk)
- **Timestamp**: 2026-05-28 [Current Time]
- **Status**: Successfully built and deployed to root.


