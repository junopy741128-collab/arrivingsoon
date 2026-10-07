const fs = require('fs');
let content = fs.readFileSync('src/lib/supabaseUtils.ts', 'utf8');

// Update trim limit from 40 to 50
content = content.replace(
    /Keep only 40 items/g,
    'Keep only 50 items'
);
content = content.replace(
    /historyDetails\.length > 40/g,
    'historyDetails.length > 50'
);
content = content.replace(
    /historyDetails\.slice\(40\)/g,
    'historyDetails.slice(50)'
);

fs.writeFileSync('src/lib/supabaseUtils.ts', content);
console.log('Updated supabaseUtils.ts');
