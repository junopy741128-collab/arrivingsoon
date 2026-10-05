declare const sms: any; // Cordova SMS plugin

/**
 * SMS 발송 함수 (Cordova SMS Plugin 사용)
 * @param content 발송할 문자 내용
 * @param receiver 수신자 전화번호 (쉼표로 구분된 여러 번호 가능)
 */
export async function triggerSms(content: string, receiver: string): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            console.log(`[SMS] 문자 발송 요청: [${content}] -> [${receiver}]`);

            // Cordova SMS 플러그인 확인
            if (typeof sms === 'undefined') {
                console.error('[SMS] Cordova SMS 플러그인을 찾을 수 없습니다');
                resolve(false);
                return;
            }

            // 여러 번호로 전송 (쉼표로 구분)
            const phoneNumbers = receiver.split(',').map(p => p.trim()).filter(p => p);

            console.log(`[SMS] 전송할 번호: ${phoneNumbers.join(', ')}`);

            // Cordova SMS 플러그인으로 전송
            sms.send(
                phoneNumbers,  // 수신자 배열
                content,       // 메시지 내용
                {
                    replaceLineBreaks: false,
                    android: {
                        intent: '' // 기본 SMS 앱 사용 안 함, 직접 전송
                    }
                },
                (success: any) => {
                    console.log('[SMS] 전송 성공:', success);
                    resolve(true);
                },
                (error: any) => {
                    console.error('[SMS] 전송 실패:', error);
                    resolve(false);
                }
            );
        } catch (error) {
            console.error('[SMS] 오류:', error);
            resolve(false);
        }
    });
}
