import { useState } from 'react';
import { ArrowLeft, Star, Plus, Trash2, Edit2, Search, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { Screen } from '../App';

interface Favorite {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  weekdays?: string[];
  time?: string;
}

interface FavoritesManagerProps {
  onNavigate: (screen: Screen) => void;
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export function FavoritesManager({ onNavigate }: FavoritesManagerProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([
    { id: '1', name: '회사', address: '서울시 강남구 테헤란로 123', weekdays: ['월', '화', '수', '목', '금'], time: '09:00' },
    { id: '2', name: '집', address: '서울시 송파구 올림픽로 456', weekdays: ['월', '화', '수', '목', '금', '토', '일'] },
    { id: '3', name: '인천공항', address: '인천광역시 중구 공항로 272' },
    { id: '4', name: '강남역', address: '서울시 강남구 강남대로 지하 396' },
  ]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempWeekdays, setTempWeekdays] = useState<string[]>([]);

  const filteredFavorites = favorites.filter(fav =>
    fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (favorite: Favorite) => {
    setSelectedFavorite({ ...favorite });
    setTempWeekdays(favorite.weekdays || []);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('이 즐겨찾기를 삭제하시겠습니까?')) {
      setFavorites(favorites.filter(f => f.id !== id));
    }
  };

  const handleSave = () => {
    if (!selectedFavorite) return;

    if (selectedFavorite.name.trim() === '') {
      alert('이름을 입력해주세요.');
      return;
    }

    const updatedFavorite = {
      ...selectedFavorite,
      weekdays: tempWeekdays.length > 0 ? tempWeekdays : undefined,
    };

    if (selectedFavorite.id) {
      setFavorites(favorites.map(f => f.id === selectedFavorite.id ? updatedFavorite : f));
    } else {
      const newFavorite = {
        ...updatedFavorite,
        id: Date.now().toString(),
      };
      setFavorites([...favorites, newFavorite]);
    }

    setIsEditDialogOpen(false);
    setSelectedFavorite(null);
    setTempWeekdays([]);
  };

  const handleAddNew = () => {
    setSelectedFavorite({ id: '', name: '', address: '' });
    setTempWeekdays([]);
    setIsEditDialogOpen(true);
  };

  const toggleWeekday = (weekday: string) => {
    setTempWeekdays(prev =>
      prev.includes(weekday)
        ? prev.filter(d => d !== weekday)
        : [...prev, weekday]
    );
  };

  const handleQuickBooking = (favorite: Favorite) => {
    // 즐겨찾기로 바로 예약 설정 페이지로 이동
    onNavigate('setup');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={() => onNavigate('dashboard')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center">즐겨찾기 관리</h1>
        <button onClick={handleAddNew} className="p-2">
          <Plus className="w-6 h-6 text-[#00ff88]" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 주소 검색"
            className="w-full bg-[#1a3d32] border-0 rounded-2xl h-12 pl-12 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Favorites List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3">
          {filteredFavorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-[#1a3d32] border border-gray-700 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{favorite.name}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(favorite)}
                        className="p-2"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(favorite.id)}
                        className="p-2"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-400">{favorite.address}</p>
                  </div>
                  {favorite.weekdays && favorite.weekdays.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#00ff88]" />
                      <div className="flex gap-1">
                        {favorite.weekdays.map(day => (
                          <span
                            key={day}
                            className="text-xs px-2 py-1 bg-[#00ff88]/20 text-[#00ff88] rounded-lg"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                      {favorite.time && (
                        <span className="text-sm text-gray-400">{favorite.time}</span>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={() => handleQuickBooking(favorite)}
                    className="w-full mt-2 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-10 rounded-xl border-0"
                  >
                    빠른 예약
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFavorites.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
            <Star className="w-16 h-16 mb-4" />
            <p>즐겨찾기가 없습니다</p>
            <button
              onClick={handleAddNew}
              className="mt-4 text-[#00ff88] hover:underline"
            >
              즐겨찾기 추가하기
            </button>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedFavorite?.id ? '즐겨찾기 수정' : '즐겨찾기 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">이름</label>
              <Input
                value={selectedFavorite?.name || ''}
                onChange={(e) => setSelectedFavorite({ ...selectedFavorite!, name: e.target.value })}
                placeholder="예: 회사, 집, 인천공항"
                className="w-full bg-[#0f2920] border-gray-700 rounded-xl h-12 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">주소</label>
              <Input
                value={selectedFavorite?.address || ''}
                onChange={(e) => setSelectedFavorite({ ...selectedFavorite!, address: e.target.value })}
                placeholder="주소를 입력하세요"
                className="w-full bg-[#0f2920] border-gray-700 rounded-xl h-12 text-white placeholder:text-gray-500"
              />
            </div>
            
            {/* Weekday Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">요일 선택 (선택사항)</label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map(day => {
                  const isSelected = tempWeekdays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleWeekday(day)}
                      className={`h-10 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#00ff88] text-[#0f2920] font-medium'
                          : 'bg-[#0f2920] text-gray-400 border border-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">시간 (선택사항)</label>
              <Input
                type="time"
                value={selectedFavorite?.time || ''}
                onChange={(e) => setSelectedFavorite({ ...selectedFavorite!, time: e.target.value })}
                className="w-full bg-[#0f2920] border-gray-700 rounded-xl h-12 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedFavorite(null);
                  setTempWeekdays([]);
                }}
                variant="outline"
                className="flex-1 bg-transparent border-gray-700 text-white h-12 rounded-xl"
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-12 rounded-xl border-0"
              >
                {selectedFavorite?.id ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
