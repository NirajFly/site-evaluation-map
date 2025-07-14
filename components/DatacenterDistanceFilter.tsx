'use client';

import { Radius } from 'lucide-react';

interface DatacenterDistanceFilterProps {
    maxDistance: number;
    onDistanceChange: (distance: number) => void;
}

export default function DatacenterDistanceFilter({
    maxDistance,
    onDistanceChange
}: DatacenterDistanceFilterProps) {
    return (
        <div className="absolute top-40 left-80 z-10">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64">
                <div className="flex items-center space-x-3 mb-3">
                    <Radius 
                        size={20} 
                        className="text-gray-700" 
                    />
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                            Max Distance
                        </label>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {maxDistance} mi
                        </span>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <input
                        type="range"
                        min="50"
                        max="1000"
                        step="25"
                        value={maxDistance}
                        onChange={(e) => onDistanceChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((maxDistance - 50) / (1000 - 50)) * 100}%, #e5e7eb ${((maxDistance - 50) / (1000 - 50)) * 100}%, #e5e7eb 100%)`
                        }}
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>50 mi</span>
                        <span>1000 mi</span>
                    </div>
                </div>
            </div>
        </div>
    );
}