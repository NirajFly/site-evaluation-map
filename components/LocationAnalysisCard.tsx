'use client';

import { useState, useMemo } from 'react';
import { PowerPlant } from '@/lib/supabase';
import { X } from 'lucide-react';

interface CountyInfo {
    state: string;
    stateAbbrv: string;
    county: string;
    countyType?: string;
}

interface LocationAnalysisCardProps {
    location: { lng: number; lat: number; name?: string };
    countyInfo: CountyInfo | null;
    nearbyPowerPlants: PowerPlant[];
    onClose: () => void;
    onPlantZoom: (plant: PowerPlant) => void;
    onReturnToLocation: () => void;
    onRadiusChange: (radius: number) => void;
    position?: { x: number; y: number };
}

export default function LocationAnalysisCard({
    location,
    countyInfo,
    nearbyPowerPlants: allNearbyPowerPlants,
    onClose,
    onPlantZoom,
    onReturnToLocation,
    onRadiusChange,
    position
}: LocationAnalysisCardProps) {
    const [searchRadius, setSearchRadius] = useState(30); // Default 30 miles
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    // Filter power plants based on selected radius
    const nearbyPowerPlants = useMemo(() => {
        return allNearbyPowerPlants.filter(plant => {
            if (!plant.latitude || !plant.longitude) return false;
            const distance = calculateDistance(
                location.lat, location.lng,
                plant.latitude, plant.longitude
            );
            return distance <= searchRadius;
        });
    }, [allNearbyPowerPlants, searchRadius, location]);

    const getPlantTypeColor = (type: string | null) => {
        const typeNormalized = type?.toLowerCase() || '';
        if (typeNormalized === 'coal' || typeNormalized === 'oil/gas') {
            return 'text-red-600 bg-red-50';
        } else if (typeNormalized === 'solar' || typeNormalized === 'wind') {
            return 'text-green-600 bg-green-50';
        }
        return 'text-blue-600 bg-blue-50';
    };

    const getRiskLevel = () => {
        if (!nearbyPowerPlants.length) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
        
        const totalCapacity = nearbyPowerPlants.reduce((sum, plant) => sum + (plant.capacity_mw || 0), 0);
        const fossilFuelPlants = nearbyPowerPlants.filter(plant => 
            plant.type?.toLowerCase().includes('coal') || plant.type?.toLowerCase().includes('oil/gas')
        );
        
        if (totalCapacity > 2000 || fossilFuelPlants.length > 3) {
            return { level: 'High', color: 'text-red-600', bg: 'bg-red-50' };
        } else if (totalCapacity > 1000 || fossilFuelPlants.length > 1) {
            return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        }
        return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
    };

    const riskAssessment = getRiskLevel();

    // Calculate position - similar to other cards
    const cardStyle = position ? {
        position: 'absolute' as const,
        left: `${Math.min(position.x + 10, window.innerWidth - 400)}px`,
        top: `${Math.min(position.y + 10, window.innerHeight - 300)}px`,
        zIndex: 30
    } : {
        position: 'absolute' as const,
        top: '4rem',
        right: '1rem',
        zIndex: 30
    };

    return (
        <div 
            className="w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto"
            style={cardStyle}
        >
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Location Analysis</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onReturnToLocation}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            title="Return to searched location"
                        >
                            Return to Location
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Location Info */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                        {location.name && (
                            <p><strong>Location:</strong> {location.name}</p>
                        )}
                        <p><strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                        {countyInfo && (
                            <>
                                <p><strong>County:</strong> {countyInfo.county}</p>
                                <p><strong>State:</strong> {countyInfo.state} ({countyInfo.stateAbbrv})</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Risk Assessment */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                    <div className={`px-3 py-2 rounded-lg ${riskAssessment.bg} border`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Infrastructure Risk</span>
                            <span className={`text-sm font-semibold ${riskAssessment.color}`}>
                                {riskAssessment.level}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Based on nearby power generation capacity and transmission infrastructure
                        </p>
                    </div>
                </div>

                {/* Nearby Power Plants */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                            Nearby Power Plants ({nearbyPowerPlants.length})
                        </h4>
                        <select
                            value={searchRadius}
                            onChange={(e) => {
                                const newRadius = Number(e.target.value);
                                setSearchRadius(newRadius);
                                onRadiusChange(newRadius);
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10 miles</option>
                            <option value={30}>30 miles</option>
                            <option value={50}>50 miles</option>
                            <option value={75}>75 miles</option>
                            <option value={100}>100 miles</option>
                        </select>
                    </div>
                    {nearbyPowerPlants.length === 0 ? (
                        <p className="text-sm text-gray-500">No power plants within {searchRadius} mile radius</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {nearbyPowerPlants.map((plant) => {
                                const distance = calculateDistance(
                                    location.lat, location.lng,
                                    plant.latitude!, plant.longitude!
                                );
                                
                                return (
                                    <button
                                        key={plant.id}
                                        onClick={() => onPlantZoom(plant)}
                                        className="w-full border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 text-sm hover:text-blue-600">
                                                    {plant.plant_project_name || 'Unknown Plant'}
                                                </h5>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {plant.city}, {plant.subnational_unit_state_province}
                                                </p>
                                            </div>
                                            <div className="text-right text-xs text-gray-500">
                                                {distance.toFixed(1)} mi
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            {plant.type && (
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlantTypeColor(plant.type)}`}>
                                                    {plant.type}
                                                </span>
                                            )}
                                            {plant.capacity_mw && (
                                                <span className="text-xs text-gray-600">
                                                    {Math.round(plant.capacity_mw)} MW
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {nearbyPowerPlants.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Infrastructure Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold text-gray-900">
                                    {nearbyPowerPlants.reduce((sum, plant) => sum + (plant.capacity_mw || 0), 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-600">Total MW</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-semibold text-gray-900">
                                    {nearbyPowerPlants.filter(p => p.type?.toLowerCase().includes('coal') || p.type?.toLowerCase().includes('oil/gas')).length}
                                </div>
                                <div className="text-xs text-gray-600">Fossil Fuel</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}