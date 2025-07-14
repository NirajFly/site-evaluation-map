'use client';

import { Ruler } from 'lucide-react';

interface DatacenterDistanceToggleProps {
    showDistances: boolean;
    onToggle: (show: boolean) => void;
}

export default function DatacenterDistanceToggle({
    showDistances,
    onToggle
}: DatacenterDistanceToggleProps) {
    return (
        <div className="absolute top-28 left-80 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-3">
                    <Ruler 
                        size={20} 
                        className={`${showDistances ? 'text-gray-700' : 'text-gray-400'} transition-colors`} 
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            DC Distances
                        </label>
                    </div>
                    <button
                        onClick={() => onToggle(!showDistances)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            showDistances ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={showDistances}
                        aria-label="Toggle datacenter distance visibility"
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showDistances ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}