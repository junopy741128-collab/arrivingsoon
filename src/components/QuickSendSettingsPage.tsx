import React from 'react';
import { ChevronLeft, MoreVertical, User, Zap, Plus, GripVertical, Edit3, Trash2, Shield, MessageSquare } from 'lucide-react';
import { QuickSendPreset } from '../types/quickSend';

interface QuickSendSettingsPageProps {
    onBack: () => void;
    presets: QuickSendPreset[];
    onOpenAddModal: () => void;
    onEditPreset: (preset: QuickSendPreset) => void;
    onDeletePreset: (id: string) => void;
    countdownEnabled: boolean;
    onToggleCountdown: (val: boolean) => void;
}

export const QuickSendSettingsPage: React.FC<QuickSendSettingsPageProps> = ({
    onBack,
    presets,
    onOpenAddModal,
    onEditPreset,
    onDeletePreset,
    countdownEnabled,
    onToggleCountdown
}) => {
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
        <div className="flex flex-col min-h-screen bg-[#0F1715] text-white font-sans select-none overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
            {/* Header with Safe Area padding */}
            <header className="pt-safe mt-2 px-5 pb-3 flex items-center justify-between border-b border-white/5 shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-white tracking-tight">Quick Send Settings</h1>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <User className="w-4 h-4" />
                    </div>
                </div>
            </header>

            <div className="flex-1 px-5 py-4 space-y-4">
                {/* Top Status Card */}
                <div className="bg-[#14241F] border border-[#20392F] rounded-2xl p-4 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-full bg-[#00E57D]/20 border border-[#00E57D]/40 flex items-center justify-center text-[#00E57D]">
                            <Zap className="w-5 h-5 fill-[#00E57D]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-white">원터치 신속 알림</h2>
                                <span className="text-[11px] font-semibold text-[#00E57D] bg-[#00E57D]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E57D]"></span>
                                    {presets.length}개 활성
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                                주행 중 시선 분산 없는 즉각 전송 관리
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add Preset Big Button */}
                <button
                    onClick={onOpenAddModal}
                    className="w-full h-14 bg-[#00E57D] hover:bg-[#00C56A] active:scale-95 text-black font-extrabold text-base rounded-2xl shadow-[0_4px_20px_rgba(0,229,125,0.3)] flex items-center justify-center gap-2 transition-all"
                >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>+ 새 빠른 문자 등록</span>
                </button>

                {/* Presets List Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                            문구 프리셋 목록
                            <span className="text-xs font-normal text-gray-400">(등록된 순서대로 표시)</span>
                        </h3>
                        <span className="text-xs font-bold text-[#00E57D]">편집 모드 ON</span>
                    </div>

                    <div className="space-y-3">
                        {presets.map((preset) => (
                            <div
                                key={preset.id}
                                className="bg-[#14241F] border border-[#20392F] rounded-2xl p-4 shadow-md space-y-3"
                            >
                                {/* Item Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <GripVertical className="w-4 h-4 text-gray-500 shrink-0" />
                                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${getCategoryBadgeClass(preset.category)}`}>
                                            {preset.category}
                                        </span>
                                        <span className="text-sm font-bold text-white truncate">
                                            {preset.title}
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => onEditPreset(preset)}
                                            className="px-2.5 py-1.5 bg-[#1B3229] hover:bg-[#254438] text-[#00E57D] text-xs font-semibold rounded-lg border border-[#254438] flex items-center gap-1 active:scale-95 transition-all"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            수정
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`'${preset.title}' 빠른 문자를 삭제하시겠습니까?`)) {
                                                    onDeletePreset(preset.id);
                                                }
                                            }}
                                            className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 flex items-center gap-1 active:scale-95 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            삭제
                                        </button>
                                    </div>
                                </div>

                                {/* Item Message Preview */}
                                <div className="bg-[#0B1512] border border-[#182C24] rounded-xl px-3.5 py-2.5 flex items-start gap-2.5">
                                    <MessageSquare className="w-4 h-4 text-[#00E57D] shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-300 leading-snug line-clamp-2">
                                        {preset.message}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {presets.length === 0 && (
                            <div className="text-center py-10 bg-[#14241F]/60 border border-[#20392F]/50 rounded-2xl p-6 text-gray-400 text-xs space-y-2">
                                <div>등록된 빠른 문자가 없습니다.</div>
                                <div className="text-gray-500 text-[11px]">상단의 [+ 새 빠른 문자 등록] 버튼을 눌러 추가해보세요.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Safety Guardian Settings Card */}
                <div className="bg-[#14241F] border border-[#20392F] rounded-2xl p-4 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-[#00E57D]" />
                        <h4 className="text-xs font-bold text-gray-300 tracking-wider">
                            안전 전송 가디언 설정
                        </h4>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-white">
                                오발송 방지 3초 카운트다운
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                                터치 직후 3초 내 실행 취소 기회 제공
                            </div>
                        </div>

                        {/* Toggle switch */}
                        <button
                            type="button"
                            onClick={() => onToggleCountdown(!countdownEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 focus:outline-none ${
                                countdownEnabled ? 'bg-[#00E57D]' : 'bg-gray-700'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                                    countdownEnabled ? 'translate-x-6' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Free Notice Box */}
                <div className="p-3.5 bg-[#0B1512] border border-[#182C24] rounded-xl text-[11px] text-gray-400 flex items-center gap-2">
                    <span className="text-[#00E57D] font-bold shrink-0">무료 안내:</span>
                    <span>이 기능은 본인 스마트폰 통신사 기본 무료 문자로 발송되므로 앱 이용료가 전혀 발생하지 않습니다.</span>
                </div>
            </div>
        </div>
    );
};
