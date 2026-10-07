const fs = require('fs');
let content = fs.readFileSync('src/components/SnsLogin.tsx', 'utf8');

if (!content.includes("import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';")) {
    content = content.replace(
        "import { CapacitorKakaoLogin as KakaoLogin } from '@team-lepisode/capacitor-kakao-login';",
        "import { CapacitorKakaoLogin as KakaoLogin } from '@team-lepisode/capacitor-kakao-login';\nimport { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';"
    );
}

// Ensure GoogleAuth is initialized alongside KakaoLogin
if (!content.includes("GoogleAuth.initialize")) {
    content = content.replace(
        "KakaoLogin.initialize({ appKey: '29e58998be931737658cd80da3a6ce41' }).catch(console.error);",
        "KakaoLogin.initialize({ appKey: '29e58998be931737658cd80da3a6ce41' }).catch(console.error);\n      GoogleAuth.initialize().catch(console.error);"
    );
}

// Update handleSnsLogin logic
const pattern = /if\s*\(provider === 'kakao'\s*&&\s*isNative\)\s*\{[\s\S]*?(?=\/\/ 구글 웹\/네이티브 로그인 및 카카오 웹 로그인 처리 로직)/;

const newHandleLogic = 
      if (isNative) {
        if (provider === 'kakao') {
          console.log('[Kakao Native] Starting native login flow...');
          const result = await KakaoLogin.login();
          if (!result.idToken) throw new Error('idToken을 받지 못했습니다.');

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'kakao',
            token: result.idToken,
          });

          if (error) throw error;
          if (data.session) setAuthToken(data.session.access_token);
          return;
        } 
        
        if (provider === 'google') {
          console.log('[Google Native] Starting native login flow...');
          const user = await GoogleAuth.signIn();
          if (!user.authentication.idToken) throw new Error('Google idToken을 받지 못했습니다.');

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: user.authentication.idToken,
          });

          if (error) throw error;
          if (data.session) setAuthToken(data.session.access_token);
          return;
        }
      }

      ;

content = content.replace(pattern, newHandleLogic);
fs.writeFileSync('src/components/SnsLogin.tsx', content);
console.log('Updated handleSnsLogin for Native Google!');
