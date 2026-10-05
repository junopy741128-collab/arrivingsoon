import { showAlert } from '../utils/globalAlert';
import { useState, useEffect, useRef, forwardRef, type InputHTMLAttributes } from 'react';
import { ArrowLeft, MapPin, X, Loader2, History, ChevronRight } from 'lucide-react';
import { type KakaoPoiResult, searchPoiKakao } from '../utils/kakao-service';
import { getCurrentPosition } from '../utils/capacitor-plugins';

// 데이터 타입 (kakao)
export type TmapSearchResult = KakaoPoiResult;

interface DestinationSearchProps {
    onBack: () => void;
    onSelect: (result: TmapSearchResult) => void;
    initialQuery?: string;
}

// Simple Input Component for cleaner TSX
const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input ref={ref} className={className} {...props} />
    )
);
SearchInput.displayName = 'SearchInput';

export function DestinationSearch({ onBack, onSelect, initialQuery = '' }: DestinationSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<TmapSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 최근 검색어 (LocalStorage)
    const [recentSearches, setRecentSearches] = useState<TmapSearchResult[]>(() => {
        try {
            const saved = localStorage.getItem('kakao_recent_searches');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // 초기 포커스
    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, []);

    // 검색 핸들러 (수동 검색)
    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query || query.trim().length < 2) {
            setResults([]);
            return;
        }
        _searchPlaces(query);
    };

    // 자동완성 검색 함수 (Kakao)
    const _searchPlaces = async (keyword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // 거리 계산을 위한 현재 위치 가져오기 (선택 - Kakao Search Sort에서 사용)
            let currentLat: number | undefined, currentLng: number | undefined;
            try {
                const pos = await getCurrentPosition();
                if (pos) {
                    currentLat = pos.latitude;
                    currentLng = pos.longitude;
                }
            } catch (e) {
                console.warn('Current position not available for search sorting', e);
            }

            // Kakao Search API handles both addresses and keywords
            const searchResults = await searchPoiKakao(keyword, currentLat, currentLng);
            setResults(searchResults);

        } catch (err: any) {
            console.error('Search failed:', err);
            setError('검색에 오류가 발생했습니다.');
            showAlert(`검색 오류: ${err.message || JSON.stringify(err)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (place: TmapSearchResult) => {
        // 최근 검색어 저장
        const updatedRecents = [place, ...recentSearches.filter(p => p.address !== place.address || p.name !== place.name)].slice(0, 10);
        setRecentSearches(updatedRecents);
        localStorage.setItem('kakao_recent_searches', JSON.stringify(updatedRecents));
        onSelect(place);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('kakao_recent_searches');
    };

    return (
        <div className="flex flex-col h-full bg-[#0f2920] text-white">
            {/* 상단 검색창 */}
            <div
                className="flex items-center gap-2 p-4 bg-[#0f2920]"
                style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}
            >
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-800">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>

                <form onSubmit={handleSearch} className="flex-1 relative flex items-center bg-[#1a3d32] rounded-xl border-2 border-transparent focus-within:border-[#00ff88] transition-colors">
                    <SearchInput
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="주소, 장소, 전화번호 검색"
                        className="w-full h-12 bg-transparent text-white px-4 outline-none border-none placeholder:text-gray-500"
                    />
                    {query && (
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
                                className="p-2 mr-1 text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* 검색 결과 목록 */}
            <div className="flex-1 overflow-y-auto bg-[#0f2920]">

                {/* 로딩 표시 */}
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
                    </div>
                )}

                {/* 에러 표시 */}
                {!isLoading && error && (
                    <div className="text-center py-8 text-red-400">
                        {error}
                    </div>
                )}

                {/* 검색 결과 목록 */}
                {!isLoading && results.length > 0 && (
                    <div className="divide-y divide-gray-800">
                        {results.map((place, index) => (
                            <div
                                key={place.id || index}
                                onClick={() => handleSelect(place)}
                                className="flex items-center p-4 hover:bg-[#1a4d3d] active:bg-[#235a47] cursor-pointer transition-colors"
                            >
                                <div className="mr-4 mt-1 self-start">
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-base font-bold text-white truncate">
                                            {place.name}
                                        </span>
                                        {place.category && (
                                            <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-800 rounded">
                                                {place.category}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate">
                                        {place.address}
                                    </div>
                                    {place.distance !== undefined && place.distance > 0 && (
                                        <div className="text-xs text-[#00ff88] mt-1 font-medium">
                                            {place.distance < 1000 ? `${Math.round(place.distance)} m` : `${(place.distance / 1000).toFixed(1)} km`}
                                        </div>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </div>
                        ))}
                    </div>
                )}

                {/* 쿼리 없음 & 결과 없음 -> 최근 검색어 */}
                {!isLoading && results.length === 0 && !query && (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400">최근 검색</h3>
                            {recentSearches.length > 0 && (
                                <button onClick={clearRecentSearches} className="text-xs text-gray-500 hover:text-red-400">기록 삭제</button>
                            )}
                        </div>

                        {recentSearches.length === 0 ? (
                            <div className="py-10 text-center text-gray-600 text-sm">검색 기록이 없습니다.</div>
                        ) : (
                            <div className="space-y-2">
                                {recentSearches.map((place, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelect(place)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[#1a3d32] border border-transparent hover:border-[#00ff88] transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <History className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-200 truncate">{place.name}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#00ff88]" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 쿼리가 있는데 결과가 없는 경우 */}
                {!isLoading && results.length === 0 && query.trim().length >= 2 && (
                    <div className="py-10 text-center text-gray-400">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}


