'use client';

import { Building2 } from 'lucide-react';

interface DatacentersToggleProps {
    showDatacenters: boolean;
    onToggle: (show: boolean) => void;
    datacenterCount?: number;
    loading?: boolean;
}

export default function DatacentersToggle({
    showDatacenters,
    onToggle,
    datacenterCount,
    loading = false
}: DatacentersToggleProps) {
    return (
        <div className="absolute top-4 left-80 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-3">
                    <Building2 
                        size={20} 
                        className={`${showDatacenters ? 'text-gray-700' : 'text-gray-400'} transition-colors`} 
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            Data Centers
                        </label>
                        {datacenterCount !== undefined && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {loading ? '...' : datacenterCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => onToggle(!showDatacenters)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            showDatacenters ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={showDatacenters}
                        aria-label="Toggle datacenter visibility"
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showDatacenters ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
                
                {showDatacenters && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Operational</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>Construction</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Planned</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 