import { useState, useEffect } from 'react';
import { Smartphone, Code, Zap, CheckCircle } from 'lucide-react';
import { isNative, getPlatform, getAppInfo } from '../utils/capacitor-plugins';

export function AppInfo() {
  const [platform, setPlatform] = useState<string>('');
  const [version, setVersion] = useState<string>('');
  const [isApp, setIsApp] = useState<boolean>(false);

  useEffect(() => {
    const loadInfo = async () => {
      setIsApp(isNative());
      setPlatform(getPlatform());
      const info = await getAppInfo();
      setVersion(info.version);
    };
    loadInfo();
  }, []);

  return (
    <div className="bg-[#1a3d32] rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-[#00ff88]" />
        <h2 className="text-lg text-white">앱 정보</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">환경</span>
          <div className="flex items-center gap-2">
            {isApp ? (
              <>
                <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                <span className="text-white">네이티브 앱</span>
              </>
            ) : (
              <>
                <Code className="w-4 h-4 text-blue-400" />
                <span className="text-white">웹 브라우저</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">플랫폼</span>
          <span className="text-white capitalize">{platform}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">버전</span>
          <span className="text-white">{version}</span>
        </div>

        {isApp && (
          <div className="pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-[#00ff88]">
              <Zap className="w-4 h-4" />
              <span className="text-sm">모든 네이티브 기능 사용 가능</span>
            </div>
          </div>
        )}

        {!isApp && (
          <div className="pt-3 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              💡 Android 앱으로 변환하면 더 많은 기능을 사용할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
