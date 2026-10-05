import { createPortal } from 'react-dom';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-app-secondary border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-status-error-bg flex items-center justify-center mb-2">
                        <LogOut className="w-8 h-8 text-status-error" />
                    </div>

                    <h3 className="text-xl font-bold text-white">로그아웃</h3>
                    <p className="text-text-muted">
                        정말 로그아웃 하시겠습니까?<br />
                        로그아웃 시 알림 설정이 초기화됩니다.
                    </p>

                    <div className="flex gap-3 w-full mt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl bg-app-tertiary text-text-primary font-medium hover:bg-white/10 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3.5 rounded-xl bg-status-error text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
