'use client';

import { MapPin } from 'lucide-react';

interface DatacenterProximityToggleProps {
    showProximity: boolean;
    onToggle: (show: boolean) => void;
    loading?: boolean;
}

export default function DatacenterProximityToggle({
    showProximity,
    onToggle,
    loading = false
}: DatacenterProximityToggleProps) {
    return (
        <div className="absolute top-96 left-4 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="flex items-center space-x-3">
                    <MapPin 
                        size={20} 
                        className={`${showProximity ? 'text-gray-700' : 'text-gray-400'} transition-colors`} 
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            Proximity Map
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {loading ? '...' : 'Distance Lines'}
                        </span>
                    </div>
                    <button
                        onClick={() => onToggle(!showProximity)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            showProximity ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        role="switch"
                        aria-checked={showProximity}
                        aria-label="Toggle datacenter proximity visualization"
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showProximity ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
                
                {showProximity && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-600">
                            <p className="mb-1">Shows distances from Siler City to:</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Major Data Centers</span>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Key Cities</span>
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Cloud Hubs</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 