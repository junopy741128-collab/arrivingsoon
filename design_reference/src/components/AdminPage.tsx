import { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Coins,
  Search,
  ChevronRight,
  Plus,
  Minus,
  Shield,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import type { Screen } from '../App';

interface AdminPageProps {
  onNavigate: (screen: Screen) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointAmount, setPointAmount] = useState('');
  const [pointReason, setPointReason] = useState('');

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '김운전',
      email: 'driver1@example.com',
      points: 5000,
      status: 'active',
      joinDate: '2024-12-01',
    },
    {
      id: '2',
      name: '이택시',
      email: 'driver2@example.com',
      points: 3500,
      status: 'active',
      joinDate: '2024-12-05',
    },
    {
      id: '3',
      name: '박배달',
      email: 'driver3@example.com',
      points: 7200,
      status: 'active',
      joinDate: '2024-11-28',
    },
  ]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPoints = () => {
    if (!selectedUser || !pointAmount) return;
    
    const amount = parseInt(pointAmount);
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, points: user.points + amount }
        : user
    ));
    
    setPointAmount('');
    setPointReason('');
    setSelectedUser(null);
  };

  const handleDeductPoints = () => {
    if (!selectedUser || !pointAmount) return;
    
    const amount = parseInt(pointAmount);
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, points: Math.max(0, user.points - amount) }
        : user
    ));
    
    setPointAmount('');
    setPointReason('');
    setSelectedUser(null);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);

  return (
    <div className="min-h-screen bg-[#0f2920] text-white pb-24">
      {/* Safe Area Top */}
      <div className="h-safe-top bg-[#0f2920]" />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => onNavigate('mypage')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl">관리자 페이지</h1>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-6 pt-6 pb-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-[#1a3d32] border-gray-700 p-4 text-center">
            <Users className="w-6 h-6 text-[#00ff88] mx-auto mb-2" />
            <p className="text-2xl text-[#00ff88] mb-1">{totalUsers}</p>
            <p className="text-xs text-gray-400">전체 회원</p>
          </Card>
          <Card className="bg-[#1a3d32] border-gray-700 p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl text-blue-400 mb-1">{activeUsers}</p>
            <p className="text-xs text-gray-400">활성 회원</p>
          </Card>
          <Card className="bg-[#1a3d32] border-gray-700 p-4 text-center">
            <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl text-yellow-400 mb-1">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-gray-400">총 포인트</p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full bg-[#1a3d32] mb-6">
            <TabsTrigger value="users" className="flex-1 text-gray-300 data-[state=active]:bg-[#00ff88] data-[state=active]:text-[#0f2920]">
              <Users className="w-4 h-4 mr-2" />
              회원 관리
            </TabsTrigger>
            <TabsTrigger value="points" className="flex-1 text-gray-300 data-[state=active]:bg-[#00ff88] data-[state=active]:text-[#0f2920]">
              <Coins className="w-4 h-4 mr-2" />
              포인트 관리
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
              <Input
                type="text"
                placeholder="이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a3d32] border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>

            {/* User List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-[#1a3d32] border-gray-700 p-4 hover:border-[#00ff88]/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg mb-1 text-white">{user.name}</h3>
                      <p className="text-sm text-gray-300">{user.email}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {user.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-700">
                    <span className="text-gray-300">가입일: {user.joinDate}</span>
                    <span className="text-[#00ff88]">{user.points.toLocaleString()}P</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="mt-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
              <Input
                type="text"
                placeholder="회원 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a3d32] border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Point Management List */}
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-[#1a3d32] border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg mb-1 text-white">{user.name}</h3>
                      <p className="text-sm text-gray-300">{user.email}</p>
                    </div>
                    <span className="text-xl text-[#00ff88]">
                      {user.points.toLocaleString()}P
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedUser(user)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          적립
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a3d32] border-gray-700 text-white">
                        <DialogHeader>
                          <DialogTitle>포인트 적립</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            {selectedUser?.name}님에게 포인트를 적립합니다.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="amount" className="text-gray-300">포인트</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="적립할 포인트"
                              value={pointAmount}
                              onChange={(e) => setPointAmount(e.target.value)}
                              className="bg-[#0f2920] border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="reason" className="text-gray-300">사유</Label>
                            <Input
                              id="reason"
                              placeholder="적립 사유"
                              value={pointReason}
                              onChange={(e) => setPointReason(e.target.value)}
                              className="bg-[#0f2920] border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleAddPoints}
                            className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]"
                          >
                            적립하기
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedUser(user)}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          <Minus className="w-4 h-4 mr-1" />
                          차감
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a3d32] border-gray-700 text-white">
                        <DialogHeader>
                          <DialogTitle>포인트 차감</DialogTitle>
                          <DialogDescription className="text-gray-300">
                            {selectedUser?.name}님의 포인트를 차감합니다.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="deduct-amount" className="text-gray-300">포인트</Label>
                            <Input
                              id="deduct-amount"
                              type="number"
                              placeholder="차감할 포인트"
                              value={pointAmount}
                              onChange={(e) => setPointAmount(e.target.value)}
                              className="bg-[#0f2920] border-gray-700 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="deduct-reason" className="text-gray-300">사유</Label>
                            <Input
                              id="deduct-reason"
                              placeholder="차감 사유"
                              value={pointReason}
                              onChange={(e) => setPointReason(e.target.value)}
                              className="bg-[#0f2920] border-gray-700 text-white"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleDeductPoints}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            차감하기
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}