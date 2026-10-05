import { useState, useEffect } from 'react';
import { isOneStore } from '../config/storeConfig';
import { supabase } from '../lib/supabaseClient';

declare global {
    interface Window {
        IMP: any;
    }
}

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function SubscriptionModal({ isOpen, onClose, onSuccess }: SubscriptionModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Initialize PortOne if OneStore
        if (isOneStore() && window.IMP) {
            // Replace 'imp00000000' with your actual Merchant ID
            window.IMP.init('imp00000000');
        }
    }, []);

    const handlePayment = async () => {
        setIsLoading(true);

        if (isOneStore()) {
            // --- OneStore (PortOne) Payment ---
            if (!window.IMP) {
                alert('결제 모듈이 로드되지 않았습니다.');
                setIsLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            window.IMP.request_pay({
                pg: 'danal', // or 'html5_inicis'
                pay_method: 'card',
                merchant_uid: `mid_${new Date().getTime()}`,
                name: '월간 구독 (9,000원)',
                amount: 9000,
                buyer_email: user?.email,
                buyer_name: user?.user_metadata?.full_name,
                m_redirect_url: 'com.soon.arrival://payment-callback', // Mobile redirect
            }, async (rsp: any) => {
                if (rsp.success) {
                    // Verify payment on server-side ideally, but for now:
                    await updateUserSubscription(user?.id!);
                    alert('결제가 완료되었습니다.');
                    onSuccess();
                    onClose();
                } else {
                    alert(`결제 실패: ${rsp.error_msg}`);
                }
                setIsLoading(false);
            });
        } else {
            // --- Google Play IAP (Placeholder) ---
            alert('구글 플레이 인앱 결제는 추후 지원 예정입니다.');
            // TODO: Implement Google IAP here
            setIsLoading(false);
        }
    };

    const updateUserSubscription = async (userId: string) => {
        // Update profile table
        const { error } = await supabase
            .from('profiles')
            .update({ is_subscribed: true })
            .eq('id', userId);

        if (error) console.error('Subscription update failed:', error);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-sm shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white"> 프리미엄 구독</h2>
                <div className="space-y-2 mb-6 text-gray-600 dark:text-gray-300">
                    <p>✅ 무제한 알림 설정</p>
                    <p>✅ 광고 제거</p>
                    <p>✅ 우선 기술 지원</p>
                    <div className="mt-4 text-2xl font-bold text-app-accent">₩9,000 / 월</div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                    >
                        취소
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="flex-1 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isLoading ? '처리 중...' : '구독하기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
