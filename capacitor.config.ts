import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.soon.arrival',
    appName: '곧 도착해요',
    webDir: 'build',
    backgroundColor: '#0B1C16',
    server: {
        androidScheme: 'https'
    },
    android: {
        loggingBehavior: 'none'
    }
};

export default config;
