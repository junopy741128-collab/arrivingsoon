import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
}

export function InputModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    placeholder = '',
    defaultValue = '',
    confirmText = '확인',
    cancelText = '취소',
}: InputModalProps) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        if (!value.trim()) return;
        onConfirm(value);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="
                max-w-[320px] rounded-2xl p-0 overflow-hidden 
                bg-[#1a3d32] border border-gray-700 shadow-2xl
                flex flex-col text-white
            ">
                <div className="p-6 pb-2 w-full flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-center tracking-tight">
                        {title}
                    </h2>

                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="bg-[#0f2920] border-gray-600 focus-visible:ring-[#00ff88] text-white h-12 rounded-xl text-center"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirm();
                        }}
                    />
                </div>

                <div className="flex gap-2 p-6 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 h-12 rounded-xl bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920] font-bold transition-colors disabled:opacity-50"
                        disabled={!value.trim()}
                    >
                        {confirmText}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
