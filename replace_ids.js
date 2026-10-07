const fs = require('fs');
let content = fs.readFileSync('src/components/MyPage.tsx', 'utf8');

content = content.replace(/'0001007230'/g, "'point_1000'");
content = content.replace(/'0001007231'/g, "'point_3000'");
content = content.replace(/'0001007232'/g, "'point_5000'");

fs.writeFileSync('src/components/MyPage.tsx', content);
console.log('Replaced Product IDs to point_1000, point_3000, point_5000 successfully');
