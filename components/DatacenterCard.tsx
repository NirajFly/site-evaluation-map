'use client';

import { X, MapPin, Building2, Zap, Calendar, AlertCircle } from 'lucide-react';
import { DatacenterLocation } from '@/hooks/useDatacenterLocations';

interface DatacenterCardProps {
    datacenter: DatacenterLocation;
    position?: { x: number; y: number };
    onClose: () => void;
    distanceFromSilerCity?: number; // Distance in miles
}

export default function DatacenterCard({ 
    datacenter, 
    position, 
    onClose,
    distanceFromSilerCity 
}: DatacenterCardProps) {
    
    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('operational')) {
            return 'bg-green-100 text-green-800 border-green-200';
        } else if (statusLower.includes('construction') || statusLower.includes('ground broken') || statusLower.includes('site work')) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        } else if (statusLower.includes('planned')) {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        } else if (statusLower.includes('partially')) {
            return 'bg-purple-100 text-purple-800 border-purple-200';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getTypeIcon = (type: string) => {
        const typeLower = type.toLowerCase();
        if (typeLower.includes('hyperscale')) {
            return '🏢'; // Large building
        } else if (typeLower.includes('colocation')) {
            return '🏬'; // Department store
        } else if (typeLower.includes('enterprise')) {
            return '🏭'; // Factory
        }
        return '💻'; // Computer
    };

    const getPowerDisplay = () => {
        if (datacenter.power_capacity_numeric) {
            return `${datacenter.power_capacity_numeric.toLocaleString()} MW`;
        } else if (datacenter.power_capacity_mw && datacenter.power_capacity_mw !== 'null') {
            return `${datacenter.power_capacity_mw} MW`;
        }
        return 'Unknown';
    };

    // Calculate position with improved positioning logic
    const cardStyle = position ? {
        position: 'absolute' as const,
        left: `${Math.min(position.x + 10, window.innerWidth - 350)}px`,
        top: `${Math.min(position.y + 10, window.innerHeight - 400)}px`,
        zIndex: 50
    } : {
        position: 'absolute' as const,
        top: '4rem',
        right: '1rem',
        zIndex: 50
    };

    return (
        <div 
            className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            style={cardStyle}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(datacenter.type)}</span>
                        <div>
                            <h3 className="font-semibold text-sm">
                                {datacenter.data_center || 'Unknown Datacenter'}
                            </h3>
                            <p className="text-gray-300 text-xs">
                                {datacenter.company}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-300 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(datacenter.status)}`}>
                        {datacenter.status_normalized || datacenter.status}
                    </span>
                    {distanceFromSilerCity && (
                        <span className="text-xs text-gray-500 flex items-center">
                            <MapPin size={12} className="mr-1" />
                            {distanceFromSilerCity.toFixed(1)} mi from Siler City
                        </span>
                    )}
                </div>

                {/* Address */}
                <div className="flex items-start space-x-2">
                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-gray-700 leading-snug">
                            {datacenter.address || 'Address not available'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {parseFloat(datacenter.latitude).toFixed(4)}, {parseFloat(datacenter.longitude).toFixed(4)}
                        </p>
                    </div>
                </div>

                {/* Type and Power */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                        <Building2 size={14} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="text-sm font-medium text-gray-700">
                                {datacenter.type || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Zap size={14} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Power</p>
                            <p className="text-sm font-medium text-gray-700">
                                {getPowerDisplay()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Estimated Finish */}
                {datacenter.estimated_finish && datacenter.estimated_finish !== 'null' && (
                    <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Estimated Completion</p>
                            <p className="text-sm font-medium text-gray-700">
                                {datacenter.estimated_finish}
                            </p>
                        </div>
                    </div>
                )}

                {/* Competitive Intelligence Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start space-x-2">
                        <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-blue-800">Competitive Intelligence</p>
                            <p className="text-xs text-blue-700 mt-1">
                                {datacenter.status.toLowerCase().includes('operational') 
                                    ? 'Active competitor facility - analyze market share and capacity utilization'
                                    : 'Future capacity expansion - monitor development timeline and market impact'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 