import { Dialog, DialogContent } from './ui/dialog';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    buttonText?: string;
}

export function AlertModal({
    isOpen,
    onClose,
    title = '알림',
    message,
    buttonText = '확인',
}: AlertModalProps) {
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

                <div className="w-full px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full h-12 rounded-xl bg-[#00ff88] hover:bg-[#00dd77] active:scale-[0.98] transition-all flex items-center justify-center text-[#0f2920] font-bold text-base"
                    >
                        {buttonText}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
