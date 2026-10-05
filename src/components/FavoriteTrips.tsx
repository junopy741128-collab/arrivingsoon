import { useState } from 'react';
import { ChevronLeft, MapPin, Search, Pencil, Trash2, Plus, Calendar, Clock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { Screen, Trip } from '../App';

interface FavoriteTripsProps {
    trips: Trip[];
    onNavigate: (screen: Screen) => void;
    onRebook: (trip: Trip) => void;
    onStartTrip?: (trip: Trip) => void; // [New]
    onToggleFavorite: (tripId: string) => void;
    onUpdateTrip: (trip: Trip) => void;
    onEnterSelectionMode: () => void; // [New]
}

export function FavoriteTrips({ trips, onNavigate, onRebook, onStartTrip, onToggleFavorite, onUpdateTrip, onEnterSelectionMode }: FavoriteTripsProps) {
    // Filter only favorite trips
    const favoriteTrips = trips.filter(t => t.isFavorite);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    // Filter for Search
    const filterdTrips = favoriteTrips.filter(t =>
        (t.alias?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.destination.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.recipient?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleEditSave = () => {
        if (editingTrip) {
            onUpdateTrip(editingTrip);
            setEditingTrip(null);
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-app-primary text-text-primary overflow-hidden">
            {/* Header */}
            <header className="pt-safe px-4 h-16 flex items-center justify-between border-b border-border bg-app-primary sticky top-0 z-20">
                <button
                    onClick={() => onNavigate('mypage')}
                    className="p-2 -ml-2 text-text-muted hover:text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold">즐겨찾기 관리</h1>
                <button
                    className="p-2 -mr-2 text-app-accent hover:text-white transition-colors"
                    onClick={() => {
                        // [V37] Use App Level Selection Mode instead of local modal
                        if (onEnterSelectionMode) onEnterSelectionMode();
                        else onNavigate('list'); // Fallback
                    }}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </header>

            {/* Search Bar */}
            <div className="px-6 pt-6 pb-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="이름 또는 주소 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 rounded-2xl bg-app-secondary border border-border pl-12 pr-4 text-white placeholder-gray-500 focus:border-app-accent outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide pb-24">
                {filterdTrips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-text-muted gap-4 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-app-secondary flex items-center justify-center">
                            <Plus className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-sm text-center">
                            즐겨찾기한 예약이 없습니다.<br />
                            우측 상단 + 버튼을 눌러 추가해보세요.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filterdTrips.map((trip) => (
                            <div
                                key={trip.id}
                                className="bg-app-secondary border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-app-accent/30 transition-colors"
                            >
                                {/* Header: Star, Name, Actions */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-app-primary flex items-center justify-center text-base">
                                            📍
                                        </div>
                                        <h3 className="font-bold text-lg text-white">
                                            {trip.alias || trip.destination.split(' ').slice(0, 2).join(' ')}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setEditingTrip(trip)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`"${trip.alias || trip.destination}" 즐겨찾기를 해제하시겠습니까?`)) {
                                                    onToggleFavorite(trip.id);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700/50 rounded-full transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-2 mb-3 text-sm text-text-muted">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span className="break-keep leading-snug">{trip.destination}</span>
                                </div>

                                {/* Tags */}
                                <div className="flex gap-2 mb-5">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>최근 이용: {new Date(trip.createdAt || Date.now()).toLocaleDateString().slice(5)}</span>
                                    </div>
                                    {trip.targetDistance && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{trip.targetDistance}분 전 알림</span>
                                        </div>
                                    )}
                                </div>

                                {/* Initial Action Button */}
                                <Button
                                    onClick={() => {
                                        if (onStartTrip) {
                                            onStartTrip(trip); // [Fix] Go to Setup (User Request)
                                        } else {
                                            onRebook(trip);
                                        }
                                    }}
                                    className="w-full h-12 bg-app-accent hover:bg-app-accent/90 text-app-primary font-bold text-base rounded-xl transition-all shadow-lg shadow-app-accent/20"
                                >
                                    예약 바로가기
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal (Overlay) */}
            {
                editingTrip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-sm bg-app-secondary border border-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">즐겨찾기 수정</h2>
                                <button
                                    onClick={() => setEditingTrip(null)}
                                    className="p-2 -mr-2 text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-text-muted">별칭 (이름)</Label>
                                    <Input
                                        value={editingTrip.alias || ''}
                                        onChange={(e) => setEditingTrip({ ...editingTrip, alias: e.target.value })}
                                        placeholder="예: 회사, 집, 학교"
                                        className="bg-app-primary border-border h-12 text-white"
                                    />
                                </div>

                                <div className="space-y-2 opacity-50 pointer-events-none">
                                    <Label className="text-text-muted">주소 (수정 불가)</Label>
                                    <Input
                                        value={editingTrip.destination}
                                        readOnly
                                        className="bg-app-primary border-border h-12 text-gray-400"
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        onClick={handleEditSave}
                                        className="w-full h-14 bg-app-accent text-app-primary font-bold text-lg rounded-xl"
                                    >
                                        수정 완료
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
