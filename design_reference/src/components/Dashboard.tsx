import { useState } from 'react';
import { MapPin, Star, ChevronRight, Coins, AlertCircle, Car, MessageSquare, Plus, Users, Clock, Calendar, History } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { BottomNav } from './BottomNav';
import type { Screen } from '../App';
import logoImage from 'figma:asset/a6ded2d6ea9d85ee6ee0dcfb9e3e5eda489e102e.png';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
  userName?: string;
  userPoints?: number;
}

export function Dashboard({ onNavigate, userName = "김운전", userPoints = 5000 }: DashboardProps) {
  const [activeReservations] = useState([
    { 
      id: '1', 
      destination: '서울시 강남구 테헤란로 123',
      recipients: '김민준 외 2인',
      scheduledTime: '약 10분 전',
      date: '2025.12.25',
      status: '예약'
    },
    { 
      id: '2', 
      destination: '인천광역시 중구 공항로 272',
      recipients: '이수진',
      scheduledTime: '약 12분 전',
      date: '2025.12.25',
      status: '예약'
    },
  ]);

  const [recentSearches] = useState([
    {
      id: '1',
      address: '서울시 강남구 역삼동 123-45',
      name: '테헤란로 코엑스',
      searchedAt: '2시간 전'
    },
    {
      id: '2',
      address: '인천광역시 중구 공항로 272',
      name: '인천국제공항 제1터미널',
      searchedAt: '어제'
    },
    {
      id: '3',
      address: '서울시 송파구 올림픽로 300',
      name: '롯데월드타워',
      searchedAt: '3일 전'
    },
  ]);

  const [favorites] = useState([
    { id: '1', name: '회사' },
    { id: '2', name: '집' },
    { id: '3', name: '인천공항' },
    { id: '4', name: '강남역' },
  ]);

  return (
    <div className="min-h-screen bg-[#0f2920] text-white pb-24">
      {/* Safe Area Top */}
      <div className="h-safe-top bg-[#0f2920]" />

      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl">{userName}님</h1>
            <p className="text-sm text-gray-400">안전운전 하세요!</p>
          </div>
          <button 
            onClick={() => onNavigate('mypage')}
            className="text-[#00ff88] text-sm hover:underline"
          >
            프로필
          </button>
        </div>

        {/* Points Card */}
        <Card className="bg-gradient-to-br from-[#00ff88]/20 to-[#00dd77]/10 border-[#00ff88]/30 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                <Coins className="w-6 h-6 text-[#00ff88]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">보유 포인트</p>
                <p className="text-2xl text-[#00ff88]">{userPoints.toLocaleString()}P</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('mypage')}
              className="text-[#00ff88] hover:text-[#00dd77]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </Card>
      </div>

      {/* Active Reservations */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#00ff88]" />
            예약 현황
          </h2>
          <button
            onClick={() => onNavigate('list')}
            className="text-sm text-gray-400 hover:text-[#00ff88]"
          >
            전체보기
          </button>
        </div>

        {activeReservations.length > 0 ? (
          <div className="space-y-3">
            {activeReservations.map((reservation) => (
              <Card
                key={reservation.id}
                className="bg-[#1a3d32] border-gray-700 p-4 cursor-pointer hover:border-[#00ff88]/50 transition-colors"
                onClick={() => onNavigate('active')}
              >
                <div className="space-y-3">
                  {/* 도착지 & 태그 */}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#00ff88] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-white">{reservation.destination}</span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#e6b800] text-black shrink-0">
                      {reservation.status}
                    </span>
                  </div>
                  
                  {/* 구분선 */}
                  <div className="border-t border-gray-700"></div>
                  
                  {/* 받는사람 & 알림예약 */}
                  <div className="flex items-center justify-between text-sm gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#3b82f6] shrink-0" />
                      <span className="text-white">{reservation.recipients}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#e6b800] shrink-0" />
                      <span className="text-white">{reservation.scheduledTime}</span>
                    </div>
                  </div>

                  {/* 날짜 */}
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500">{reservation.date}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[#1a3d32] border-gray-700 p-8 text-center">
            <p className="text-gray-400 mb-4">예약된 알림이 없습니다</p>
            <Button
              onClick={() => onNavigate('setup')}
              className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]"
            >
              새 알림 예약하기
            </Button>
          </Card>
        )}
      </div>

      {/* Recent Searches */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl flex items-center gap-2">
            <History className="w-5 h-5 text-[#00ff88]" />
            최근 기록
          </h2>
          <button
            className="text-sm text-gray-400 hover:text-[#00ff88]"
          >
            전체삭제
          </button>
        </div>

        {recentSearches.length > 0 ? (
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <Card
                key={search.id}
                className="bg-[#1a3d32]/50 border-gray-700 p-4 cursor-pointer hover:border-[#00ff88]/50 transition-colors"
                onClick={() => onNavigate('setup')}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{search.name}</div>
                    <div className="text-xs text-gray-500 truncate">{search.address}</div>
                  </div>
                  <div className="text-xs text-gray-500 shrink-0">{search.searchedAt}</div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-[#1a3d32]/50 border-gray-700 p-6 text-center">
            <p className="text-gray-400 text-sm">최근 검색 기록이 없습니다</p>
          </Card>
        )}
      </div>

      {/* Favorites */}
      <div className="px-6 mb-48">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl flex items-center gap-2">
            <Star className="w-5 h-5 text-[#00ff88]" />
            즐겨찾기
          </h2>
          <button
            onClick={() => onNavigate('favorites')}
            className="text-sm text-gray-400 hover:text-[#00ff88]"
          >
            관리
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {favorites.map((favorite) => (
            <button
              key={favorite.id}
              className="bg-[#1a3d32] border border-gray-700 rounded-2xl p-3 cursor-pointer hover:border-[#00ff88]/50 transition-colors flex flex-col items-center justify-center aspect-square"
              onClick={() => onNavigate('setup')}
            >
              <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mb-2" />
              <p className="text-white text-xs text-center leading-tight">{favorite.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-6 fixed bottom-24 left-0 right-0">
        <Button
          onClick={() => onNavigate('setup')}
          className="w-full max-w-lg mx-auto bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl text-lg shadow-lg shadow-[#00ff88]/20"
        >
          <Plus className="w-6 h-6 mr-2" />
          새 알림 예약하기
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentScreen="dashboard" onNavigate={onNavigate} />
    </div>
  );
}