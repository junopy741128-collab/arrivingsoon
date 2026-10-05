import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabaseClient';
import { appLogger } from '../utils/logger';

interface ErrorReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string;
}

export function ErrorReportModal({ isOpen, onClose, userId }: ErrorReportModalProps) {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [includeLogs, setIncludeLogs] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!message.trim()) {
            setErrorMsg('내용을 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');

        try {
            // Get basic device info and logs
            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                time: new Date().toISOString(),
                logs: includeLogs ? appLogger.getLogs() : 'Logs not included by user'
            };

            const { error } = await supabase
                .from('error_logs')
                .insert([
                    {
                        user_id: userId || null,
                        error_message: message,
                        device_info: deviceInfo
                    }
                ]);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setMessage('');
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error('에러 보고 실패:', error);
            setErrorMsg('전송에 실패했습니다. 네트워크 상태를 확인해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm bg-app-secondary rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-border relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-white">버그 및 에러 신고</h2>
                </div>

                {success ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✅</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">접수 완료</h3>
                        <p className="text-text-muted text-sm">
                            소중한 의견 감사합니다.<br />
                            확인 후 신속히 조치하겠습니다.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-text-muted">
                            앱 사용 중 발생한 문제점이나 개선이 필요한 부분을 자세히 적어주세요.
                        </p>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="예: 주소 검색 시 앱이 강제로 종료됩니다."
                            className="w-full h-32 bg-app-primary border border-border rounded-xl p-4 text-white text-sm focus:border-app-accent focus:ring-1 focus:ring-app-accent resize-none placeholder-gray-600"
                        />
                        
                        <label className="flex items-center gap-2 cursor-pointer mt-2 pl-1">
                            <input 
                                type="checkbox" 
                                checked={includeLogs} 
                                onChange={(e) => setIncludeLogs(e.target.checked)} 
                                className="w-4 h-4 text-app-accent bg-gray-800 border-gray-600 rounded focus:ring-app-accent focus:ring-2" 
                            />
                            <span className="text-sm text-text-muted">디버깅을 위한 현재 시스템 로그 포함하기</span>
                        </label>

                        {errorMsg && <p className="text-status-error text-xs font-bold pl-1">{errorMsg}</p>}

                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '관리자에게 보내기'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
