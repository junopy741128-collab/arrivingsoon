const fs = require('fs');
let content = fs.readFileSync('src/components/PermissionGuide.tsx', 'utf8');

// We need to find where the `step` state is declared, and add `hasOpenedSettings` state right after it.
const stateDecl = "const [step, setStep] = useState<'initial' | 'denied'>('initial');";
if (content.includes(stateDecl) && !content.includes("const [hasOpenedSettings, setHasOpenedSettings] = useState")) {
    content = content.replace(stateDecl, stateDecl + "\n    const [hasOpenedSettings, setHasOpenedSettings] = useState(false);");
}

const newUI = `if (step === 'denied') {
        const handleOpenSettings = async () => {
            setHasOpenedSettings(true);
            try {
                const { NativeSettings, AndroidSettings } = await import('capacitor-native-settings');
                await NativeSettings.openAndroid({
                    option: AndroidSettings.ApplicationDetails,
                });
            } catch (error) {
                console.error('설정 열기 실패:', error);
                alert('설정 화면을 열 수 없습니다. 직접 기기 설정 앱에서 [애플리케이션] - [곧도착해요]를 찾아주세요.');
            }
        };

        return (
            <div className="fixed inset-0 z-[99999] bg-white flex flex-col p-6 overflow-y-auto">
                <div className="flex flex-col items-center text-center mt-8 mb-6">
                    <div className="w-16 h-16 bg-[#00E57D]/20 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-[#00E57D]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">SMS 권한 설정 안내</h2>
                    <p className="text-gray-600 text-sm">
                        예약 문자를 발송하기 위해 <strong className="text-gray-900">SMS 필수 권한</strong>이 필요합니다.
                    </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-center">🛠 권한 설정 방법</h3>
                    
                    {!hasOpenedSettings ? (
                        <>
                            {/* CSS Mockup 1 (Restricted Settings) */}
                            <div className="w-full bg-[#f2f2f2] rounded-xl mb-4 py-4 flex flex-col relative overflow-hidden border border-gray-200 shadow-sm pointer-events-none">
                                <div className="flex items-center w-full justify-between px-4 mb-3">
                                    <div className="text-[15px] font-bold text-black tracking-tight flex items-center gap-1">
                                        <span className="text-gray-400 font-light mr-1 text-lg">&lt;</span> 애플리케이션 정..
                                    </div>
                                    <div className="text-gray-500 font-bold text-lg leading-none">⋮</div>
                                </div>
                                <div className="absolute top-2 right-2 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-4 py-3 flex items-center justify-center z-10 animate-bounce">
                                    <span className="text-black font-bold text-[15px] tracking-tight text-red-500">☝️ 제한된 설정 허용</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 text-center mb-2">1. 우측 상단 <strong>점 3개(⋮)</strong>를 눌러 허용해주세요.</p>
                            <p className="text-sm text-gray-700 text-center text-gray-400 mb-6">(점 3개가 안 보이면 다음으로 넘어갑니다)</p>
                            
                            {/* CSS Mockup 2 (SMS Permission) */}
                            <div className="w-full bg-[#f2f2f2] rounded-xl mb-2 py-4 px-4 flex flex-col border border-gray-200 shadow-sm pointer-events-none">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[16px] font-bold text-black tracking-tight">SMS 액세스 권한</span>
                                </div>
                                <div className="bg-white rounded-2xl w-full flex flex-col px-4 border border-gray-100">
                                    <div className="flex items-center gap-4 py-2.5">
                                        <div className="w-[18px] h-[18px] rounded-full border-[5px] border-[#1a73e8] bg-white shrink-0"></div>
                                        <span className="text-black text-[15px] font-bold text-[#1a73e8]">허용</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 text-center">2. <strong>[권한]</strong> 메뉴에서 <strong>[SMS]</strong>를 <strong>[허용]</strong>으로 바꿉니다.</p>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📱</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">권한 설정을 완료하셨나요?</h3>
                            <p className="text-gray-600 text-sm">설정에서 SMS 권한을 [허용]으로 변경하셨다면,<br/>아래 [다시 시도하기] 버튼을 눌러주세요.</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto space-y-3 pb-8">
                    {!hasOpenedSettings && (
                        <button
                            onClick={handleOpenSettings}
                            className="w-full py-4 bg-[#00E57D] hover:bg-[#00C56A] text-black rounded-xl font-bold text-lg shadow-lg transition-colors"
                        >
                            앱 설정 화면으로 이동
                        </button>
                    )}
                    
                    {(hasOpenedSettings || true) && (
                        <button
                            onClick={requestAllPermissions}
                            className={\`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-colors \${hasOpenedSettings ? 'bg-[#00E57D] text-black' : 'bg-gray-800 text-white'}\`}
                        >
                            다시 시도하기
                        </button>
                    )}
                </div>
            </div>
        );
    }
`;

const pattern = /if\s*\(step === 'denied'\)\s*\{[\s\S]*?(?=return\s*\(\s*<div className="fixed inset-0 z-\[99999\] bg-white flex flex-col font-sans">)/;

content = content.replace(pattern, newUI);
fs.writeFileSync('src/components/PermissionGuide.tsx', content);
console.log('Replaced correctly!');
