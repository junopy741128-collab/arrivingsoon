# 📱 Android 앱 아이콘 설정

## 아이콘 이미지 준비

### 필요한 크기
Android에서는 여러 해상도의 아이콘이 필요합니다:

- **mipmap-mdpi**: 48x48px
- **mipmap-hdpi**: 72x72px
- **mipmap-xhdpi**: 96x96px
- **mipmap-xxhdpi**: 144x144px
- **mipmap-xxxhdpi**: 192x192px
- **Google Play**: 512x512px (출시용)

### 자동 생성 도구

**추천: Android Asset Studio**
- https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- 1024x1024 이미지 업로드하면 모든 크기 자동 생성

### 아이콘 디자인 가이드

**현재 앱 컬러:**
- 배경: #0f2920 (어두운 녹색)
- 강조: #00ff88 (밝은 녹색)

**아이콘 아이디어:**
1. 자동차 + 알림 벨 조합
2. 위치 핀 + 메시지 아이콘
3. 네비게이션 화살표 + 알림

### 배치 방법

생성된 아이콘을 다음 폴더에 복사:
```
android/app/src/main/res/
  ├── mipmap-mdpi/ic_launcher.png
  ├── mipmap-hdpi/ic_launcher.png
  ├── mipmap-xhdpi/ic_launcher.png
  ├── mipmap-xxhdpi/ic_launcher.png
  └── mipmap-xxxhdpi/ic_launcher.png
```

### 간단한 방법

1024x1024 PNG 이미지만 준비하면:
```bash
npx @capacitor/assets generate --android
```

자동으로 모든 크기 생성됩니다!
