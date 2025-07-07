import { useState } from 'react';

interface StatusFilterProps {
    selectedStatuses: string[];
    availableStatuses: string[];
    onStatusesChange: (statuses: string[]) => void;
}

const capitalizeFirst = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function StatusFilter({ selectedStatuses, availableStatuses, onStatusesChange }: StatusFilterProps) {
    const [isOpen, setIsOpen] = useState(true);

    const handleStatusChange = (status: string) => {
        const newStatuses = selectedStatuses.includes(status)
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status];
        onStatusesChange(newStatuses);
    };

    const toggleAllStatuses = () => {
        if (selectedStatuses.length === availableStatuses.length) {
            // If all are selected, deselect all
            onStatusesChange([]);
        } else {
            // If not all are selected, select all
            onStatusesChange(availableStatuses);
        }
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('operating') || statusLower.includes('operational')) {
            return 'bg-green-100 text-green-800';
        } else if (statusLower.includes('construction') || statusLower.includes('planned')) {
            return 'bg-yellow-100 text-yellow-800';
        } else if (statusLower.includes('retired') || statusLower.includes('cancelled')) {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg w-64">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 text-black hover:bg-gray-100 rounded-t-lg"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Status</span>
                </div>
                {selectedStatuses.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {selectedStatuses.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-sm">Filter by Status</h3>
                        <button
                            onClick={toggleAllStatuses}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            {selectedStatuses.length === availableStatuses.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1">
                        {availableStatuses.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">Loading statuses...</p>
                        ) : (
                            availableStatuses.sort().map(status => {
                            const isSelected = selectedStatuses.includes(status);
                            return (
                                <label 
                                    key={status} 
                                    className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors ${
                                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleStatusChange(status)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(status)}`}>
                                        {capitalizeFirst(status)}
                                    </span>
                                </label>
                            );
                        })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}