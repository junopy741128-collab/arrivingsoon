import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.soon.arrival',
    appName: '곧 도착해요',
    webDir: 'build',
    backgroundColor: '#0B1C16',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '278438361150-fmhf0fvq38o9n4sl9fte2i1katthq3iv.apps.googleusercontent.com',
            forceCodeForRefreshToken: true
        }
    },
    android: {
        loggingBehavior: 'none'
    }
};

export default config;
