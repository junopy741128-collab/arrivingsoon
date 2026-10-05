
import { useState, useEffect } from 'react';
import { X, Search, Check, User, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Capacitor } from '@capacitor/core';
import type { Contact } from '../App';

// Reuse ExtendedContact definition if possible, or redefine locally for import logic
interface ImportedContact {
    id: string; // generated
    name: string;
    phone: string;
    phoneNumber: string; // normalized
    isSelected: boolean;
    avatarColor?: string;
}

interface ContactImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (contacts: Contact[], targetGroupId: string) => void;
    existingContacts: Contact[]; // To check duplicates
    groups: { id: string; name: string; color: string }[];
}

const AVATAR_COLORS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
];

export function ContactImportModal({ isOpen, onClose, onImport, existingContacts, groups }: ContactImportModalProps) {
    const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
    const [rawContacts, setRawContacts] = useState<ImportedContact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);

    // Group Selection
    const [targetGroupId, setTargetGroupId] = useState<string>('none'); // Default 'none'
    const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

    // Load Contacts on Open
    useEffect(() => {
        if (isOpen) {
            loadContacts();
        } else {
            // Reset state on close
            setSearchQuery('');
            setRawContacts([]);
            setSelectedCount(0);
            setTargetGroupId('none');
        }
    }, [isOpen]);

    const loadContacts = async () => {
        if (!Capacitor.isNativePlatform()) {
            // Fake Data for Web Testing
            console.log('🌐 Web Environment: Loading mock contacts');
            const mocks: ImportedContact[] = Array.from({ length: 20 }).map((_, i) => ({
                id: `mock-${i}`,
                name: `User ${i + 1}`,
                phone: `010-1234-${1000 + i}`,
                phoneNumber: `0101234${1000 + i}`,
                isSelected: false,
                avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length]
            }));
            setRawContacts(mocks);
            return;
        }

        setIsLoading(true);
        try {
            // Dynamic Import
            const { Contacts } = await import('@capacitor-community/contacts');

            // Check/Request Permissions
            const perm = await Contacts.requestPermissions();
            if (perm.contacts !== 'granted') {
                setPermissionStatus('denied');
                setIsLoading(false);
                return;
            }
            setPermissionStatus('granted');

            // Fetch Contacts
            // Projection: name, phones
            const result = await Contacts.getContacts({
                projection: {
                    name: true,
                    phones: true
                }
            });

            const processed: ImportedContact[] = [];
            const seenPhones = new Set<string>(); // De-duplicate within import list

            for (const c of result.contacts) {
                const name = c.name?.display || '이름 없음';
                // Take first phone number
                const phone = c.phones?.[0]?.number;

                if (phone) {
                    const normalized = phone.replace(/[^0-9]/g, ''); // Simple normalization
                }

                if (phone) {
                    const normalized = phone.replace(/[^0-9]/g, ''); // Simple normalization

                    if (normalized.length > 8 && !seenPhones.has(normalized)) {
                        // Check if already in app (existingContacts)
                        const isAlreadyInApp = existingContacts.some(
                            ec => (ec.phoneNumber || ec.phone.replace(/[^0-9]/g, '')) === normalized
                        );

                        if (!isAlreadyInApp) {
                            seenPhones.add(normalized);
                            processed.push({
                                id: c.contactId,
                                name: name,
                                phone: phone,
                                phoneNumber: normalized, // store normalized too
                                isSelected: false,
                                avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
                            });
                        }
                    }
                }
            }

            // Sort by Name
            processed.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
            setRawContacts(processed);

        } catch (e) {
            console.error("Failed to load contacts", e);
            alert("연락처를 불러오는 데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSelect = (id: string) => {
        setRawContacts(prev => {
            const next = prev.map(c => c.id === id ? { ...c, isSelected: !c.isSelected } : c);
            setSelectedCount(next.filter(c => c.isSelected).length);
            return next;
        });
    };

    const handleImportAction = () => {
        const selected = rawContacts.filter(c => c.isSelected);
        if (selected.length === 0) return;

        // Convert to App Contact format
        const contactsToImport: Contact[] = selected.map(c => ({
            id: `import_${Date.now()}_${c.id}`,
            name: c.name,
            phone: c.phone,
            phoneNumber: c.phoneNumber,
            isFavorite: false,
            type: 'phone',
            group: targetGroupId, // Assign selected group
            groups: [targetGroupId]
        }));

        onImport(contactsToImport, targetGroupId);
        onClose();
    };

    const filtered = rawContacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phoneNumber.includes(searchQuery)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col animate-in fade-in duration-200">

            {/* 1. Header */}
            <div className="pt-safe flex items-center justify-between px-4 bg-[#1a1a1a] border-b border-gray-800">
                <h2 className="text-lg font-bold text-white py-4">연락처 불러오기</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* 2. Search Bar */}
            <div className="p-4 bg-[#1a1a1a] border-b border-gray-800">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="이름 또는 번호 검색"
                        className="pl-12 h-12 bg-[#2a2a2a] border-0 rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:ring-accent"
                    />
                </div>
            </div>

            {/* 3. List Content */}
            <div className="flex-1 overflow-y-auto bg-black p-4 space-y-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
                        <p className="text-sm">연락처를 불러오는 중...</p>
                    </div>
                ) : permissionStatus === 'denied' ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
                        <p className="text-center whitespace-pre-line">
                            {'연락처 접근 권한이 필요합니다.\n설정 > 앱 > Arriving Soon > 권한에서\n연락처 접근을 허용해주세요.'}
                        </p>
                        <Button onClick={loadContacts} variant="outline" className="border-gray-600 text-white">
                            다시 시도
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p>검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    /* Contact List Item */
                    filtered.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => handleToggleSelect(contact.id)}
                            className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${contact.isSelected ? 'bg-[#00ff88]/10 border border-[#00ff88]/30' : 'bg-[#1a1a1a] border border-gray-800 hover:bg-[#252525]'}`}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full ${contact.avatarColor || 'bg-gray-600'} flex items-center justify-center text-white font-bold text-sm mr-4 shrink-0`}>
                                {contact.name.charAt(0)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium truncate ${contact.isSelected ? 'text-[#00ff88]' : 'text-white'}`}>
                                    {contact.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                    {contact.phone}
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center ml-2 transition-all ${contact.isSelected ? 'bg-[#00ff88] border-[#00ff88]' : 'border-gray-600'}`}>
                                {contact.isSelected && <Check className="w-4 h-4 text-black stroke-[3]" />}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 4. Bottom Action Bar */}
            <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex gap-3">

                    {/* Group Selector */}
                    <div className="relative w-1/3">
                        <button
                            onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                            className="w-full h-14 bg-[#2a2a2a] rounded-xl flex items-center justify-between px-4 text-white font-medium border border-gray-700"
                        >
                            <span className="truncate text-sm">
                                {groups.find(g => g.id === targetGroupId)?.name || '그룹 없음'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {isGroupDropdownOpen && (
                            <div className="absolute bottom-full left-0 w-full mb-2 bg-[#2a2a2a] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                                <button
                                    onClick={() => { setTargetGroupId('none'); setIsGroupDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 border-b border-gray-700"
                                >
                                    그룹 없음
                                </button>
                                {groups.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => { setTargetGroupId(g.id); setIsGroupDropdownOpen(false); }}
                                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-700 border-b border-gray-700 last:border-0 flex items-center gap-2"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${g.color.replace('text-', 'bg-')}`} />
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Import Button */}
                    <Button
                        onClick={handleImportAction}
                        disabled={selectedCount === 0}
                        className="flex-1 h-14 bg-[#00ff88] hover:bg-[#00dd77] text-black font-bold text-lg rounded-xl disabled:opacity-30 disabled:grayscale transition-all"
                    >
                        {selectedCount > 0 ? `${selectedCount}명 선택 완료` : '연락처 선택'}
                    </Button>
                </div>
            </div>

        </div>
    );
}
