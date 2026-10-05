
import { useEffect } from 'react';
import { Trip } from '../App';
import { CheckCircle2, MessageCircle, Coins, MapPin } from 'lucide-react';
import { Button } from './ui/button';

interface TripCompletionModalProps {
    isOpen: boolean;
    trip: Trip;
    pointsDeducted: number;
    completedAtStr?: string; // [Fix] 도착 트리거 발생 시각 (네이티브 서비스에서 전달)
    onConfirm: () => void;
}

export function TripCompletionModal({ isOpen, trip, pointsDeducted, completedAtStr, onConfirm }: TripCompletionModalProps) {
    if (!isOpen) return null;

    // Prevent back button from closing modal unexpectedly
    useEffect(() => {
        const handleBack = (e: PopStateEvent) => {
            e.preventDefault();
            // Do nothing, force user to click Confirm
        };
        window.addEventListener('popstate', handleBack);
        return () => window.removeEventListener('popstate', handleBack);
    }, []);

    return (
        <div className="fixed inset-0 z-[9999] bg-background-light dark:bg-[#0D1612] flex flex-col items-center animate-in fade-in duration-300">

            {/* Header Section */}
            <div className="w-full max-w-md px-6 pt-14 pb-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-[#00FF88]" />
                </div>
                <h1 className="text-2xl font-bold mb-3 tracking-tight text-slate-900 dark:text-slate-100">
                    서비스가 종료되었습니다
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    도착 알림 예약 서비스가<br />정상적으로 완료되었습니다.
                </p>
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-md px-6 space-y-4 overflow-y-auto">

                {/* Arrival Details Card */}
                <div className="bg-white dark:bg-[#16221B] p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">도착 일시</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                {(() => {
                                    const raw = completedAtStr || trip.completedAt || '';
                                    if (!raw) return '도착 완료';
                                    // ISO 형식(2026-04-26T23:14:00)이면 파싱하여 한국식으로 변환
                                    try {
                                        const d = new Date(raw);
                                        if (!isNaN(d.getTime())) {
                                            return d.toLocaleString('ko-KR', {
                                                year: 'numeric', month: '2-digit', day: '2-digit',
                                                hour: '2-digit', minute: '2-digit', hour12: false
                                            });
                                        }
                                    } catch {}
                                    return raw; // 이미 포맷된 문자열이면 그대로
                                })()}
                            </span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">출발지 주소</p>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                                <p className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-snug">
                                    {trip.startPoint || '출발지 정보 없음'}
                                </p>
                            </div>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-white/5 w-full" />
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">목적지 주소</p>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-[#FF3B30] shrink-0" />
                                <p className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-snug">
                                    {trip.destination}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SMS History Card */}
                <div className="bg-white dark:bg-[#16221B] p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">문자 전송 내역</span>
                        </div>
                        <span className="text-[#00FF88] font-bold text-xl">{trip.enableDeparture ? '2건' : '1건'}</span>
                    </div>

                    <div className="space-y-3 px-1">
                        {trip.enableDeparture && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 dark:text-slate-400">출발 알림 문자</span>
                                <span className="text-[#00FF88] font-medium">전송 완료</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">도착 알림 문자</span>
                            <span className="text-[#00FF88] font-medium">전송 완료</span>
                        </div>
                    </div>
                </div>

                {/* Point Deduction Card */}
                <div className="bg-white dark:bg-[#16221B] p-6 rounded-[24px] border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                                <Coins className="w-5 h-5 text-amber-500" />
                            </div>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">포인트 차감 내역</span>
                        </div>
                        <span className="text-red-500 dark:text-red-400 font-bold text-xl">-{pointsDeducted}P</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center px-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">결제 방식</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">후결제 (전송 성공 시)</span>
                    </div>
                </div>

                <div className="py-6 text-center">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                        상세 이용 내역은 하단 메뉴의 <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4">[내역보기]</span>에서<br />
                        언제든지 확인하실 수 있습니다.
                    </p>
                </div>
            </main>

            {/* Footer / Buttons */}
            <footer className="w-full max-w-md px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex flex-col gap-3">
                <Button
                    onClick={onConfirm}
                    className="w-full h-16 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0D1612] font-bold text-lg rounded-[20px] shadow-lg shadow-[#00FF88]/20 active:scale-[0.98] transition-all"
                >
                    확인
                </Button>
            </footer>
        </div>
    );
}
