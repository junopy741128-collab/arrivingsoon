const fs = require('fs');
let content = fs.readFileSync('src/components/PermissionGuide.tsx', 'utf8');

const oldDeniedStart = "if (step === 'denied') {";
const oldDeniedEnd = "return (\n        <div className=\"fixed inset-0 z-[99999] bg-white flex flex-col font-sans\">";

const startIdx = content.indexOf(oldDeniedStart);
const endIdx = content.indexOf(oldDeniedEnd);

if (startIdx !== -1 && endIdx !== -1) {
    const newDeniedUI = `if (step === 'denied') {
        const handleOpenSettings = async () => {
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">SMS 권한 허용 안내</h2>
                    <p className="text-gray-600 text-sm">
                        예약 문자를 발송하기 위해 <strong className="text-gray-900">SMS 필수 권한</strong>이 필요합니다.<br/>
                        권한이 거부되어 정상적인 앱 사용이 어렵습니다.
                    </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4 text-center">🛠 권한 설정 방법</h3>
                    
                    <ol className="text-sm text-gray-700 space-y-4 list-decimal pl-4 marker:text-[#00E57D] marker:font-bold">
                        <li>아래 <strong>[앱 설정 화면으로 이동]</strong> 버튼을 누릅니다.</li>
                        <li>화면에서 <strong>[권한]</strong> 메뉴에 들어갑니다.</li>
                        <li><strong>[SMS]</strong>를 찾아 <strong>[허용]</strong>으로 직접 변경합니다.</li>
                        <li>다시 이 앱으로 돌아와서 <strong>[다시 시도하기]</strong>를 눌러주세요.</li>
                    </ol>

                    <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs text-gray-500">
                        <strong>💡 참고:</strong> 최신 안드로이드 기기에서 만약 SMS 권한 메뉴가 비활성화되어 있다면, 앱 정보 우측 상단의 <strong>점 3개(⋮) 메뉴</strong>를 눌러 <strong>[제한된 설정 허용]</strong>을 먼저 누른 후 진행해 주세요.
                    </div>
                </div>

                <div className="mt-auto space-y-3 pb-8">
                    <button
                        onClick={handleOpenSettings}
                        className="w-full py-4 bg-[#00E57D] hover:bg-[#00C56A] text-black rounded-xl font-bold text-lg shadow-lg transition-colors"
                    >
                        앱 설정 화면으로 이동
                    </button>
                    <button
                        onClick={requestAllPermissions}
                        className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg transition-colors"
                    >
                        다시 시도하기
                    </button>
                </div>
            </div>
        );
    }

    `;
    content = content.slice(0, startIdx) + newDeniedUI + content.slice(endIdx);
    fs.writeFileSync('src/components/PermissionGuide.tsx', content);
    console.log('Replaced PermissionGuide UI successfully');
} else {
    console.log('Could not find the bounds');
}
