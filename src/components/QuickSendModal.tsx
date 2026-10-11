import React, { useState, useEffect } from 'react';
import { X, Check, Search, Users, Trash2, Smartphone, UserPlus } from 'lucide-react';
import { QuickSendPreset, QuickSendRecipient } from '../types/quickSend';
import { ContactImportModal } from './ContactImportModal';
import type { Contact } from '../App';

interface QuickSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preset: QuickSendPreset) => void;
    onDelete?: (id: string) => void;
    initialPreset?: QuickSendPreset | null;
    contacts?: Contact[];
    onUpdateContacts?: (contacts: Contact[]) => void;
}

const CATEGORIES: Array<'가족' | '업무' | '그룹' | '기타'> = ['가족', '업무', '그룹', '기타'];

const QUICK_MESSAGE_TEMPLATES = [
    '지금 가고 있어. 나오세요.',
    '차가 막히네요. 조금만 더 기다려 주세요.',
    '안녕하세요. 곧 도착합니다. 안전운전하겠습니다.',
    '출발했습니다. 10분 뒤 도착 예정입니다.'
];

const DEFAULT_GROUPS = [
    { id: 'family', name: '가족', color: 'text-pink-400' },
    { id: 'work', name: '직장', color: 'text-purple-400' },
    { id: 'friends', name: '친구', color: 'text-blue-400' },
    { id: 'vip', name: 'VIP', color: 'text-yellow-400' },
    { id: 'none', name: '기본', color: 'text-gray-400' }
];

