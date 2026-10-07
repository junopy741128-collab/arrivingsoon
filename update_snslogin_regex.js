const fs = require('fs');
let content = fs.readFileSync('src/components/SnsLogin.tsx', 'utf8');

if (!content.includes("import { KakaoLogin } from '@team-lepisode/capacitor-kakao-login';")) {
    content = content.replace(
        "import { showAlert } from '../utils/globalAlert';",
        "import { showAlert } from '../utils/globalAlert';\nimport { KakaoLogin } from '@team-lepisode/capacitor-kakao-login';"
    );
}

if (!content.includes("KakaoLogin.initialize")) {
    content = content.replace(
        "export function SnsLogin({ onBack, onNavigate }: SnsLoginProps) {",
        "export function SnsLogin({ onBack, onNavigate }: SnsLoginProps) {\n  useEffect(() => {\n    if (Capacitor.getPlatform() === 'android') {\n      KakaoLogin.initialize({ appKey: '29e58998be931737658cd80da3a6ce41' }).catch(console.error);\n    }\n  }, []);"
    );
}

const pattern = /const handleSnsLogin = async \(\s*provider\s*:\s*'google'\s*\|\s*'kakao'\s*\)\s*=>\s*\{[\s\S]*?(?=\} catch \(error\))/;

const newHandleLogic = `const handleSnsLogin = async (provider: 'google' | 'kakao') => {
    console.log(\`[SnsLogin] \${provider} Login requested\`);
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
    `;

content = content.replace(pattern, newHandleLogic);
fs.writeFileSync('src/components/SnsLogin.tsx', content);
console.log('Updated handleSnsLogin for Native Kakao!');
