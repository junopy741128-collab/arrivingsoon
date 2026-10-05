import { ArrowLeft, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import type { Screen } from '../App';
import logoImage from 'figma:asset/a6ded2d6ea9d85ee6ee0dcfb9e3e5eda489e102e.png';

interface SnsLoginProps {
  onBack: () => void;
  onComplete: () => void;
}

export function SnsLogin({ onBack, onComplete }: SnsLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);

  const handleSnsLogin = (provider: string) => {
    // SNS 로그인 처리 (실제로는 OAuth 연동 필요)
    console.log(`${provider} 로그인 시도`);
    // 임시로 바로 완료 처리
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handlePhoneLogin = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }
    // 전화번호 로그인 처리
    console.log('전화번호 로그인:', phoneNumber);
    onComplete();
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
          <div className="w-20 h-20 bg-[#00ff88]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <img src={logoImage} alt="곧 도착해요 로고" className="w-16 h-16" />
          </div>
          <h2 className="text-2xl mb-2">운전기사 알림 서비스</h2>
          <p className="text-gray-400">간편하게 로그인하고 시작하세요</p>
        </div>

        {!isPhoneLogin ? (
          <>
            {/* SNS Login Buttons */}
            <div className="space-y-3 mb-6">
              {/* Kakao Login */}
              <Button
                onClick={() => handleSnsLogin('kakao')}
                className="w-full h-14 rounded-2xl border-0 bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-[#000000] rounded-full flex items-center justify-center">
                  <span className="text-[#FEE500] text-xs">K</span>
                </div>
                카카오톡으로 계속하기
              </Button>

              {/* Naver Login */}
              <Button
                onClick={() => handleSnsLogin('naver')}
                className="w-full h-14 rounded-2xl border-0 bg-[#03C75A] hover:bg-[#02B350] text-white flex items-center justify-center gap-3"
              >
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-[#03C75A] text-xs">N</span>
                </div>
                네이버로 계속하기
              </Button>

              {/* Google Login */}
              <Button
                onClick={() => handleSnsLogin('google')}
                className="w-full h-14 rounded-2xl border border-gray-600 bg-white hover:bg-gray-100 text-[#000000] flex items-center justify-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.351z" fill="#4285F4"/>
                  <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                  <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.141 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
                  <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.737 7.395 3.977 10 3.977z" fill="#EA4335"/>
                </svg>
                Google로 계속하기
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-500 text-sm">또는</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            {/* Guest Login */}
            <Button
              onClick={onComplete}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
            >
              게스트로 둘러보기
            </Button>
          </>
        ) : (
          <>
            {/* Phone Number Login Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">전화번호</label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full bg-[#1a3d32] border-0 rounded-2xl h-14 text-white placeholder:text-gray-500"
                />
              </div>
              <p className="text-sm text-gray-400">
                인증번호가 문자로 전송됩니다
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePhoneLogin}
                className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl border-0"
              >
                인증번호 받기
              </Button>
              <Button
                onClick={() => setIsPhoneLogin(false)}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
              >
                다른 방법으로 로그인
              </Button>
            </div>
          </>
        )}

        {/* Terms */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            계속 진행하면{' '}
            <button className="underline">이용약관</button> 및{' '}
            <button className="underline">개인정보처리방침</button>에 동의하는 것으로 간주됩니다
          </p>
        </div>
      </div>
    </div>
  );
}