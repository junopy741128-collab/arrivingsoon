import { useState } from 'react';
import { ArrowLeft, Search, Plus, User, Star, Phone, Edit2, Trash2, X, Check, MessageCircle, MoreVertical, Users, FolderPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import type { Screen, Contact } from '../App';

interface ContactGroup {
  id: string;
  name: string;
  contactIds: string[];
  color: string;
}

interface ContactManagementProps {
  onNavigate: (screen: Screen) => void;
  onSelectContacts?: (contacts: Contact[]) => void;
}

export function ContactManagement({ onNavigate, onSelectContacts }: ContactManagementProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: '김민준', phone: '010-1234-5678', isFavorite: true, type: 'phone' },
    { id: '2', name: '이수진', phone: '010-2345-6789', isFavorite: true, type: 'phone' },
    { id: '3', name: '박서연', phone: '010-3456-7890', isFavorite: false, type: 'phone' },
    { id: '4', name: '최정훈', phone: '010-4567-8901', isFavorite: false, type: 'phone' },
    { id: '5', name: '정예은', phone: '010-5678-9012', isFavorite: false, type: 'phone' },
  ]);
  const [groups, setGroups] = useState<ContactGroup[]>([
    { id: 'g1', name: '가족', contactIds: ['1', '2'], color: '#00ff88' },
    { id: 'g2', name: '회사동료', contactIds: ['3', '4'], color: '#00d4ff' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isImportMenuOpen, setIsImportMenuOpen] = useState(false);
  const [isKakaoDialogOpen, setIsKakaoDialogOpen] = useState(false);
  const [kakaoFriends, setKakaoFriends] = useState<Contact[]>([]);
  const [kakaoSelectedIds, setKakaoSelectedIds] = useState<string[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#00ff88');
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const filteredContacts = contacts.filter(
    contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const favoriteContacts = filteredContacts.filter(c => c.isFavorite);
  const regularContacts = filteredContacts.filter(c => !c.isFavorite);

  const toggleFavorite = (id: string) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const handleImportContacts = async () => {
    setIsImportMenuOpen(false);
    try {
      if ('contacts' in navigator && 'ContactsManager' in window) {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        
        // @ts-ignore
        const selectedContacts = await navigator.contacts.select(props, opts);
        
        const newContacts: Contact[] = selectedContacts.map((contact: any) => ({
          id: Date.now().toString() + Math.random(),
          name: contact.name?.[0] || '이름 없음',
          phone: contact.tel?.[0] || '',
          isFavorite: false,
          type: 'phone',
        }));
        
        setContacts([...contacts, ...newContacts]);
      } else {
        alert('이 브라우저는 연락처 불러오기를 지원하지 않습니다. Chrome 또는 Edge 브라우저를 사용해주세요.');
      }
    } catch (error) {
      console.log('연락처 선택이 취소되었습니다.');
    }
  };

  const handleImportKakao = async () => {
    setIsImportMenuOpen(false);
    const mockKakaoFriends: Contact[] = [
      { id: 'kakao1', name: '강지훈', phone: 'kakao', isFavorite: false, type: 'kakao' },
      { id: 'kakao2', name: '이하늘', phone: 'kakao', isFavorite: false, type: 'kakao' },
      { id: 'kakao3', name: '정소희', phone: 'kakao', isFavorite: false, type: 'kakao' },
      { id: 'kakao4', name: '박민서', phone: 'kakao', isFavorite: false, type: 'kakao' },
      { id: 'kakao5', name: '최유진', phone: 'kakao', isFavorite: false, type: 'kakao' },
      { id: 'kakao6', name: '김태양', phone: 'kakao', isFavorite: false, type: 'kakao' },
    ];
    
    setKakaoFriends(mockKakaoFriends);
    setIsKakaoDialogOpen(true);
  };

  const handleAddKakaoFriends = (friendIds: string[]) => {
    const selectedFriends = kakaoFriends.filter(f => friendIds.includes(f.id));
    setContacts([...contacts, ...selectedFriends]);
    setIsKakaoDialogOpen(false);
  };

  const handleEditContact = () => {
    if (!selectedContact) return;
    
    setContacts(contacts.map(c => 
      c.id === selectedContact.id ? selectedContact : c
    ));
    
    // 그룹 업데이트
    setGroups(groups.map(g => {
      if (selectedGroupIds.includes(g.id)) {
        // 이 그룹에 추가
        if (!g.contactIds.includes(selectedContact.id)) {
          return { ...g, contactIds: [...g.contactIds, selectedContact.id] };
        }
      } else {
        // 이 그룹에서 제거
        return { ...g, contactIds: g.contactIds.filter(id => id !== selectedContact.id) };
      }
      return g;
    }));
    
    setIsEditDialogOpen(false);
    setSelectedContact(null);
    setSelectedGroupIds([]);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('이 연락처를 삭제하시겠습니까?')) {
      setContacts(contacts.filter(c => c.id !== id));
      // 그룹에서도 제거
      setGroups(groups.map(g => ({
        ...g,
        contactIds: g.contactIds.filter(contactId => contactId !== id)
      })));
    }
  };

  const openEditDialog = (contact: Contact) => {
    setSelectedContact({ ...contact });
    // 현재 연락처가 속한 그룹들 찾기
    const contactGroups = groups.filter(g => g.contactIds.includes(contact.id)).map(g => g.id);
    setSelectedGroupIds(contactGroups);
    setIsEditDialogOpen(true);
    setOpenMenuId(null);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const handleConfirmSelection = () => {
    if (selectedContactIds.length === 0) {
      alert('최소 1개 이상의 연락처를 선택해주세요.');
      return;
    }
    
    const selected = contacts.filter(c => selectedContactIds.includes(c.id));
    onSelectContacts?.(selected);
    onNavigate('setup');
  };

  const handleAddGroup = () => {
    if (newGroupName.trim() === '') {
      alert('그룹 이름을 입력해주세요.');
      return;
    }
    
    const newGroup: ContactGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      contactIds: [],
      color: newGroupColor,
    };
    
    setGroups([...groups, newGroup]);
    setIsGroupDialogOpen(false);
    setNewGroupName('');
    setNewGroupColor('#00ff88');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('이 그룹을 삭제하시겠습니까?')) {
      setGroups(groups.filter(g => g.id !== groupId));
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const getContactGroups = (contactId: string) => {
    return groups.filter(g => g.contactIds.includes(contactId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f2920] text-white">
      {/* Header */}
      <header className="flex items-center px-4 py-4 border-b border-gray-800">
        <button onClick={() => onNavigate('setup')} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center">연락처 관리</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGroupPanel(!showGroupPanel)}
            className="p-2"
          >
            <Users className="w-6 h-6 text-[#00d4ff]" />
          </button>
          <div className="relative">
            <button
              onClick={() => setIsImportMenuOpen(!isImportMenuOpen)}
              className="p-2"
            >
              <Plus className="w-6 h-6 text-[#00ff88]" />
            </button>
            
            {isImportMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsImportMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 z-20 bg-[#1a3d32] border border-gray-700 rounded-2xl shadow-xl overflow-hidden min-w-[200px]">
                  <button
                    onClick={handleImportContacts}
                    className="w-full px-4 py-3 text-left hover:bg-[#234a3d] flex items-center gap-3 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[#00ff88]" />
                    <span>스마트폰 연락처</span>
                  </button>
                  <button
                    onClick={handleImportKakao}
                    className="w-full px-4 py-3 text-left hover:bg-[#234a3d] flex items-center gap-3 transition-colors border-t border-gray-700"
                  >
                    <MessageCircle className="w-5 h-5 text-yellow-400" />
                    <span>카카오톡 친구</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 전화번호 검색"
            className="w-full bg-[#1a3d32] border-0 rounded-2xl h-12 pl-12 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 mb-20">
        {/* Favorites */}
        {favoriteContacts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#00ff88]" fill="#00ff88" />
              <h2 className="text-sm text-gray-400">즐겨찾기</h2>
            </div>
            <div className="space-y-2">
              {favoriteContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                const contactGroups = getContactGroups(contact.id);
                return (
                  <div
                    key={contact.id}
                    className={`bg-[#1a3d32] rounded-2xl p-4 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-[#00ff88] bg-[#00ff88]/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#00ff88] border-[#00ff88]' : 'border-gray-500'
                        }`}>
                        {isSelected && <Check className="w-4 h-4 text-[#0f2920]" />}
                      </div>
                      <div className="w-12 h-12 bg-[#00ff88] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-[#0f2920]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white mb-1 flex items-center gap-2">
                          {contact.name}
                          {contact.type === 'kakao' && (
                            <MessageCircle className="w-4 h-4 text-yellow-400" />
                          )}
                          {contact.isFavorite && (
                            <Star className="w-4 h-4 text-[#00ff88]" fill="#00ff88" />
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">{contact.phone === 'kakao' ? '카카오톡' : contact.phone}</div>
                        {contactGroups.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contactGroups.map(group => (
                              <span
                                key={group.id}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: group.color + '30', color: group.color }}
                              >
                                {group.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === contact.id ? null : contact.id);
                          }}
                          className="p-2 hover:bg-[#234a3d] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {openMenuId === contact.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-10 z-20 bg-[#0f2920] border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(contact);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[#1a3d32] flex items-center gap-3 transition-colors text-white"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>편집</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(contact.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[#1a3d32] flex items-center gap-3 transition-colors text-white border-t border-gray-800"
                              >
                                <Star className="w-4 h-4" />
                                <span>{contact.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContact(contact.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[#1a3d32] flex items-center gap-3 transition-colors text-red-400 border-t border-gray-800"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>삭제</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Contacts */}
        {regularContacts.length > 0 && (
          <div>
            <h2 className="text-sm text-gray-400 mb-3">모든 연락처</h2>
            <div className="space-y-2">
              {regularContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact.id);
                const contactGroups = getContactGroups(contact.id);
                return (
                  <div
                    key={contact.id}
                    className={`bg-[#1a3d32] rounded-2xl p-4 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-[#00ff88] bg-[#00ff88]/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#00ff88] border-[#00ff88]' : 'border-gray-500'
                        }`}>
                        {isSelected && <Check className="w-4 h-4 text-[#0f2920]" />}
                      </div>
                      <div className="w-12 h-12 bg-[#234a3d] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white mb-1 flex items-center gap-2">
                          {contact.name}
                          {contact.type === 'kakao' && (
                            <MessageCircle className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">{contact.phone === 'kakao' ? '카카오톡' : contact.phone}</div>
                        {contactGroups.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {contactGroups.map(group => (
                              <span
                                key={group.id}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: group.color + '30', color: group.color }}
                              >
                                {group.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === contact.id ? null : contact.id);
                          }}
                          className="p-2 hover:bg-[#234a3d] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        
                        {openMenuId === contact.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 top-10 z-20 bg-[#0f2920] border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(contact);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[#1a3d32] flex items-center gap-3 transition-colors text-white"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span>편집</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(contact.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[#1a3d32] flex items-center gap-3 transition-colors text-white border-t border-gray-800"
                              >
                                <Star className="w-4 h-4" />
                                <span>{contact.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteContact(contact.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-[#1a3d32] flex items-center gap-3 transition-colors text-red-400 border-t border-gray-800"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>삭제</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredContacts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
            <User className="w-16 h-16 mb-4" />
            <p>연락처가 없습니다</p>
            <button
              onClick={handleImportContacts}
              className="mt-4 text-[#00ff88] hover:underline"
            >
              스마트폰 연락처에서 가져오기
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar - Always shown */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f2920] border-t border-gray-800 px-6 py-4">
        <Button
          onClick={handleConfirmSelection}
          disabled={selectedContactIds.length === 0}
          className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-14 rounded-2xl border-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          선택 완료 ({selectedContactIds.length})
        </Button>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-gray-700 text-white max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">연락처 편집</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">이름</label>
              <Input
                value={selectedContact?.name || ''}
                onChange={(e) => setSelectedContact({ ...selectedContact!, name: e.target.value })}
                placeholder="이름을 입력하세요"
                className="w-full bg-[#0f2920] border-gray-700 rounded-xl h-12 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">전화번호</label>
              <Input
                value={selectedContact?.phone || ''}
                onChange={(e) => setSelectedContact({ ...selectedContact!, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full bg-[#0f2920] border-gray-700 rounded-xl h-12 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">그룹 선택</label>
              {groups.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="mb-3">생성된 그룹이 없습니다</p>
                  <Button
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setIsGroupDialogOpen(true);
                    }}
                    className="bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]"
                  >
                    새 그룹 만들기
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {groups.map((group) => {
                    const isSelected = selectedGroupIds.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        onClick={() => toggleGroupSelection(group.id)}
                        className={`w-full p-3 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'bg-[#00ff88]/20 border-2 border-[#00ff88]'
                            : 'bg-[#0f2920] border-2 border-transparent hover:bg-[#1a4d3d]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="text-white">{group.name}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#00ff88] ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedGroupIds([]);
                }}
                variant="outline"
                className="flex-1 bg-transparent border-gray-700 text-white h-12 rounded-xl"
              >
                취소
              </Button>
              <Button
                onClick={handleEditContact}
                className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-12 rounded-xl border-0"
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kakao Friends Dialog */}
      <Dialog open={isKakaoDialogOpen} onOpenChange={setIsKakaoDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-gray-700 text-white max-w-md max-h-[600px] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-yellow-400" />
              카카오톡 친구 선택
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 mt-4">
            {kakaoFriends.map((friend) => {
              const isSelected = kakaoSelectedIds.includes(friend.id);
              
              return (
                <div
                  key={friend.id}
                  onClick={() => {
                    setKakaoSelectedIds(prev =>
                      prev.includes(friend.id)
                        ? prev.filter(id => id !== friend.id)
                        : [...prev, friend.id]
                    );
                  }}
                  className={`bg-[#0f2920] rounded-xl p-3 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-yellow-400 bg-yellow-400/10' : 'hover:bg-[#1a4d3d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-yellow-400 border-yellow-400' : 'border-gray-500'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-[#0f2920]" />}
                    </div>
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white">{friend.name}</div>
                      <div className="text-gray-400 text-sm">카카오톡</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-700 mt-4">
            <Button
              onClick={() => setIsKakaoDialogOpen(false)}
              variant="outline"
              className="flex-1 bg-transparent border-gray-700 text-white h-12 rounded-xl"
            >
              취소
            </Button>
            <Button
              onClick={() => handleAddKakaoFriends(kakaoSelectedIds)}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-[#0f2920] h-12 rounded-xl border-0"
            >
              추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="bg-[#1a3d32] border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">그룹 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">그룹 이름</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="그룹 이름을 입력하세요"
                className="w-full bg-[#0f2920] border-gray-700 rounded-xl h-12 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">그룹 색상</label>
              <div className="flex gap-3">
                {['#00ff88', '#00d4ff', '#ff6b6b', '#ffd93d', '#a78bfa'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewGroupColor(color)}
                    className={`w-12 h-12 rounded-full transition-all ${
                      newGroupColor === color ? 'ring-4 ring-white/50 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsGroupDialogOpen(false)}
                variant="outline"
                className="flex-1 bg-transparent border-gray-700 text-white h-12 rounded-xl"
              >
                취소
              </Button>
              <Button
                onClick={handleAddGroup}
                className="flex-1 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] h-12 rounded-xl border-0"
              >
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Panel */}
      {showGroupPanel && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setShowGroupPanel(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-[#0f2920] border-t-2 border-[#00d4ff] px-6 py-6 z-30 rounded-t-3xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-white">내 그룹</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowGroupPanel(false);
                    setIsGroupDialogOpen(true);
                  }}
                  className="px-4 py-2 bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] rounded-xl transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  새 그룹
                </button>
                <button
                  onClick={() => setShowGroupPanel(false)}
                  className="p-2"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>생성된 그룹이 없습니다</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[#1a3d32] rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <div>
                          <div className="text-white font-medium">{group.name}</div>
                          <div className="text-sm text-gray-400">
                            {group.contactIds.length}명의 연락처
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}