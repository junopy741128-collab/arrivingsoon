import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Settings, User, AlertTriangle, SlidersHorizontal, Plus, ArrowLeft, ArrowRight, Play, X, ShieldAlert } from 'lucide-react';
import { QuickSendPreset } from '../types/quickSend';
import { SmsService } from '../services/SmsService';

interface QuickSendPageProps {
    onBack: () => void;
    onNavigateSettings: () => void;
    presets: QuickSendPreset[];
    onOpenAddModal: () => void;
    countdownEnabled: boolean;
}

export const QuickSendPage: React.FC<QuickSendPageProps> = ({
    onBack,
    onNavigateSettings,
    presets,
    onOpenAddModal,
    countdownEnabled
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const timerRef = useRef<any>(null);

    // Safeguard current index bounds
    useEffect(() => {
        if (presets.length === 0) {
            setCurrentIndex(0);
        } else if (currentIndex >= presets.length) {
            setCurrentIndex(presets.length - 1);
        }
    }, [presets.length, currentIndex]);

    const activePreset = presets[currentIndex] || null;

    const handlePrev = () => {
        if (countdown !== null) handleCancelCountdown();
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : presets.length - 1));
    };

    const handleNext = () => {
        if (countdown !== null) handleCancelCountdown();
        setCurrentIndex(prev => (prev < presets.length - 1 ? prev + 1 : 0));
    };

    const handleCancelCountdown = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setCountdown(null);
        setStatusMessage('⚠️ 전송이 취소되었습니다.');
        setTimeout(() => setStatusMessage(null), 2000);
    };

    const executeSend = async (preset: QuickSendPreset) => {
        setIsSending(true);
        setStatusMessage('문자 전송 중...');

        let successCount = 0;
        let failCount = 0;

        for (const recipient of preset.recipients) {
            try {
                const res = await SmsService.sendSms({
                    recipient: recipient.phone,
                    message: preset.message
                });
                if (res.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                console.error('[QuickSend] Error sending to', recipient.phone, err);
                failCount++;
            }
        }

        setIsSending(false);
        setCountdown(null);

        if (failCount === 0) {
            setStatusMessage(`✅ 전송 완료! (${successCount}건 발송)`);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
            setStatusMessage(`⚠️ ${successCount}건 전송 성공, ${failCount}건 실패`);
        }

        setTimeout(() => setStatusMessage(null), 3000);
    };

    const handleStartSend = () => {
        if (!activePreset) return;

        if (!countdownEnabled) {
            executeSend(activePreset);
            return;
        }

        // Start 3 second countdown
        setCountdown(3);
        if (navigator.vibrate) navigator.vibrate(50);

        let count = 3;
        timerRef.current = setInterval(() => {
            count -= 1;
            if (count > 0) {
                setCountdown(count);
                if (navigator.vibrate) navigator.vibrate(40);
            } else {
                clearInterval(timerRef.current);
                timerRef.current = null;
                executeSend(activePreset);
            }
        }, 1000);
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const getCategoryBadgeClass = (cat: string) => {
        switch (cat) {
            case '가족':
                return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40';
            case '업무':
                return 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40';
            case '그룹':
                return 'bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/40';
            default:
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0F1715] text-white font-sans pb-28 select-none">
            {/* Header */}
            <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/5">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white tracking-tight">원터치 빠른 전송</h1>
                    <span className="text-[10px] bg-[#B45309]/30 text-[#FCD34D] border border-[#B45309]/50 px-1.5 py-0.5 rounded font-bold">
                        안전 모드
                    </span>
                    <span className="text-[10px] bg-[#00E57D]/20 text-[#00E57D] border border-[#00E57D]/40 px-1.5 py-0.5 rounded font-bold">
                        무료
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNavigateSettings}
                        className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </header>

            {/* Top Safety Banner */}
            <div className="mx-5 mt-4 p-3.5 bg-[#182622] border border-[#243B33] rounded-2xl flex items-center justify-between">
                <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <div className="font-bold text-amber-300">1장씩 넘겨서 정확한 대상에게 전송하세요</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">
                            {countdownEnabled ? '오발송 방지 3초 취소 안전망 작동 중' : '즉시 전송 모드 (무료 문자)'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onNavigateSettings}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#20362E] hover:bg-[#2A483E] text-gray-300 text-xs font-semibold rounded-xl border border-[#2E4E42] shrink-0"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    관리
                </button>
            </div>

            {/* Status Feedback Toast */}
            {statusMessage && (
                <div className="mx-5 mt-3 py-2.5 px-4 bg-emerald-500 text-black font-bold text-xs rounded-xl shadow-lg text-center animate-bounce">
                    {statusMessage}
                </div>
            )}

            {/* Pagination / Focus Mode Info */}
            <div className="mx-5 mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#00E57D]">
                        {presets.length > 0 ? `${currentIndex + 1} / ${presets.length}` : '0 / 0'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">단일 카드 집중 모드</span>
                </div>
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                    {presets.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                                i === currentIndex
                                    ? 'w-6 bg-[#00E57D]'
                                    : 'w-1.5 bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Center Focused Card */}
            <main className="flex-1 mx-5 mt-3 flex flex-col justify-center">
                {activePreset ? (
                    <div className="bg-[#14241F] border-2 border-[#00E57D]/40 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[380px]">
                        <div>
                            {/* Card Top: Category and Hook Label */}
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadgeClass(activePreset.category)}`}>
                                    {activePreset.category}
                                </span>
                                <span className="text-xs text-[#00E57D] font-medium flex items-center gap-1">
                                    🪝 원터치 발송 대상
                                </span>
                            </div>

                            {/* Recipient Name and Phone */}
                            <div className="mb-4">
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-baseline gap-2 flex-wrap">
                                    {activePreset.title}
                                    <span className="text-sm font-normal text-gray-400">
                                        {activePreset.recipients.length === 1
                                            ? activePreset.recipients[0].phone
                                            : `(총 ${activePreset.recipients.length}명)`}
                                    </span>
                                </h2>
                            </div>

                            {/* Inner Recessed Box: Message Text */}
                            <div className="bg-[#0B1512] border border-[#1E362C] rounded-2xl p-5 mb-5 shadow-inner">
                                <div className="text-[11px] font-semibold text-gray-400 mb-2">
                                    전송될 메시지 내용
                                </div>
                                <div className="text-lg font-bold text-white leading-relaxed break-keep">
                                    “{activePreset.message}”
                                </div>
                            </div>
                        </div>

                        {/* Action Area: Countdown or Ready Button */}
                        <div>
                            <div className="text-[11px] text-gray-400 text-center mb-2.5 flex items-center justify-center gap-1">
                                {countdownEnabled ? (
                                    <>
                                        <span>🔒</span> 버튼 탭 시 오발송 방지{' '}
                                        <strong className="text-amber-400">3초 카운트다운</strong> 후 전송
                                    </>
                                ) : (
                                    <>
                                        <span>⚡</span> 버튼 탭 시 내 폰 무료 문자로 즉시 전송
                                    </>
                                )}
                            </div>

                            {/* Main Send Button */}
                            {countdown !== null ? (
                                <button
                                    onClick={handleCancelCountdown}
                                    className="w-full h-16 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all animate-pulse"
                                >
                                    <X className="w-6 h-6" />
                                    <span>{countdown}초 후 전송... (탭하여 취소)</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartSend}
                                    disabled={isSending}
                                    className="w-full h-16 bg-[#00E57D] hover:bg-[#00C56A] active:scale-95 text-black font-black text-lg rounded-2xl shadow-[0_4px_25px_rgba(0,229,125,0.4)] flex items-center justify-center gap-3 transition-all"
                                >
                                    <Play className="w-6 h-6 fill-black" />
                                    <span>
                                        {countdownEnabled ? '즉시 전송 (3초 취소 안전망)' : '즉시 전송하기'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#14241F] border border-[#1E362C] rounded-3xl p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                        <p className="text-gray-400 text-sm mb-4">등록된 빠른 문자가 없습니다.</p>
                        <button
                            onClick={onOpenAddModal}
                            className="px-5 py-3 bg-[#00E57D] text-black font-bold text-sm rounded-xl"
                        >
                            + 새 빠른 문자 등록하기
                        </button>
                    </div>
                )}
            </main>

            {/* Navigation Buttons: Previous / Next Card */}
            {presets.length > 1 && (
                <div className="mx-5 mt-4 grid grid-cols-2 gap-3">
                    <button
                        onClick={handlePrev}
                        className="h-13 bg-[#182822] hover:bg-[#20362E] active:scale-95 border border-[#243B33] text-gray-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md py-3.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        이전 문자
                    </button>
                    <button
                        onClick={handleNext}
                        className="h-13 bg-[#182822] hover:bg-[#20362E] active:scale-95 border border-[#243B33] text-gray-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md py-3.5"
                    >
                        다음 문자
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Bottom Add Shortcut */}
            <div className="mx-5 mt-3 text-center">
                <button
                    onClick={onOpenAddModal}
                    className="w-full py-3 text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                    <Plus className="w-4 h-4 text-[#00E57D]" />
                    새 빠른 문자 등록하기
                </button>
            </div>
        </div>
    );
};
