'use client';

import { Network } from 'lucide-react';

interface FiberInfrastructureToggleProps {
    showFiberInfrastructure: boolean;
    onToggle: (show: boolean) => void;
    accessPointCount?: number;
    loading?: boolean;
}

export default function FiberInfrastructureToggle({
    showFiberInfrastructure,
    onToggle,
    accessPointCount = 9, // Default count of access points
    loading = false
}: FiberInfrastructureToggleProps) {
    return (
        <div className="absolute top-4 left-4 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-3">
                    <Network 
                        size={20} 
                        className={`${showFiberInfrastructure ? 'text-gray-700' : 'text-gray-400'} transition-colors`} 
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            Fiber Access Points
                        </label>
                        {accessPointCount !== undefined && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {loading ? '...' : accessPointCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => onToggle(!showFiberInfrastructure)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            showFiberInfrastructure ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={showFiberInfrastructure}
                        aria-label="Toggle fiber infrastructure visibility"
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showFiberInfrastructure ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
                
                {showFiberInfrastructure && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Site Access</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Staley ROW</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>MCNC POP</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                                <span>Backbone Hub</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 