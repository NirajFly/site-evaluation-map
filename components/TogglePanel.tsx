'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, Network, Activity, Wifi, Globe } from 'lucide-react';

interface TogglePanelProps {
    // Proximity map
    showDatacenterProximity: boolean;
    onDatacenterProximityToggle: (show: boolean) => void;
    
    // Fiber network
    showFiberNetwork: boolean;
    onFiberNetworkToggle: (show: boolean) => void;
    
    // Plant status
    selectedStatuses: string[];
    availableStatuses: string[];
    onStatusesChange: (statuses: string[]) => void;
    
    // Fiber access points
    showFiberInfrastructure: boolean;
    onFiberInfrastructureToggle: (show: boolean) => void;
    
    // Data centers
    showDatacenters: boolean;
    onDatacentersToggle: (show: boolean) => void;
    datacenterCount?: number;
    datacenterLoading?: boolean;
    
    // Datacenter children
    showDatacenterDistances: boolean;
    onDatacenterDistancesToggle: (show: boolean) => void;
    maxDatacenterDistance: number;
    onDistanceChange: (distance: number) => void;
}

export default function TogglePanel({
    showDatacenterProximity,
    onDatacenterProximityToggle,
    showFiberNetwork,
    onFiberNetworkToggle,
    selectedStatuses,
    availableStatuses,
    onStatusesChange,
    showFiberInfrastructure,
    onFiberInfrastructureToggle,
    showDatacenters,
    onDatacentersToggle,
    datacenterCount,
    datacenterLoading,
    showDatacenterDistances,
    onDatacenterDistancesToggle,
    maxDatacenterDistance,
    onDistanceChange
}: TogglePanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [statusFilterOpen, setStatusFilterOpen] = useState(false);

    const handleStatusChange = (status: string) => {
        const newStatuses = selectedStatuses.includes(status)
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status];
        onStatusesChange(newStatuses);
    };

    const toggleAllStatuses = () => {
        const allSelected = selectedStatuses.length === availableStatuses.length;
        onStatusesChange(allSelected ? [] : [...availableStatuses]);
    };

    return (
        <div className="absolute top-4 left-4 z-40">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors rounded-lg w-full"
                >
                    <Network size={18} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Map Controls</span>
                    {isOpen ? (
                        <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                    )}
                </button>
                
                {isOpen && (
                    <div className="p-4 border-t space-y-4 min-w-[250px]">
                        {/* Proximity Map */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Globe size={16} className="text-gray-600" />
                                <span className="text-sm text-gray-700">Proximity Map</span>
                            </div>
                            <button
                                onClick={() => onDatacenterProximityToggle(!showDatacenterProximity)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    showDatacenterProximity ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        showDatacenterProximity ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Fiber Network */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Network size={16} className="text-gray-600" />
                                <span className="text-sm text-gray-700">Fiber Network</span>
                            </div>
                            <button
                                onClick={() => onFiberNetworkToggle(!showFiberNetwork)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    showFiberNetwork ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        showFiberNetwork ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Fiber Access Points */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Wifi size={16} className="text-gray-600" />
                                <span className="text-sm text-gray-700">Fiber Access Points</span>
                            </div>
                            <button
                                onClick={() => onFiberInfrastructureToggle(!showFiberInfrastructure)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    showFiberInfrastructure ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        showFiberInfrastructure ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Plant Status Filter */}
                        <div className="border-t pt-4">
                            <button
                                onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <div className="flex items-center space-x-2">
                                    <Activity size={16} className="text-gray-600" />
                                    <span className="text-sm text-gray-700">Plant Status</span>
                                    {selectedStatuses.length > 0 && (
                                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                            {selectedStatuses.length}
                                        </span>
                                    )}
                                </div>
                                {statusFilterOpen ? (
                                    <ChevronUp size={14} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={14} className="text-gray-400" />
                                )}
                            </button>
                            
                            {statusFilterOpen && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={toggleAllStatuses}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            {selectedStatuses.length === availableStatuses.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {availableStatuses.map(status => (
                                            <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStatuses.includes(status)}
                                                    onChange={() => handleStatusChange(status)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{status}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Data Centers */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <Building2 size={16} className="text-gray-600" />
                                    <span className="text-sm text-gray-700">Data Centers</span>
                                    {datacenterCount !== undefined && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {datacenterLoading ? '...' : datacenterCount}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => onDatacentersToggle(!showDatacenters)}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                        showDatacenters ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                            showDatacenters ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Datacenter Children */}
                            {showDatacenters && (
                                <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-3">
                                    {/* Distance Lines */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Distance Lines</span>
                                        <button
                                            onClick={() => onDatacenterDistancesToggle(!showDatacenterDistances)}
                                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                                                showDatacenterDistances ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                                                    showDatacenterDistances ? 'translate-x-4' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    
                                    {/* Distance Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-600">Max Distance: {maxDatacenterDistance}mi</label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="1000"
                                            step="50"
                                            value={maxDatacenterDistance}
                                            onChange={(e) => onDistanceChange(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}