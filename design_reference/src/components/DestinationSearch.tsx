import { useState } from 'react';
import { MapPin, Clock, Search, X, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DestinationSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { name: string; address: string }) => void;
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
  address: string;
  distance: string;
}

interface RecentSearch {
  id: string;
  name: string;
  time: string;
}

export function DestinationSearch({ isOpen, onClose, onSelect }: DestinationSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  const recentSearches: RecentSearch[] = [
    { id: '1', name: '나인원한남아파트 108동', time: '12.02' },
    { id: '2', name: '서울 강동구 고덕로61길 37', time: '12.02' },
    { id: '3', name: '개룡역 3번 출구 뒤 대여소', time: '12.02' },
    { id: '4', name: '개룡역 2번출구', time: '12.02' },
    { id: '5', name: '알펜시아에스테이트', time: '12.02' },
  ];

  const mockResults: SearchResult[] = [
    { id: '1', name: '현대아파트', category: '아파트', address: '34km  서울 강동구 고덕로61길 37', distance: '34km' },
    { id: '2', name: '101동', category: '주거시설', address: '진입점소 더보기 ↓', distance: '' },
    { id: '3', name: '삐야제어리아젬', category: '어린이집', address: '34km  서울 강동구 고덕로61길 27', distance: '34km' },
    { id: '4', name: '현대슈퍼', category: '슈퍼/마트', address: '34km  서울 강동구 고덕로61길 37', distance: '34km' },
    { id: '5', name: '성일자동차학원', category: '학원', address: '34km  서울 강동구 고덕로61길 37', distance: '34km' },
    { id: '6', name: '금문', category: '중식', address: '34km  서울 강동구 고덕로61길 37', distance: '34km' },
    { id: '7', name: '대영종합공사', category: '건축자재', address: '34km  서울 강동구 고덕로61길 37', distance: '34km' },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchResults(mockResults);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect({ name: result.name, address: result.address });
    onClose();
  };

  const handleRecentSelect = (recent: RecentSearch) => {
    onSelect({ name: recent.name, address: recent.name });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f2920] text-white max-w-full w-full h-full m-0 p-0 max-h-full rounded-none">
        <DialogHeader className="sr-only">
          <DialogTitle>도착지 검색</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="도착지를 검색하세요"
                className="w-full bg-[#1a3d32] border-2 border-gray-700 rounded-2xl h-12 pl-12 pr-4 text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              // 검색 결과
              <div className="p-4 space-y-2">
                <h3 className="text-sm text-gray-400 mb-3">검색 결과</h3>
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full p-4 bg-[#1a3d32] hover:bg-[#1a3d32]/80 rounded-xl text-left transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#00ff88] mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white">{result.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                            {result.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{result.address}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              // 최근 검색
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm text-gray-400">최근 기록</h3>
                  <button className="text-xs text-gray-500">편집</button>
                </div>
                {recentSearches.map((recent) => (
                  <div
                    key={recent.id}
                    className="w-full p-3 hover:bg-[#1a3d32] rounded-xl transition-colors flex items-center justify-between"
                  >
                    <button
                      onClick={() => handleRecentSelect(recent)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-white truncate">{recent.name}</span>
                    </button>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">{recent.time}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete
                        }}
                        className="p-1"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="w-full text-center text-sm text-gray-500 py-2">
                  더보기 ↓
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}