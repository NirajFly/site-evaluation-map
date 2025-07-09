'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxConfig } from '@/lib/mapbox-config';
import { usePowerPlants } from '@/hooks/usePowerPlants';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { useTransmissionLines } from '@/hooks/useTransmissionLines';
import { useCountyFromCoords } from '@/hooks/useCountyFromCoords';
import { PowerPlant, TransmissionLine } from '@/lib/supabase';
import SiteDetailCard from './SiteDetailCard';
import TypeFilter from './TypeFilter';
import StatusFilter from './StatusFilter';
import SearchBox from './SearchBox';
import TransmissionLinesToggle from './TransmissionLinesToggle';
import TransmissionLineCard from './TransmissionLineCard';
import LocationAnalysisCard from './LocationAnalysisCard';

export default function SiteEvaluationMap() {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        longitude: mapboxConfig.defaultCenter.longitude,
        latitude: mapboxConfig.defaultCenter.latitude,
        zoom: mapboxConfig.defaultZoom,
        pitch: 45,
        bearing: 0
    });
    const [selectedPlant, setSelectedPlant] = useState<PowerPlant | null>(null);
    const [selectedPlantPosition, setSelectedPlantPosition] = useState<{x: number, y: number} | null>(null);
    const [bounds, setBounds] = useState<{
        west: number;
        south: number;
        east: number;
        north: number;
    }>(mapboxConfig.northeastUSBounds);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [showLoading, setShowLoading] = useState(false);
    // const [isSearching, setIsSearching] = useState(false); // Reserved for future search state UI
    const [showTransmissionLines, setShowTransmissionLines] = useState(false);
    const [selectedLine, setSelectedLine] = useState<TransmissionLine | null>(null);
    const [selectedLinePosition, setSelectedLinePosition] = useState<{x: number, y: number} | null>(null);
    const [searchedLocation, setSearchedLocation] = useState<{lng: number, lat: number, name?: string} | null>(null);

    const { types: availableTypes, statuses: availableStatuses } = useFilterOptions();

    const filters = {
        type: selectedTypes.length > 0 && selectedTypes.length < availableTypes.length ? selectedTypes : undefined,
        status: selectedStatuses.length > 0 && selectedStatuses.length < availableStatuses.length ? selectedStatuses : undefined
    };

    const { plants, loading } = usePowerPlants({ bounds, zoom: viewState.zoom, filters });
    const { lines: transmissionLines } = useTransmissionLines({ 
        bounds, 
        zoom: viewState.zoom, 
        enabled: showTransmissionLines 
    });
    
    const { countyInfo } = useCountyFromCoords({
        latitude: searchedLocation?.lat,
        longitude: searchedLocation?.lng
    });

    // Initialize filters when available options are loaded
    useEffect(() => {
        if (availableTypes.length > 0 && selectedTypes.length === 0) {
            setSelectedTypes(availableTypes);
        }
        if (availableStatuses.length > 0 && selectedStatuses.length === 0) {
            setSelectedStatuses(availableStatuses);
        }
    }, [availableTypes, availableStatuses, selectedTypes.length, selectedStatuses.length]);

    // Show loading only after a delay to prevent flashing
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => setShowLoading(true), 500);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    // Update bounds when map moves
    const handleMoveEnd = useCallback(() => {
        if (mapRef.current) {
            const map = mapRef.current.getMap();
            const mapBounds = map.getBounds();
            if (mapBounds) {
                setBounds({
                    west: mapBounds.getWest(),
                    south: mapBounds.getSouth(),
                    east: mapBounds.getEast(),
                    north: mapBounds.getNorth()
                });
            }
        }
    }, []);

    // Handle location search
    const handleLocationSelect = (lng: number, lat: number, name?: string) => {
        // setIsSearching(true); // Reserved for future search state UI
        setSearchedLocation({ lng, lat, name });
        
        // Clear any selected plants/lines
        setSelectedPlant(null);
        setSelectedPlantPosition(null);
        setSelectedLine(null);
        setSelectedLinePosition(null);
        
        // Calculate new bounds around the selected location
        const buffer = 0.5; // degrees
        const newBounds = {
            west: lng - buffer,
            south: lat - buffer,
            east: lng + buffer,
            north: lat + buffer
        };
        
        setBounds(newBounds);
        setViewState(prev => ({
            ...prev,
            longitude: lng,
            latitude: lat,
            zoom: 12
        }));
        
        // Clear searching state after a short delay
        // setTimeout(() => setIsSearching(false), 1000); // Reserved for future search state UI
    };

    // Calculate marker radius based on capacity
    const getMarkerSize = (capacity: number | null) => {
        if (!capacity) return 15;
        if (capacity < 50) return 15;
        if (capacity < 200) return 20;
        if (capacity < 500) return 25;
        return 30;
    };

    const getMarkerColor = (type: string | null) => {
        const typeNormalized = type?.toLowerCase() || '';
        if (typeNormalized === 'coal' || typeNormalized === 'oil/gas') {
            return '#EF4444'; // red
        } else if (typeNormalized === 'solar' || typeNormalized === 'wind') {
            return '#10B981'; // green
        }
        return '#3B82F6'; // blue
    };

    // Calculate distance between two coordinates (Haversine formula) - returns miles
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

    // Filter power plants near searched location using single data source
    const nearbyPowerPlants = useMemo(() => {
        if (!searchedLocation) return [];
        
        const maxDistance = 100; // 100 mile radius max (will be filtered in LocationAnalysisCard)
        
        return plants.filter(plant => {
            if (!plant.latitude || !plant.longitude) return false;
            
            const distance = calculateDistance(
                searchedLocation.lat, searchedLocation.lng,
                plant.latitude, plant.longitude
            );
            
            return distance <= maxDistance;
        }).sort((a, b) => {
            const distA = calculateDistance(
                searchedLocation.lat, searchedLocation.lng,
                a.latitude!, a.longitude!
            );
            const distB = calculateDistance(
                searchedLocation.lat, searchedLocation.lng,
                b.latitude!, b.longitude!
            );
            return distA - distB;
        });
    }, [plants, searchedLocation]);

    // Convert transmission lines to GeoJSON format
    const transmissionLinesGeoJSON = useMemo(() => {
        return {
            type: 'FeatureCollection' as const,
            features: transmissionLines.map(line => ({
                type: 'Feature' as const,
                properties: {
                    id: line.id,
                    owner: line.owner,
                    type: line.type,
                    status: line.status,
                    naics_desc: line.naics_desc
                },
                geometry: line.geo_shape
            }))
        };
    }, [transmissionLines]);

    return (
        <div className="relative w-full h-screen">
            <SearchBox onLocationSelect={handleLocationSelect} />
            
            <TypeFilter
                selectedTypes={selectedTypes}
                availableTypes={availableTypes}
                onTypesChange={setSelectedTypes}
            />
            
            <StatusFilter
                selectedStatuses={selectedStatuses}
                availableStatuses={availableStatuses}
                onStatusesChange={setSelectedStatuses}
            />
            
            <TransmissionLinesToggle
                showTransmissionLines={showTransmissionLines}
                onToggle={setShowTransmissionLines}
            />
            
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onMoveEnd={handleMoveEnd}
                onClick={(e) => {
                    // Check if clicking on transmission line (only if layer exists)
                    if (showTransmissionLines && transmissionLines.length > 0) {
                        try {
                            const features = e.target.queryRenderedFeatures(e.point, {
                                layers: ['transmission-lines-layer']
                            });
                            
                            if (features.length > 0) {
                                const feature = features[0];
                                const lineData = transmissionLines.find(line => line.id === feature.properties?.id);
                                if (lineData) {
                                    setSelectedLine(lineData);
                                    setSelectedLinePosition({
                                        x: e.point.x,
                                        y: e.point.y
                                    });
                                    return; // Don't clear selections if clicking on line
                                }
                            }
                        } catch (error: unknown) {
                            console.log('Transmission line layer not ready yet', error);
                        }
                    }
                    
                    // Clear all selections if clicking on empty space
                    setSelectedPlant(null);
                    setSelectedPlantPosition(null);
                    setSelectedLine(null);
                    setSelectedLinePosition(null);
                }}
                mapboxAccessToken={mapboxConfig.accessToken}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapboxConfig.style}
                projection={mapboxConfig.projection}
                terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                onLoad={(e) => {
                    const map = e.target;
                    map.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: 'mapbox://mapbox.terrain-rgb',
                        tileSize: 512,
                        maxzoom: 14
                    });
                }}
            >
                <NavigationControl position="top-right" />
                <GeolocateControl position="top-right" />

                {/* Searched Location Marker */}
                {searchedLocation && (
                    <Marker
                        longitude={searchedLocation.lng}
                        latitude={searchedLocation.lat}
                        anchor="bottom"
                    >
                        <div className="relative">
                            <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
                                <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap max-w-48 truncate">
                                    {searchedLocation.name || 'Search Location'}
                                </div>
                            </div>
                        </div>
                    </Marker>
                )}

                {/* Transmission Lines Layer */}
                {showTransmissionLines && (
                    <Source 
                        id="transmission-lines" 
                        type="geojson" 
                        data={transmissionLinesGeoJSON}
                    >
                        <Layer
                            id="transmission-lines-layer"
                            type="line"
                            paint={{
                                'line-color': '#EF4444', // red-500 - thick red lines
                                'line-width': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    8, 3,
                                    12, 5,
                                    16, 7
                                ],
                                'line-opacity': 0.8
                            }}
                        />
                    </Source>
                )}

                {showLoading && (
                    <div className="absolute bottom-8 right-8 bg-white/90 px-3 py-2 rounded text-sm text-gray-600">
                        Loading sites...
                    </div>
                )}

                {plants.map((plant) => {
                    if (!plant.latitude || !plant.longitude) return null;
                    
                    const markerSize = getMarkerSize(plant.capacity_mw);
                    const markerColor = getMarkerColor(plant.type);
                    
                    // Check if this plant is in the nearby plants list (simplified highlighting)
                    const isNearSearched = nearbyPowerPlants.some(p => p.id === plant.id);
                    
                    return (
                        <Marker
                            key={`marker-${plant.id}`}
                            longitude={plant.longitude}
                            latitude={plant.latitude}
                            anchor="center"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                setSelectedPlant(plant);
                                // Get the screen position using the marker's coordinates
                                if (mapRef.current && plant.latitude && plant.longitude) {
                                    const map = mapRef.current.getMap();
                                    const point = map.project([plant.longitude, plant.latitude]);
                                    setSelectedPlantPosition({
                                        x: point.x,
                                        y: point.y
                                    });
                                }
                            }}
                        >
                            <div
                                className="cursor-pointer hover:scale-110 transition-transform duration-150"
                                style={{
                                    width: `${markerSize}px`,
                                    height: `${markerSize}px`,
                                    backgroundColor: markerColor,
                                    borderRadius: '50%',
                                    border: isNearSearched ? '3px solid #FDE047' : '2px solid white',
                                    boxShadow: isNearSearched ? '0 0 10px rgba(253, 224, 71, 0.5)' : '0 2px 4px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isNearSearched ? 1 : 0.8
                                }}
                            >
                                <span className="text-white text-xs font-bold select-none pointer-events-none">
                                    {plant.capacity_mw ? Math.round(plant.capacity_mw) : ''}
                                </span>
                            </div>
                        </Marker>
                    );
                })}
            </Map>

            {selectedPlant && (
                <SiteDetailCard
                    plant={selectedPlant}
                    position={selectedPlantPosition || undefined}
                    onClose={() => {
                        setSelectedPlant(null);
                        setSelectedPlantPosition(null);
                    }}
                />
            )}

            {selectedLine && (
                <TransmissionLineCard
                    line={selectedLine}
                    position={selectedLinePosition || undefined}
                    onClose={() => {
                        setSelectedLine(null);
                        setSelectedLinePosition(null);
                    }}
                />
            )}

            {searchedLocation && (
                <LocationAnalysisCard
                    location={searchedLocation}
                    countyInfo={countyInfo}
                    nearbyPowerPlants={nearbyPowerPlants}
                    onClose={() => {
                        setSearchedLocation(null);
                    }}
                    onPlantZoom={(plant) => {
                        if (plant.latitude && plant.longitude) {
                            setViewState(prev => ({
                                ...prev,
                                longitude: plant.longitude!,
                                latitude: plant.latitude!,
                                zoom: Math.max(prev.zoom, 12) // Zoom in to at least level 12
                            }));
                        }
                    }}
                    onReturnToLocation={() => {
                        if (searchedLocation) {
                            setViewState(prev => ({
                                ...prev,
                                longitude: searchedLocation.lng,
                                latitude: searchedLocation.lat,
                                zoom: 12
                            }));
                        }
                    }}
                    onRadiusChange={() => {}}
                />
            )}
        </div>
    );
}