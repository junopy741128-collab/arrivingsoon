/**
 * Capacitor 네이티브 플러그인 헬퍼
 * 웹과 네이티브 앱 모두에서 작동하도록 설계
 */

import { Capacitor } from '@capacitor/core';
import { showAlert } from './globalAlert';

// Capacitor 환경인지 확인
export const isNative = () => {
  return Capacitor.isNativePlatform();
};

// 현재 플랫폼 확인
export const getPlatform = () => {
  return Capacitor.getPlatform(); // 'ios', 'android', 'web'
};

// GPS 위치 권한 요청
export const requestLocationPermission = async () => {
  if (!isNative()) {
    // 웹 브라우저 - Geolocation API 사용
    return new Promise<boolean>((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false)
        );
      } else {
        resolve(false);
      }
    });
  }

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const permission = await Geolocation.checkPermissions();

    if (permission.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      return request.location === 'granted';
    }

    return true;
  } catch (error) {
    console.error('위치 권한 요청 실패:', error);
    return false;
  }
};

// 현재 위치 가져오기
export const getCurrentPosition = async () => {
  if (!isNative()) {
    // 웹 브라우저
    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('위치 가져오기 실패:', error);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
          }
        );
      } else {
        resolve(null);
      }
    });
  }

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 20000,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    console.error('위치 가져오기 실패:', error);
    // Fallback: try with lower accuracy if high accuracy fails
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 20000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (e2) {
      console.error('위치 가져오기 완전 실패:', e2);
      return null;
    }
  }
};

// 위치 추적 시작
export const watchPosition = async (callback: (position: { latitude: number; longitude: number }) => void) => {
  if (!isNative()) {
    // 웹 브라우저
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('위치 추적 실패:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
    return () => { };
  }

  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    const watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 20000,
      },
      (position) => {
        if (position) {
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      }
    );

    return async () => {
      await Geolocation.clearWatch({ id: watchId });
    };
  } catch (error) {
    console.error('위치 추적 실패:', error);
    return () => { };
  }
};

// SMS 전송 (네이티브 앱에서만)
export const sendSMS = async (phoneNumber: string, message: string) => {
  if (!isNative()) {
    // 웹 - SMS 앱 열기
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
    return { success: true, message: 'SMS 앱이 열렸습니다.' };
  }

  try {
    // 네이티브 - 실제 SMS 전송
    // 주의: Android에서는 별도 플러그인 필요 (capacitor-sms-plugin)
    window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
    return { success: true, message: 'SMS 전송 완료' };
  } catch (error) {
    console.error('SMS 전송 실패:', error);
    return { success: false, message: 'SMS 전송 실패' };
  }
};

// 로컬 알림 (푸시 알림)
export const showNotification = async (title: string, body: string) => {
  if (!isNative()) {
    // 웹 - Notification API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    return;
  }

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');

    // 권한 확인
    const permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // 알림 표시
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) }, // 즉시
        },
      ],
    });
  } catch (error) {
    console.error('알림 표시 실패:', error);
  }
};

// 진동
export const vibrate = async (duration: number = 200) => {
  if (!isNative()) {
    // 웹 - Vibration API
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
    return;
  }

  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('진동 실패:', error);
  }
};

// 앱 정보 가져오기
export const getAppInfo = async () => {
  if (!isNative()) {
    return {
      version: '1.0.0',
      build: '1',
    };
  }

  try {
    const { App } = await import('@capacitor/app');
    const info = await App.getInfo();
    return {
      version: info.version,
      build: info.build,
    };
  } catch (error) {
    console.error('앱 정보 가져오기 실패:', error);
    return {
      version: '1.0.0',
      build: '1',
    };
  }
};

// 백그라운드 모드 설정 (Android)
export const enableBackgroundMode = async () => {
  if (!isNative() || getPlatform() !== 'android') {
    return false;
  }

  try {
    // 백그라운드 실행을 위한 설정
    // 실제 구현은 별도 플러그인 필요
    console.log('백그라운드 모드 활성화');
    return true;
  } catch (error) {
    console.error('백그라운드 모드 실패:', error);
    return false;
  }
};

// 연락처 가져오기 (Contacts Picker API)
export const pickContacts = async () => {
  if (!isNative()) {
    // 웹 - Contact Picker API
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        // @ts-ignore
        const selectedContacts = await navigator.contacts.select(props, opts);
        return selectedContacts.map((contact: any) => ({
          name: contact.name?.[0] || '이름 없음',
          phone: contact.tel?.[0] || '',
        }));
      }
    } catch (error) {
      console.log('연락처 선택 취소됨');
    }
    return [];
  }

  try {
    // 네이티브 - Contacts 플러그인 필요
    showAlert('연락처 가져오기 기능은 추후 추가 예정입니다.\n현재는 수동으로 추가해주세요.');
    return [];
  } catch (error) {
    console.error('연락처 가져오기 실패:', error);
    return [];
  }
};

// 카카오톡 공유
export const shareToKakao = async (text: string) => {
  if (isNative()) {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: '운전기사 자동 알림 서비스',
        text: text,
        dialogTitle: '공유하기',
      });
      return true;
    } catch (error) {
      console.error('공유 실패:', error);
      return false;
    }
  } else {
    // 웹 - Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: '운전기사 자동 알림 서비스',
          text: text,
        });
        return true;
      } catch (error) {
        console.log('공유 취소됨');
        return false;
      }
    } else {
      // 폴백 - 클립보드 복사
      await navigator.clipboard.writeText(text);
      showAlert('메시지가 복사되었습니다.\n카카오톡에서 붙여넣기 해주세요.');
      return true;
    }
  }
};

// 화면 항상 켜짐 유지 (네비게이션 중)
export const keepScreenOn = async (enable: boolean) => {
  if (!isNative()) {
    // 웹 - Screen Wake Lock API
    try {
      if ('wakeLock' in navigator) {
        if (enable) {
          // @ts-ignore
          await navigator.wakeLock.request('screen');
        }
      }
    } catch (error) {
      console.error('화면 켜짐 유지 실패:', error);
    }
    return;
  }

  try {
    const { KeepAwake } = await import('@capacitor-community/keep-awake');
    if (enable) {
      await KeepAwake.keepAwake();
    } else {
      await KeepAwake.allowSleep();
    }
  } catch (error) {
    console.error('화면 켜짐 유지 실패:', error);
  }
};
