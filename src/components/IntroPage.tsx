import { useState, useRef, useEffect } from 'react';
import { Screen } from '../App';
import { ShieldCheck, MessageSquare, MapPin, Clock, ArrowRight, Navigation, CheckCircle2, Car } from 'lucide-react';

interface IntroPageProps {
    onNavigate: (screen: Screen) => void;
}

export function IntroPage({ onNavigate }: IntroPageProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 슬라이드 데이터
    const slides = [
        {
            id: 1,
            content: (
                <div className="flex flex-col h-full justify-center px-6">
                    <div className="w-14 h-14 bg-app-accent/20 text-app-accent rounded-2xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-7 h-7 fill-current" />
                    </div>
                    <h2 className="text-3xl font-bold leading-tight mb-4">
                        운전 중 문자,<br />
                        <span className="text-app-accent">이제 미리 예약하세요.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
                        운전 중에 문자 보내기 불안하셨죠?<br />
                        출발 전에 미리 알림 문자를 예약하세요.
                    </p>

                    {/* 예약 3단계 안내 UI */}
                    <div className="space-y-3 w-full pr-4">
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-full bg-app-accent/20 text-app-accent font-bold flex items-center justify-center shrink-0">1</div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">도착지 입력</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-full bg-app-accent/20 text-app-accent font-bold flex items-center justify-center shrink-0">2</div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">연락처 + 문자 or 알림톡</p>
                        </div>
                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-full bg-app-accent/20 text-app-accent font-bold flex items-center justify-center shrink-0">3</div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">경유지</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            content: (
                <div className="flex flex-col h-full justify-center px-6">
                    <div className="w-14 h-14 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                        <Clock className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-bold leading-tight mb-4">
                        기다리는 분이<br />
                        하염없이 기다리지 않도록
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-6">
                        현재 지나는 위치와 남은 시간을 정확히 알려주어<br />
                        상대방이 도착 시간을 완벽하게 예상할 수 있습니다.
                    </p>

                    <div className="space-y-3">
                        <FeatureRow icon={Navigation} title="출발 알림" desc="출발지에서 300m 벗어날 때 자동 발송" />
                        <FeatureRow icon={MapPin} title="경유지 알림" desc="설정한 경유지 통과 시 남은 시간 발송" />
                        <FeatureRow icon={CheckCircle2} title="도착 부근 알림" desc="목적지 주변 도착 시 안내 발송" />
                    </div>
                </div>
            )
        },
        {
            id: 3,
            content: (
                <div className="flex flex-col h-full justify-center px-6">
                    <div className="w-14 h-14 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                        <MessageSquare className="w-7 h-7" />
                    </div>
                    <h2 className="text-[26px] tracking-tight font-bold leading-tight mb-4">
                        <span className="whitespace-nowrap">지도 앱을 계속 볼 필요 없이</span><br />
                        가장 <span className="text-green-500">직관적인 알림</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
                        링크를 눌러 수시로 지도를 확인해야 하는 번거로움은 이제 그만. 딱 필요한 순간에 문자를 받아보세요.
                    </p>

                    <div className="relative space-y-3">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 blur-[50px] rounded-full"></div>
                        
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 dark:border-gray-700/50 relative z-10">
                            <p className="text-[11px] text-gray-400 font-bold mb-1">도착 부근 알림</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                [성수대교]를 지나고 있습니다.<br />
                                10분 후 도착 예정입니다.
                            </p>
                        </div>

                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 dark:border-gray-700/50 relative z-10">
                            <p className="text-[11px] text-gray-400 font-bold mb-1">경유지 알림 (여러 개 설정 시)</p>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                                "[강일IC]를 지나고 있습니다."<br />
                                "[이마트]를 지나고 있습니다."<br />
                                "[oo사거리]를 지나고 있습니다."
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            content: (
                <div className="flex flex-col h-full justify-center px-6">
                    <div className="w-14 h-14 bg-yellow-500/20 text-yellow-500 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl font-bold leading-tight mb-4">
                        현직 수행기사가<br />
                        <span className="text-yellow-500">직접 쓰려고 만든 앱</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
                        수년간의 VIP 의전 노하우를 바탕으로, 현장에서 꼭 필요한 기능만 담았습니다. 섬세하고 완벽한 이동 경험을 선사합니다.
                    </p>
                    
                    <div className="flex items-center gap-4 bg-app-secondary/30 dark:bg-black/20 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center shrink-0">
                            <Car className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">프리미엄 의전 서비스</p>
                            <p className="text-xs text-gray-500 mt-1">탑승객과 대기자 모두 만족하는 매끄러운 소통</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    // 가로 스크롤 시 활성화된 슬라이드 인덱스 업데이트
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const width = scrollRef.current.clientWidth;
        const activeIndex = Math.round(scrollLeft / width);
        setCurrentSlide(activeIndex);
    };

    return (
        <div className="fixed inset-0 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col font-sans overflow-hidden z-50">
            
            {/* 상단 스킵 버튼 */}
            <div className="absolute top-safe pt-4 right-4 z-10">
                <button 
                    onClick={() => onNavigate('login')}
                    className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-3 py-1"
                >
                    건너뛰기
                </button>
            </div>

            {/* 슬라이드 영역 (가로 스크롤) */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="w-full h-full flex-shrink-0 snap-center pb-32">
                        {slide.content}
                    </div>
                ))}
            </div>

            {/* 하단 고정 영역 (인디케이터 + 버튼) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background-light via-background-light to-transparent dark:from-background-dark dark:via-background-dark pt-12 pb-safe px-6 pb-6">
                
                {/* 슬라이드 인디케이터 (Dots) */}
                <div className="flex justify-center gap-2 mb-6">
                    {slides.map((_, index) => (
                        <div 
                            key={index} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                currentSlide === index 
                                    ? 'w-6 bg-app-accent' 
                                    : 'w-1.5 bg-gray-300 dark:bg-gray-700'
                            }`}
                        />
                    ))}
                </div>

                {/* 시작 버튼 */}
                <button
                    onClick={() => onNavigate('login')}
                    className="w-full bg-app-accent hover:brightness-110 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-app-accent/20 transition-all active:scale-[0.98] mb-4"
                >
                    <span className="text-lg">회원가입하고 시작하기</span>
                    <ArrowRight className="w-5 h-5" />
                </button>

                {/* 로그인 텍스트 링크 */}
                <button
                    onClick={() => onNavigate('login')}
                    className="w-full py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-app-accent transition-colors"
                >
                    이미 계정이 있나요? <span className="underline underline-offset-4 text-app-accent">로그인</span>
                </button>
            </div>
        </div>
    );
}

function FeatureRow({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 bg-white/50 dark:bg-[#162D26]/40 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
                <h4 className="font-bold text-[14px]">{title}</h4>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
