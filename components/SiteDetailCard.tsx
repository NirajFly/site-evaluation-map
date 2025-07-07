import { PowerPlant } from '@/lib/supabase';
import { useEIAPrices } from '@/hooks/useEIAPrices';
import { useState } from 'react';
import HazardAnalysis from './HazardAnalysis';

interface SiteDetailCardProps {
    plant: PowerPlant;
    onClose: () => void;
    position?: {
        x: number;
        y: number;
    };
}

const capitalizeFirst = (str: string | null): string => {
    if (!str) return 'N/A';
    if (str === 'oil/gas') return 'Oil/Gas';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function SiteDetailCard({ plant, onClose, position }: SiteDetailCardProps) {
    const { priceData, loading: priceLoading } = useEIAPrices(plant.subnational_unit_state_province);
    const [showHazardAnalysis, setShowHazardAnalysis] = useState(false);

    // Calculate position with some offset from the marker
    const cardStyle = position ? {
        position: 'absolute' as const,
        left: `${Math.min(position.x + 30, window.innerWidth - 400)}px`, // Ensure it doesn't go off screen
        top: `${Math.max(position.y - 150, 20)}px`, // Ensure it doesn't go above screen
        zIndex: 20
    } : {
        position: 'absolute' as const,
        bottom: '8rem',
        left: '2rem',
        zIndex: 20
    };

    return (
        <>
            <div 
                className="w-96 bg-white rounded-lg shadow-lg p-6 max-h-80 overflow-y-auto"
                style={cardStyle}
            >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <h2 className="text-xl font-bold mb-4 text-gray-900">{plant.plant_project_name || 'Unnamed Plant'}</h2>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Type:</span>
                    <span className="text-gray-900">{capitalizeFirst(plant.type)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                        plant.status === 'operating' ? 'bg-green-100 text-green-800' :
                        plant.status === 'construction' ? 'bg-yellow-100 text-yellow-800' :
                        plant.status === 'retired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {capitalizeFirst(plant.status)}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Capacity:</span>
                    <span className="text-gray-900">
                        {plant.capacity_mw ? `${plant.capacity_mw.toFixed(1)} MW` : 'N/A'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Technology:</span>
                    <span className="text-gray-900">{capitalizeFirst(plant.technology)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Country/Area:</span>
                    <span className="text-gray-900">{plant.country_area || 'N/A'}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Region:</span>
                    <span className="text-gray-900">{plant.region || 'N/A'}</span>
                </div>

                {plant.city && (
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">City:</span>
                        <span className="text-gray-900">{plant.city}</span>
                    </div>
                )}

                {plant.fuel && (
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">Fuel:</span>
                        <span className="text-gray-900">{plant.fuel}</span>
                    </div>
                )}

                {plant.start_year && (
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">Start Year:</span>
                        <span className="text-gray-900">{plant.start_year}</span>
                    </div>
                )}

                {/* EIA Electricity Prices Section */}
                {plant.subnational_unit_state_province && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h3 className="font-semibold mb-3 text-gray-800">
                            Electricity Prices - {plant.subnational_unit_state_province}
                        </h3>
                        
                        {priceLoading ? (
                            <div className="text-sm text-gray-600">Loading price data...</div>
                        ) : priceData ? (
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="font-medium text-gray-700">Residential:</div>
                                    <div className="text-gray-900">
                                        {priceData.residential_2025 
                                            ? `${priceData.residential_2025.toFixed(2)} ¢/kWh` 
                                            : 'N/A'}
                                    </div>
                                    
                                    <div className="font-medium text-gray-700">Commercial:</div>
                                    <div className="text-gray-900">
                                        {priceData.commercial_2025 
                                            ? `${priceData.commercial_2025.toFixed(2)} ¢/kWh` 
                                            : 'N/A'}
                                    </div>
                                    
                                    <div className="font-medium text-gray-700">Industrial:</div>
                                    <div className="text-gray-900">
                                        {priceData.industrial_2025 
                                            ? `${priceData.industrial_2025.toFixed(2)} ¢/kWh` 
                                            : 'N/A'}
                                    </div>
                                    
                                    <div className="font-medium text-gray-700">All Sectors:</div>
                                    <div className="text-gray-900 font-semibold">
                                        {priceData.all_sectors_2025 
                                            ? `${priceData.all_sectors_2025.toFixed(2)} ¢/kWh` 
                                            : 'N/A'}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-2">
                                    *April 2025 EIA data
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                No price data available for this state
                            </div>
                        )}
                    </div>
                )}

                {plant.gem_wiki_url && (
                    <div className="mt-4">
                        <a
                            href={plant.gem_wiki_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            View on GEM Wiki →
                        </a>
                    </div>
                )}

                {/* Hazard Analysis Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowHazardAnalysis(true)}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Perform Hazard Analysis
                    </button>
                </div>
            </div>
        </div>

        {/* Hazard Analysis Modal */}
        {showHazardAnalysis && (
            <HazardAnalysis
                latitude={plant.latitude}
                longitude={plant.longitude}
                onClose={() => setShowHazardAnalysis(false)}
            />
        )}
    </>
    );
}