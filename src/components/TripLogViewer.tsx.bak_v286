import { showAlert } from '../utils/globalAlert';
import React, { useEffect, useState } from 'react';
import { X, RefreshCw, Trash2 } from 'lucide-react';
import { TripNotification } from '../plugins/TripNotificationPlugin';
import { ConfirmModal } from './ConfirmModal';

interface TripLogViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TripLogViewer: React.FC<TripLogViewerProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<string>('로딩 중...');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const fetchLogs = async () => {
        try {
            const result = await TripNotification.getLogs();
            setLogs(result.logs || '기록된 로그가 없습니다.');
        } catch (e) {
            setLogs('로그를 불러오는 데 실패했습니다: ' + JSON.stringify(e));
        }
    };

    const clearLogs = async () => {
        try {
            await TripNotification.clearLogs();
            setLogs('기록된 로그가 없습니다.');
        } catch (e) {
            alert('로그 초기화 실패');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
            // Auto-refresh every 3 seconds while open
            const interval = setInterval(fetchLogs, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 w-full max-w-lg h-[80vh] rounded-xl flex flex-col shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        시스템 블랙박스 (운행 기록)
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={fetchLogs} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white" title="새로고침">
                            <RefreshCw size={18} />
                        </button>
                        <button onClick={() => setIsConfirmOpen(true)} className="p-2 bg-red-900/50 rounded-full hover:bg-red-700 text-red-200" title="로그 삭제">
                            <Trash2 size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-green-400 bg-black leading-relaxed whitespace-pre-wrap">
                    {logs}
                </div>

                <div className="p-3 bg-gray-800 text-center text-gray-400 text-xs border-t border-gray-700 rounded-b-xl">
                    실시간으로 서비스 동작을 모니터링 중입니다.
                </div>
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={clearLogs}
                title="운행 기록 삭제"
                message="저장된 모든 시스템 로그를 삭제하시겠습니까?"
                confirmText="삭제"
                isDestructive={true}
            />
        </div>
    );
};
