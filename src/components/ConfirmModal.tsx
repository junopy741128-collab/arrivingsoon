import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    isDestructive = false,
}: ConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="
                max-w-[320px] rounded-2xl p-0 overflow-hidden 
                bg-[#1a3d32] border border-gray-700 shadow-2xl
                flex flex-col items-center text-center text-white
            ">
                <div className="p-6 pb-4 w-full flex flex-col items-center gap-3">
                    {title && (
                        <h2 className="text-lg font-bold tracking-tight">
                            {title}
                        </h2>
                    )}
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {message}
                    </div>
                </div>

                <div className="flex w-full gap-2 p-6 pt-2">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 h-12 rounded-xl font-bold transition-colors text-white
                            ${isDestructive
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-[#00ff88] hover:bg-[#00dd77] text-[#0f2920]'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
