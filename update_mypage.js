const fs = require('fs');
let content = fs.readFileSync('src/components/MyPage.tsx', 'utf8');

// Update visibleCount default
content = content.replace(
    'const [visibleCount, setVisibleCount] = useState(10);',
    'const [visibleCount, setVisibleCount] = useState(5);'
);

// Update handleLoadMore step
content = content.replace(
    'setVisibleCount(prev => prev + 10);',
    'setVisibleCount(prev => prev + 5);'
);

fs.writeFileSync('src/components/MyPage.tsx', content);
console.log('Updated MyPage.tsx');
