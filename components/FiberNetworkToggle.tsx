'use client';

import { Network } from 'lucide-react';

interface FiberNetworkToggleProps {
    showFiberNetwork: boolean;
    onToggle: (show: boolean) => void;
    loading?: boolean;
    error?: string | null;
}

export default function FiberNetworkToggle({ showFiberNetwork, onToggle, loading = false, error = null }: FiberNetworkToggleProps) {
    return (
        <div className="absolute top-32 left-4 z-20">
            <button
                onClick={() => onToggle(!showFiberNetwork)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showFiberNetwork
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } ${error ? 'border-red-300' : ''}`}
                title="Toggle Fiber Network"
                disabled={loading}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <Network size={16} />
                )}
                <span>Fiber Network</span>
                {error && (
                    <div className="w-2 h-2 bg-red-500 rounded-full" title={`Error: ${error}`}></div>
                )}
            </button>
            
            {/* Legend */}
            {showFiberNetwork && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs">
                    <div className="font-medium text-gray-700 mb-2">Fiber Network</div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-px bg-blue-500"></div>
                            <span className="text-gray-600">County open access</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-px bg-purple-500 border-dashed border-t"></div>
                            <span className="text-gray-600">MCNC middle-mile</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-px bg-green-500 border-dashed border-t-2"></div>
                            <span className="text-gray-600">Zayo long-haul</span>
                        </div>
                        <div className="border-t border-gray-200 pt-1.5 mt-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-600">Site access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                                <span className="text-gray-600">Major hubs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-600">Regional PoPs</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 