export const QuickSendModal: React.FC<QuickSendModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialPreset,
    contacts = [],
    onUpdateContacts
}) => {
    const [category, setCategory] = useState<'가족' | '업무' | '그룹' | '기타'>('가족');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedPhones, setSelectedPhones] = useState<Map<string, string>>(new Map()); // phone -> name
    const [searchQuery, setSearchQuery] = useState('');

    // State for Phone Address Book Import Modal
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // State for Quick Direct Add Contact
    const [showDirectAdd, setShowDirectAdd] = useState(false);
    const [directName, setDirectName] = useState('');
    const [directPhone, setDirectPhone] = useState('');

    useEffect(() => {
        if (initialPreset) {
            setCategory(initialPreset.category);
            setTitle(initialPreset.title);
            setMessage(initialPreset.message);
            const map = new Map<string, string>();
            initialPreset.recipients.forEach(r => {
                map.set(r.phone.replace(/[^0-9]/g, ''), r.name);
            });
            setSelectedPhones(map);
        } else {
            setCategory('가족');
            setTitle('');
            setMessage('');
            setSelectedPhones(new Map());
        }
        setSearchQuery('');
        setShowDirectAdd(false);
        setDirectName('');
        setDirectPhone('');
    }, [initialPreset, isOpen]);

    if (!isOpen) return null;

    const handleToggleContact = (c: Contact) => {
        const rawPhone = (c.phoneNumber || c.phone || '').replace(/[^0-9]/g, '');
        if (!rawPhone) return;

        setSelectedPhones(prev => {
            const next = new Map(prev);
            if (next.has(rawPhone)) {
                next.delete(rawPhone);
            } else {
                next.set(rawPhone, c.name);
            }

            // Auto-update title if not manually edited or if creating new
            if (next.size === 1) {
                const firstVal = Array.from(next.values())[0];
                setTitle(firstVal);
            } else if (next.size > 1) {
                const firstVal = Array.from(next.values())[0];
                setTitle(`${firstVal} 외 ${next.size - 1}명`);
                if (category === '가족') setCategory('그룹');
            } else {
                setTitle('');
            }

            return next;
        });
    };

    // Handle importing contacts from Phone Address Book
    const handleImportFromPhone = (importedContacts: Contact[], targetGroupId: string) => {
        const newContacts = [...contacts];
        let addedCount = 0;

        importedContacts.forEach(newC => {
            const norm = (newC.phoneNumber || newC.phone || '').replace(/[^0-9]/g, '');
            const isDup = newContacts.some(
                existing => (existing.phoneNumber || existing.phone || '').replace(/[^0-9]/g, '') === norm
            );
            if (!isDup) {
                newContacts.push({
                    ...newC,
                    group: targetGroupId,
                    groups: [targetGroupId]
                });
                addedCount++;
            }
        });

        // Sync with app-wide contacts (예약하기 > 연락처 관리)
        if (onUpdateContacts) {
            onUpdateContacts(newContacts);
        }

        // Auto-select the newly imported contacts in this preset
        setSelectedPhones(prev => {
            const next = new Map(prev);
            importedContacts.forEach(c => {
                const rawPhone = (c.phoneNumber || c.phone || '').replace(/[^0-9]/g, '');
                if (rawPhone) {
                    next.set(rawPhone, c.name);
                }
            });

            if (next.size === 1) {
                const firstVal = Array.from(next.values())[0];
                setTitle(firstVal);
            } else if (next.size > 1) {
                const firstVal = Array.from(next.values())[0];
                setTitle(`${firstVal} 외 ${next.size - 1}명`);
                if (category === '가족') setCategory('그룹');
            }

            return next;
        });

        setIsImportModalOpen(false);
    };

    // Handle Quick Direct Add Contact
    const handleDirectAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanPhone = directPhone.replace(/[^0-9]/g, '');
        if (!directName.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        if (cleanPhone.length < 8) {
            alert('올바른 전화번호를 입력해주세요.');
            return;
        }

        const newContactItem: Contact = {
            id: `contact-${Date.now()}`,
            name: directName.trim(),
            phone: cleanPhone,
            phoneNumber: cleanPhone,
            isFavorite: false,
            type: 'phone',
            group: 'none',
            groups: ['none']
        };

        // Sync with app-wide contacts (예약하기 > 연락처 관리)
        if (onUpdateContacts) {
            onUpdateContacts([...contacts, newContactItem]);
        }

        // Auto-select in this preset
        setSelectedPhones(prev => {
            const next = new Map(prev);
            next.set(cleanPhone, directName.trim());
            if (next.size === 1) {
                setTitle(directName.trim());
            } else if (next.size > 1) {
                const firstVal = Array.from(next.values())[0];
                setTitle(`${firstVal} 외 ${next.size - 1}명`);
            }
            return next;
        });

        setDirectName('');
        setDirectPhone('');
        setShowDirectAdd(false);
    };

    const filteredContacts = contacts.filter(c => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        const name = (c.name || '').toLowerCase();
        const phone = (c.phoneNumber || c.phone || '').replace(/[^0-9]/g, '');
        return name.includes(query) || phone.includes(query);
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPhones.size === 0) {
            alert('연락처 목록에서 최소 1명 이상의 대상을 선택해주세요.');
            return;
        }

        if (!title.trim()) {
            alert('대상 명칭(예: 아내, 거래처A 등)을 입력해주세요.');
            return;
        }

        if (!message.trim()) {
            alert('전송할 메시지 내용을 입력해주세요.');
            return;
        }

        const recipients: QuickSendRecipient[] = Array.from(selectedPhones.entries()).map(([phone, name]) => ({
            name: name || title.trim(),
            phone
        }));

        const newPreset: QuickSendPreset = {
            id: initialPreset ? initialPreset.id : `preset-${Date.now()}`,
            category,
            title: title.trim(),
            recipients,
            message: message.trim(),
            order: initialPreset ? initialPreset.order : Date.now()
        };

        onSave(newPreset);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 select-none">
                <div className="bg-[#14241F] border border-[#234338] text-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#234338] shrink-0">
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            {initialPreset ? '빠른 문자 수정' : '새 빠른 문자 등록'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">카테고리</label>
                            <div className="flex gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                                            category === cat
                                                ? 'bg-[#00E57D] text-black border-[#00E57D] shadow-md'
                                                : 'bg-[#0B1512] text-gray-300 border-[#234338] hover:bg-white/5'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 1: Contact Picker with 2-Way Sync Buttons */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-[#00E57D]" />
                                    연락처 선택
                                    <span className="text-[#00E57D] font-bold">
                                        ({selectedPhones.size}명 선택됨)
                                    </span>
                                </label>
                            </div>

                            {/* Two-Way Import Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="py-2 px-2.5 bg-[#1B3229] hover:bg-[#254438] active:scale-95 text-[#00E57D] border border-[#254438] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                >
                                    <Smartphone className="w-3.5 h-3.5" />
                                    내 폰 연락처 가져오기
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDirectAdd(prev => !prev)}
                                    className="py-2 px-2.5 bg-[#1B3229] hover:bg-[#254438] active:scale-95 text-gray-200 border border-[#254438] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                                >
                                    <UserPlus className="w-3.5 h-3.5 text-[#00E57D]" />
                                    {showDirectAdd ? '직접 입력 닫기' : '+ 직접 등록'}
                                </button>
                            </div>

                            {/* Direct Add Inline Form (Two-Way Synced) */}
                            {showDirectAdd && (
                                <div className="mb-3 p-3 bg-[#0B1512] border border-[#00E57D]/30 rounded-2xl space-y-2.5 animate-fadeIn">
                                    <div className="text-[11px] font-bold text-[#00E57D] flex items-center gap-1">
                                        <span>새 연락처 직접 등록 (예약하기 연락처와 자동 동기화)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={directName}
                                            onChange={e => setDirectName(e.target.value)}
                                            placeholder="이름"
                                            className="w-1/3 bg-[#14241F] border border-[#234338] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                                        />
                                        <input
                                            type="tel"
                                            value={directPhone}
                                            onChange={e => setDirectPhone(e.target.value)}
                                            placeholder="010-0000-0000"
                                            className="flex-1 bg-[#14241F] border border-[#234338] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDirectAddSubmit}
                                        className="w-full py-2 bg-[#00E57D] hover:bg-[#00C56A] text-black font-bold text-xs rounded-xl transition-all"
                                    >
                                        연락처 저장 및 자동 선택
                                    </button>
                                </div>
                            )}

                            {/* Search contacts input */}
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="연락처 검색 (이름 또는 전화번호)"
                                    className="w-full bg-[#0B1512] border border-[#234338] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                                />
                            </div>

                            {/* Contacts scroll list */}
                            <div className="bg-[#0B1512] border border-[#234338] rounded-2xl p-2 max-h-44 overflow-y-auto space-y-1">
                                {filteredContacts.length > 0 ? (
                                    filteredContacts.map(c => {
                                        const rawPhone = (c.phoneNumber || c.phone || '').replace(/[^0-9]/g, '');
                                        const isSelected = selectedPhones.has(rawPhone);
                                        return (
                                            <button
                                                key={c.id || rawPhone}
                                                type="button"
                                                onClick={() => handleToggleContact(c)}
                                                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                                                    isSelected
                                                        ? 'bg-[#00E57D]/15 border border-[#00E57D]/40 text-white'
                                                        : 'hover:bg-white/5 border border-transparent text-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isSelected
                                                            ? 'bg-[#00E57D] text-black'
                                                            : 'bg-[#182C24] text-gray-400'
                                                    }`}>
                                                        {c.name ? c.name.charAt(0) : '?'}
                                                    </div>
                                                    <div className="truncate">
                                                        <div className="font-bold text-white truncate">{c.name}</div>
                                                        <div className="text-[11px] text-gray-400">{c.phoneNumber || c.phone}</div>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                                                    isSelected
                                                        ? 'bg-[#00E57D] border-[#00E57D] text-black'
                                                        : 'border-gray-600'
                                                }`}>
                                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-5 text-gray-400 text-xs space-y-2">
                                        <p>등록된 연락처가 없습니다.</p>
                                        <button
                                            type="button"
                                            onClick={() => setIsImportModalOpen(true)}
                                            className="px-3 py-1.5 bg-[#00E57D]/20 text-[#00E57D] border border-[#00E57D]/30 rounded-lg text-xs font-semibold hover:bg-[#00E57D]/30"
                                        >
                                            📱 내 폰 주소록 가져오기
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Target Title / Alias */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                대상 명칭 / 별칭
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="연락처 선택 시 자동 입력 (예: 아내, 거래처A, 학부모 등)"
                                className="w-full bg-[#0B1512] border border-[#234338] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                            />
                        </div>

                        {/* Step 3: Message Text */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                                전송될 메시지 내용
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="운전 중 버튼 한 번으로 전송할 문구를 작성해주세요."
                                rows={3}
                                className="w-full bg-[#0B1512] border border-[#234338] rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D] resize-none"
                            />

                            {/* Quick Template Chips */}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {QUICK_MESSAGE_TEMPLATES.map((tmpl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setMessage(tmpl)}
                                        className="text-[11px] bg-[#0B1512] hover:bg-[#00E57D]/10 hover:text-[#00E57D] border border-[#234338] text-gray-400 px-2.5 py-1 rounded-lg transition-colors truncate max-w-full text-left"
                                    >
                                        💬 {tmpl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notice */}
                        <div className="p-3 bg-[#0B1512] border border-[#182C24] rounded-xl text-[11px] text-gray-400">
                            💡 발송 시 본인 휴대폰 통신사의 기본 무료 문자로 즉시 발송되며, 추가 비용은 0원입니다.
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex gap-2">
                            {initialPreset && onDelete && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('이 빠른 문자를 삭제하시겠습니까?')) {
                                            onDelete(initialPreset.id);
                                            onClose();
                                        }
                                    }}
                                    className="px-4 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    삭제
                                </button>
                            )}
                            <button
                                type="submit"
                                className="flex-1 py-3.5 bg-[#00E57D] hover:bg-[#00C56A] active:scale-95 text-black font-extrabold text-sm rounded-xl shadow-lg transition-all"
                            >
                                {initialPreset ? '수정 완료' : '저장하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sub-modal: ContactImportModal for importing from Phone Address Book (Two-Way Synced) */}
            <ContactImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImportFromPhone}
                existingContacts={contacts}
                groups={DEFAULT_GROUPS}
            />
        </>
    );
};
