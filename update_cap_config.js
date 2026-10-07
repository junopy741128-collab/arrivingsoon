const fs = require('fs');
let content = fs.readFileSync('capacitor.config.ts', 'utf8');

const pluginsConfig = `    plugins: {
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '278438361150-fmhf0fvq38o9n4sl9fte2i1katthq3iv.apps.googleusercontent.com',
            forceCodeForRefreshToken: true
        }
    },
    android: {`;

content = content.replace("    android: {", pluginsConfig);
fs.writeFileSync('capacitor.config.ts', content);
console.log('Updated capacitor.config.ts');
