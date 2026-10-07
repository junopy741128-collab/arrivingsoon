import { ArrowLeft, Mail } from 'lucide-react';
import logoImage from '../assets/logo.png';

import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser'; // [V37] Added
import type { Screen } from '../App';
import { supabase } from '../lib/supabaseClient';
import { setAuthToken } from '../utils/api';
import { showAlert } from '../utils/globalAlert';
import { CapacitorKakaoLogin as KakaoLogin } from '@team-lepisode/capacitor-kakao-login';

interface SnsLoginProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function SnsLogin({ onBack, onNavigate }: SnsLoginProps) {
  useEffect(() => {
    if (Capacitor.getPlatform() === 'android') {
      KakaoLogin.initialize({ appKey: '29e58998be931737658cd80da3a6ce41' }).catch(console.error);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // [Fix] Auth state listener for OAuth callback detection
  useEffect(() => {
    // Listen for auth state changes (OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 [SnsLogin Auth State Change]', event, session);

      if (event === 'SIGNED_IN' && session) {
        console.log('✅ OAuth 로그인 성공 - 세션 확인');
        setAuthToken(session.access_token);
        setIsLoading(false);
        setLoadingProvider(null);

        // [중요] App.tsx의 auth listener가 모든 것을 처리
        console.log('🔵 [SnsLogin] App.tsx에서 프로필 업데이트 및 화면 전환 처리 대기 중...');
      }
    });

    // [V37] Listen for Browser Close (User Cancel)
    let browserListener: any;
    const setupBrowserListener = async () => {
      browserListener = await Browser.addListener('browserFinished', () => {
        console.log('🔵 [SnsLogin] Browser Closed (User Cancelled?)');
        // If we are still loading, it means user closed browser properly but maybe didn't login?
        // Actually, if login succeeded, the appUrlOpen event fires FIRST, checks session, updates state.
        // But if user just closed X button, we should stop loading.
        // We'll give it a small delay to allow deep link to process if it was a success close.
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProvider(null);
        }, 1000);
      });
    };
    setupBrowserListener();

    return () => {
      subscription.unsubscribe();
      if (browserListener) browserListener.remove();
    };
  }, []);

  const handleSnsLogin = async (provider: 'google' | 'kakao') => {
    console.log(`[SnsLogin] ${provider} Login requested`);
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      const isNative = Capacitor.isNativePlatform();

      if (provider === 'kakao' && isNative) {
        console.log('[Kakao Native] Starting native login flow...');
        
        // 1. 네이티브 카카오 로그인 호출 (카카오톡 열림)
        const result = await KakaoLogin.login();
        console.log('[Kakao Native] Result:', result);

        if (!result.idToken) {
           throw new Error('idToken을 받지 못했습니다. 카카오 데브톡에서 OpenID Connect가 활성화되었는지 확인하세요.');
        }

        // 2. 받은 idToken으로 Supabase 로그인!
        console.log('[Kakao Native] Authenticating with Supabase...');
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'kakao',
          token: result.idToken,
        });

        if (error) throw error;
        
        console.log('[Kakao Native] Supabase login success!', data);
        if (data.session) {
           setAuthToken(data.session.access_token);
        }
        
        // onAuthStateChange will trigger navigation
        return; 
      }

      // 구글 웹/네이티브 로그인 및 카카오 웹 로그인 처리 로직 (기존 유지)
      const redirectUrl = isNative ? 'com.soon.arrival://login-callback' : window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        }
      });

      if (error) throw error;

      if (data?.url) {
        if (isNative) {
          await Browser.open({
            url: data.url,
            toolbarColor: '#0f2920',
            windowName: '_self'
          });
        } else {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error(`❌ [${provider} Login] 로그인 오류:`, error);
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      showAlert(`${provider} 로그인 실패\n\n에러: ${errorMessage}`);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Header */}
      <header className="flex items-center px-4 py-4">
        <button onClick={onBack} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center">로그인</h1>
        <div className="w-10"></div>
      </header>


      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <img src={logoImage} alt="곧 도착해요 로고" className="w-full h-full" />
          </div>
          <h2 className="text-2xl mb-2">운전기사 알림 서비스</h2>
          <p className="text-gray-400">간편하게 로그인하고 시작하세요</p>
        </div>

        {/* Login Buttons */}
        <div className="space-y-3 mb-6">
          {/* Google Login */}
          <Button
            onClick={() => handleSnsLogin('google')}
            disabled={isLoading && loadingProvider === 'google'}
            className="w-full h-14 rounded-2xl border border-gray-600 bg-white hover:bg-gray-100 text-[#000000] flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.351z" fill="#4285F4" />
              <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853" />
              <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.141 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
              <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.737 7.395 3.977 10 3.977z" fill="#EA4335" />
            </svg>
            {isLoading && loadingProvider === 'google' ? '로그인 중...' : 'Google로 계속하기'}
          </Button>

          {/* Kakao Login */}
          <Button
            onClick={() => handleSnsLogin('kakao')}
            disabled={isLoading && loadingProvider === 'kakao'}
            className="w-full h-14 rounded-2xl border border-transparent bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] flex items-center justify-center gap-3"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C6.477 3 2 6.582 2 11C2 13.91 3.924 16.46 6.837 17.804L5.645 22.146C5.556 22.467 5.923 22.73 6.186 22.53L11.528 18.573C11.685 18.58 11.841 18.587 12 18.587C17.523 18.587 22 15.005 22 10.587C22 6.169 17.523 3 12 3Z" fill="black" />
            </svg>
            {isLoading && loadingProvider === 'kakao' ? '로그인 중...' : '카카오로 계속하기'}
          </Button>

          {/* Email Login */}
          <Button
            onClick={() => onNavigate('emailLogin')}
            className="w-full h-14 rounded-2xl border border-[#00ff88] bg-transparent hover:bg-[#1a3d32] text-white flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            이메일로 계속하기
          </Button>
        </div>


      </div>
      {/* [V37] Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-[#0f2920] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-app-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-lg font-medium">로그인 중...</p>
          <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      )}
    </div>
  );
}