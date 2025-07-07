import { useState, useEffect } from 'react';
import { PowerPlant } from '@/lib/supabase';

interface FilterPanelProps {
    filters: {
        type?: string[];
        status?: string[];
    };
    onFiltersChange: (filters: { type?: string[]; status?: string[] }) => void;
    plants: PowerPlant[];
}

export default function FilterPanel({ filters, onFiltersChange, plants }: FilterPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

    useEffect(() => {
        // Extract unique types and statuses from plants
        const types = [...new Set(plants.map(p => p.type).filter(Boolean))] as string[];
        const statuses = [...new Set(plants.map(p => p.status).filter(Boolean))] as string[];
        
        setAvailableTypes(types.sort());
        setAvailableStatuses(statuses.sort());
    }, [plants]);

    const handleTypeChange = (type: string) => {
        const currentTypes = filters.type || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter(t => t !== type)
            : [...currentTypes, type];
        
        onFiltersChange({
            ...filters,
            type: newTypes.length > 0 ? newTypes : undefined
        });
    };

    const handleStatusChange = (status: string) => {
        const currentStatuses = filters.status || [];
        const newStatuses = currentStatuses.includes(status)
            ? currentStatuses.filter(s => s !== status)
            : [...currentStatuses, status];
        
        onFiltersChange({
            ...filters,
            status: newStatuses.length > 0 ? newStatuses : undefined
        });
    };

    const clearFilters = () => {
        onFiltersChange({});
    };

    return (
        <div className={`absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg transition-all ${
            isOpen ? 'w-80' : 'w-auto'
        }`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {(filters.type?.length || filters.status?.length) ? (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {(filters.type?.length || 0) + (filters.status?.length || 0)}
                    </span>
                ) : null}
            </button>

            {isOpen && (
                <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Filter Options</h3>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Plant Type</h4>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                            {availableTypes.map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.type?.includes(type) || false}
                                        onChange={() => handleTypeChange(type)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Status</h4>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                            {availableStatuses.map(status => (
                                <label key={status} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="checkbox"
                                        checked={filters.status?.includes(status) || false}
                                        onChange={() => handleStatusChange(status)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm">{status}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}