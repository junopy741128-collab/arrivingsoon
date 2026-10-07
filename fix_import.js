const fs = require('fs');
let content = fs.readFileSync('src/components/SnsLogin.tsx', 'utf8');

content = content.replace(
    "import { KakaoLogin } from '@team-lepisode/capacitor-kakao-login';",
    "import { CapacitorKakaoLogin as KakaoLogin } from '@team-lepisode/capacitor-kakao-login';"
);

fs.writeFileSync('src/components/SnsLogin.tsx', content);
console.log('Fixed Kakao import!');
