const fs = require('fs');
let content = fs.readFileSync('src/components/PermissionGuide.tsx', 'utf8');

const stateDecl = "const [step, setStep] = useState<'intro' | 'requesting' | 'denied'>('intro');";
if (content.includes(stateDecl) && !content.includes("const [hasOpenedSettings, setHasOpenedSettings] = useState(false);")) {
    content = content.replace(stateDecl, stateDecl + "\n    const [hasOpenedSettings, setHasOpenedSettings] = useState(false);");
    fs.writeFileSync('src/components/PermissionGuide.tsx', content);
    console.log('Fixed hasOpenedSettings definition!');
} else {
    console.log('Could not find stateDecl');
}
