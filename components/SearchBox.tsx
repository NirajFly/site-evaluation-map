'use client';

import { useState, useRef } from 'react';
import { mapboxConfig } from '@/lib/mapbox-config';

interface SearchResult {
    id: string;
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    types: string[];
    source: 'mapbox' | 'google';
}

interface SearchBoxProps {
    onLocationSelect: (lng: number, lat: number, name?: string) => void;
}

export default function SearchBox({ onLocationSelect }: SearchBoxProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const searchLocation = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            // Search both Mapbox and Google Places in parallel
            const [mapboxResponse, googleResponse] = await Promise.allSettled([
                fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxConfig.accessToken}&country=us&bbox=-125,24,-66,49&limit=3`
                ).then(res => res.json()),
                fetch(
                    `/api/google-places?query=${encodeURIComponent(searchQuery)}`
                ).then(res => res.json())
            ]);

            let combinedResults: SearchResult[] = [];

            // Process Mapbox results
            if (mapboxResponse.status === 'fulfilled' && mapboxResponse.value.features) {
                const mapboxResults = mapboxResponse.value.features.map((feature: {
                    id: string;
                    text: string;
                    place_name: string;
                    center: [number, number];
                    place_type?: string[];
                }) => ({
                    id: feature.id,
                    name: feature.text,
                    formatted_address: feature.place_name,
                    geometry: {
                        location: {
                            lat: feature.center[1],
                            lng: feature.center[0]
                        }
                    },
                    types: feature.place_type || [],
                    source: 'mapbox' as const
                }));
                combinedResults = [...combinedResults, ...mapboxResults];
            }

            // Process Google Places results
            if (googleResponse.status === 'fulfilled' && googleResponse.value.candidates) {
                const googleResults = googleResponse.value.candidates.map((place: {
                    place_id: string;
                    name: string;
                    formatted_address: string;
                    geometry: { location: { lat: number; lng: number } };
                    types: string[];
                }) => ({
                    id: place.place_id,
                    name: place.name,
                    formatted_address: place.formatted_address,
                    geometry: {
                        location: {
                            lat: place.geometry.location.lat,
                            lng: place.geometry.location.lng
                        }
                    },
                    types: place.types || [],
                    source: 'google' as const
                }));
                combinedResults = [...combinedResults, ...googleResults];
            }

            // Sort results - prioritize landmarks and points of interest
            combinedResults.sort((a, b) => {
                const aIsLandmark = a.types.some(type => 
                    ['tourist_attraction', 'landmark', 'point_of_interest', 'establishment'].includes(type)
                );
                const bIsLandmark = b.types.some(type => 
                    ['tourist_attraction', 'landmark', 'point_of_interest', 'establishment'].includes(type)
                );
                
                if (aIsLandmark && !bIsLandmark) return -1;
                if (!aIsLandmark && bIsLandmark) return 1;
                
                // Prioritize Google results for landmarks
                if (aIsLandmark && bIsLandmark) {
                    if (a.source === 'google' && b.source === 'mapbox') return -1;
                    if (a.source === 'mapbox' && b.source === 'google') return 1;
                }
                
                return 0;
            });

            setSuggestions(combinedResults.slice(0, 5));
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Debounce search
        timeoutRef.current = setTimeout(() => {
            searchLocation(value);
        }, 300);
    };

    const handleSuggestionClick = (suggestion: SearchResult) => {
        const { lng, lat } = suggestion.geometry.location;
        onLocationSelect(lng, lat, suggestion.name);
        setQuery(suggestion.name);
        setSuggestions([]);
    };

    return (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-80">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search for a location..."
                    className="w-full px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </div>
                
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                                        <div className="text-sm text-gray-700">{suggestion.formatted_address}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {suggestion.types.some(type => 
                                            ['tourist_attraction', 'landmark', 'point_of_interest'].includes(type)
                                        ) && (
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                Landmark
                                            </span>
                                        )}
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                            {suggestion.source === 'google' ? 'Google' : 'Mapbox'}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}