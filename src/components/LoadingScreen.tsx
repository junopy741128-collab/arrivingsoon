import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f2920] text-white">
            <div className="flex flex-col items-center animate-pulse">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 to-emerald-500">
                    곧 도착해요
                </h1>
                <p className="mt-2 text-emerald-400/60 text-sm">
                    잠시만 기다려주세요...
                </p>
            </div>
        </div>
    );
};
