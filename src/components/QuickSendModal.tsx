import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, UserPlus } from 'lucide-react';
import { QuickSendPreset, QuickSendRecipient } from '../types/quickSend';

interface QuickSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preset: QuickSendPreset) => void;
    onDelete?: (id: string) => void;
    initialPreset?: QuickSendPreset | null;
    contacts?: Array<{ id?: string; name: string; phone: string }>;
}

const CATEGORIES: Array<'가족' | '업무' | '그룹' | '기타'> = ['가족', '업무', '그룹', '기타'];

export const QuickSendModal: React.FC<QuickSendModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialPreset,
    contacts = []
}) => {
    const [category, setCategory] = useState<'가족' | '업무' | '그룹' | '기타'>('가족');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState<QuickSendRecipient[]>([
        { name: '', phone: '' }
    ]);
    const [showContactPicker, setShowContactPicker] = useState(false);

    useEffect(() => {
        if (initialPreset) {
            setCategory(initialPreset.category);
            setTitle(initialPreset.title);
            setMessage(initialPreset.message);
            setRecipients(
                initialPreset.recipients.length > 0
                    ? initialPreset.recipients
                    : [{ name: '', phone: '' }]
            );
        } else {
            setCategory('가족');
            setTitle('');
            setMessage('');
            setRecipients([{ name: '', phone: '' }]);
        }
    }, [initialPreset, isOpen]);

    if (!isOpen) return null;

    const handleAddRecipient = () => {
        setRecipients(prev => [...prev, { name: '', phone: '' }]);
    };

    const handleRemoveRecipient = (idx: number) => {
        if (recipients.length <= 1) {
            setRecipients([{ name: '', phone: '' }]);
            return;
        }
        setRecipients(prev => prev.filter((_, i) => i !== idx));
    };

    const handleRecipientChange = (idx: number, field: 'name' | 'phone', val: string) => {
        setRecipients(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
    };

    const handleSelectContact = (c: { name: string; phone: string }) => {
        // If first recipient is empty, replace it
        if (recipients.length === 1 && !recipients[0].name && !recipients[0].phone) {
            setRecipients([{ name: c.name, phone: c.phone }]);
        } else {
            // Check if already added
            if (!recipients.some(r => r.phone === c.phone)) {
                setRecipients(prev => [...prev, { name: c.name, phone: c.phone }]);
            }
        }
        setShowContactPicker(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('제목(대상 이름)을 입력해주세요.');
            return;
        }
        if (!message.trim()) {
            alert('전송할 메시지 내용을 입력해주세요.');
            return;
        }

        const validRecipients = recipients
            .map(r => ({ name: r.name.trim() || title.trim(), phone: r.phone.replace(/[^0-9]/g, '') }))
            .filter(r => r.phone.length >= 8);

        if (validRecipients.length === 0) {
            alert('최소 1개 이상의 올바른 전화번호를 입력해주세요.');
            return;
        }

        const newPreset: QuickSendPreset = {
            id: initialPreset ? initialPreset.id : `preset-${Date.now()}`,
            category,
            title: title.trim(),
            recipients: validRecipients,
            message: message.trim(),
            order: initialPreset ? initialPreset.order : Date.now()
        };

        onSave(newPreset);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
            <div className="bg-[#182822] border border-[#234338] text-white w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#234338]">
                    <h2 className="text-lg font-bold text-white">
                        {initialPreset ? '빠른 문자 수정' : '새 빠른 문자 등록'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">카테고리</label>
                        <div className="flex gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                                        category === cat
                                            ? 'bg-[#00E57D] text-black border-[#00E57D]'
                                            : 'bg-[#12201b] text-gray-300 border-[#234338] hover:bg-white/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            대상 명칭 / 별칭
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="예: 아내, 거래처A, 학부모 등"
                            className="w-full bg-[#12201b] border border-[#234338] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                        />
                    </div>

                    {/* Recipients */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-gray-300">
                                받는 사람 (전화번호)
                            </label>
                            {contacts.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowContactPicker(prev => !prev)}
                                    className="text-xs text-[#00E57D] hover:underline flex items-center gap-1"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    주소록에서 선택
                                </button>
                            )}
                        </div>

                        {/* Contacts quick picker dropdown */}
                        {showContactPicker && (
                            <div className="mb-3 p-2 bg-[#12201b] border border-[#234338] rounded-xl max-h-36 overflow-y-auto space-y-1">
                                <div className="text-[11px] text-gray-400 px-2 py-1 font-medium">연락처를 탭하여 추가:</div>
                                {contacts.map(c => (
                                    <button
                                        key={c.id || c.phone}
                                        type="button"
                                        onClick={() => handleSelectContact(c)}
                                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 flex justify-between items-center"
                                    >
                                        <span className="text-white font-medium">{c.name}</span>
                                        <span className="text-gray-400 text-[11px]">{c.phone}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            {recipients.map((rec, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={rec.name}
                                        onChange={e => handleRecipientChange(idx, 'name', e.target.value)}
                                        placeholder="이름(선택)"
                                        className="w-1/3 bg-[#12201b] border border-[#234338] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                                    />
                                    <input
                                        type="tel"
                                        value={rec.phone}
                                        onChange={e => handleRecipientChange(idx, 'phone', e.target.value)}
                                        placeholder="010-0000-0000"
                                        className="flex-1 bg-[#12201b] border border-[#234338] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D]"
                                    />
                                    {recipients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRecipient(idx)}
                                            className="p-2 text-red-400 hover:text-red-300 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddRecipient}
                            className="mt-2 text-xs text-[#00E57D] flex items-center gap-1 font-medium hover:underline"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            수신자 추가 (다중 발송)
                        </button>
                    </div>

                    {/* Message content */}
                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1.5">
                            전송될 메시지 내용
                        </label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="운전 중 바로 전송할 문구를 작성해주세요."
                            rows={3}
                            className="w-full bg-[#12201b] border border-[#234338] rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E57D] resize-none"
                        />
                    </div>

                    {/* Notice */}
                    <p className="text-[11px] text-gray-400">
                        💡 발송 시 본인 휴대폰 요금제의 기본 무료 문자로 발송되며, 추가 비용은 0원입니다.
                    </p>

                    {/* Submit Buttons */}
                    <div className="pt-2 flex gap-2">
                        {initialPreset && onDelete && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (confirm('이 빠른 문자 프리셋을 삭제하시겠습니까?')) {
                                        onDelete(initialPreset.id);
                                        onClose();
                                    }
                                }}
                                className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-sm font-bold transition-colors"
                            >
                                삭제
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-[#00E57D] hover:bg-[#00C56A] text-black font-bold text-sm rounded-xl shadow-lg transition-colors"
                        >
                            {initialPreset ? '수정 완료' : '저장하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
