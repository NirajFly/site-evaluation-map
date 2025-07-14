import { useState } from 'react';

interface TypeFilterProps {
    selectedTypes: string[];
    availableTypes: string[];
    onTypesChange: (types: string[]) => void;
    minCapacity: number;
    maxCapacity: number;
    onCapacityChange: (min: number, max: number) => void;
}

const getTypeColor = (type: string): string => {
    const typeNormalized = type?.toLowerCase() || '';
    if (typeNormalized === 'coal' || typeNormalized === 'oil/gas') {
        return 'bg-red-500';
    } else if (typeNormalized === 'solar' || typeNormalized === 'wind') {
        return 'bg-green-500';
    }
    return 'bg-blue-500';
};

const getTypeColorLight = (type: string): string => {
    const typeNormalized = type?.toLowerCase() || '';
    if (typeNormalized === 'coal' || typeNormalized === 'oil/gas') {
        return 'bg-red-100';
    } else if (typeNormalized === 'solar' || typeNormalized === 'wind') {
        return 'bg-green-100';
    }
    return 'bg-blue-100';
};

const capitalizeFirst = (str: string): string => {
    if (!str) return '';
    if (str === 'oil/gas') return 'Oil/Gas';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function TypeFilter({ selectedTypes, availableTypes, onTypesChange, minCapacity, maxCapacity, onCapacityChange }: TypeFilterProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [capacityOpen, setCapacityOpen] = useState(false);

    const handleTypeChange = (type: string) => {
        const newTypes = selectedTypes.includes(type)
            ? selectedTypes.filter(t => t !== type)
            : [...selectedTypes, type];
        onTypesChange(newTypes);
    };

    const toggleAllTypes = () => {
        const allSelected = selectedTypes.length === availableTypes.length && 
            availableTypes.every(type => selectedTypes.includes(type));
        
        if (allSelected) {
            // If all are selected, deselect all
            onTypesChange([]);
        } else {
            // If not all are selected, select all
            onTypesChange([...availableTypes]);
        }
    };

    return (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg w-64">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 text-black hover:bg-gray-100 rounded-t-lg"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span className="font-medium">Plant Type</span>
                </div>
                {selectedTypes.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {selectedTypes.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm">Filter by Type</h3>
                        <button
                            onClick={toggleAllTypes}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            {selectedTypes.length === availableTypes.length && availableTypes.every(type => selectedTypes.includes(type)) ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {availableTypes.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">Loading types...</p>
                        ) : (
                            availableTypes.sort().map(type => {
                            const isSelected = selectedTypes.includes(type);
                            return (
                                <label 
                                    key={type} 
                                    className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors ${
                                        isSelected ? getTypeColorLight(type) : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleTypeChange(type)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center gap-2 flex-1">
                                        <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`}></div>
                                        <span className="text-sm text-black">{capitalizeFirst(type)}</span>
                                    </div>
                                </label>
                            );
                        })
                        )}
                    </div>
                    
                    {/* MW Capacity Filter */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setCapacityOpen(!capacityOpen)}
                            className="flex items-center justify-between w-full text-left mb-2"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">MW Capacity</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {minCapacity}-{maxCapacity === 10000 ? '10k+' : maxCapacity}
                                </span>
                            </div>
                            {capacityOpen ? (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>
                        
                        {capacityOpen && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Min Capacity: {minCapacity} MW</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        step="10"
                                        value={minCapacity}
                                        onChange={(e) => onCapacityChange(Number(e.target.value), maxCapacity)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Max Capacity: {maxCapacity === 10000 ? '10k+' : maxCapacity} MW</label>
                                    <input
                                        type="range"
                                        min="10"
                                        max="10000"
                                        step="50"
                                        value={maxCapacity}
                                        onChange={(e) => onCapacityChange(minCapacity, Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => onCapacityChange(0, 10000)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        Reset
                                    </button>
                                    <div className="text-xs text-gray-500">
                                        Showing {minCapacity} - {maxCapacity === 10000 ? '10k+' : maxCapacity} MW
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}