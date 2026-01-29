import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
    return (
        <div className="fixed inset-0 bg-gray-900 z-[9999] flex flex-col items-center justify-center text-white">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                <Loader2 size={64} className="animate-spin text-blue-500 relative z-10" />
            </div>
            <h2 className="mt-6 text-xl font-bold tracking-[0.2em] animate-pulse text-gray-300">INITIALIZING SYSTEM...</h2>
        </div>
    );
};

export default Loading;