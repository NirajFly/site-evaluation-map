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
import MapStyleToggle, { MapStyle } from './MapStyleToggle';
import SilerCitySiteInfo from './SilerCitySiteInfo';
import FiberNetworkToggle from './FiberNetworkToggle';
import { useHighwayRoutes } from '@/hooks/useHighwayRoutes';

export default function SiteEvaluationMap() {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState(() => ({
        longitude: mapboxConfig.defaultCenter.longitude,
        latitude: mapboxConfig.defaultCenter.latitude,
        zoom: mapboxConfig.defaultZoom,
        pitch: 45,
        bearing: 0
    }));
    const [selectedPlant, setSelectedPlant] = useState<PowerPlant | null>(null);
    const [selectedPlantPosition, setSelectedPlantPosition] = useState<{x: number, y: number} | null>(null);
    const [bounds, setBounds] = useState<{
        west: number;
        south: number;
        east: number;
        north: number;
    }>(() => mapboxConfig.northeastUSBounds);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [showLoading, setShowLoading] = useState(false);
    // const [isSearching, setIsSearching] = useState(false); // Reserved for future search state UI
    const [showTransmissionLines, setShowTransmissionLines] = useState(false);
    const [selectedLine, setSelectedLine] = useState<TransmissionLine | null>(null);
    const [selectedLinePosition, setSelectedLinePosition] = useState<{x: number, y: number} | null>(null);
    const [searchedLocation, setSearchedLocation] = useState<{lng: number, lat: number, name?: string} | null>(null);
    const [mapStyle, setMapStyle] = useState<MapStyle>('satellite');
    const [showSilerCityInfo, setShowSilerCityInfo] = useState(false);
    const [silerCityPosition, setSilerCityPosition] = useState<{x: number, y: number} | null>(null);
    const [showFiberNetwork, setShowFiberNetwork] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedFiberLines, setSelectedFiberLines] = useState<Array<{ line: any; position: { x: number; y: number } }>>([]);

    // Siler City site coordinates
    const silerCitySite = useMemo(() => ({
        lng: -79.5506,
        lat: 35.7419,
        name: "1000 Carolina Core Pkwy, Siler City, NC 27344"
    }), []);

    // Fetch highway routes using Mapbox API
    const { routes: highwayRoutes, loading: routesLoading, error: routesError } = useHighwayRoutes({
        enabled: showFiberNetwork
    });

    // Hardcoded rail route for better visibility
    const railRoute = useMemo(() => ({
        type: 'Feature' as const,
        properties: {
            name: "Norfolk Southern Rail ROW",
            label: "Zayo long-haul",
            color: "#10B981",
            fiber_type: "long-haul"
        },
        geometry: {
            type: 'LineString' as const,
            coordinates: [
                // Hardcoded Norfolk Southern rail line from Greensboro to Sanford
                [-79.7900, 36.0700], // Greensboro area
                [-79.7500, 36.0200],
                [-79.7100, 35.9700],
                [-79.6800, 35.9300],
                [-79.6500, 35.8900],
                [-79.6200, 35.8500],
                [-79.5900, 35.8100],
                [-79.5700, 35.7800],
                [-79.5500, 35.7500],
                [-79.5350, 35.7200],
                [-79.5250, 35.6900],
                [-79.5200, 35.6600],
                [-79.5150, 35.6300],
                [-79.5100, 35.6000],
                [-79.5080, 35.5700],
                [-79.5060, 35.5400],
                [-79.5050, 35.5100],
                [-79.5040, 35.4800],
                [-79.5030, 35.4500],
                [-79.5020, 35.4200],
                [-79.5010, 35.3900],
                [-79.5000, 35.3600] // Sanford area
            ]
        }
    }), []);

    // Convert highway routes to GeoJSON and add hardcoded rail
    const fiberNetworkGeoJSON = useMemo(() => {
        const apiRoutes = highwayRoutes.map(route => ({
            type: 'Feature' as const,
            properties: {
                name: route.name,
                label: route.label,
                color: route.color,
                fiber_type: route.fiber_type
            },
            geometry: {
                type: 'LineString' as const,
                coordinates: route.coordinates
            }
        }));

        // Filter out the API rail route and add our hardcoded one
        const filteredRoutes = apiRoutes.filter(route => route.properties.name !== "Norfolk Southern Rail ROW");
        
        return {
            type: 'FeatureCollection' as const,
            features: [...filteredRoutes, railRoute]
        };
    }, [highwayRoutes, railRoute]);

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
            
            <FiberNetworkToggle
                showFiberNetwork={showFiberNetwork}
                onToggle={setShowFiberNetwork}
                loading={routesLoading}
                error={routesError}
            />
            
            <MapStyleToggle
                currentStyle={mapStyle}
                onStyleChange={setMapStyle}
            />
            
            <Map
                ref={mapRef}
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onMoveEnd={handleMoveEnd}
                onClick={(e) => {
                    // Check if clicking on fiber network lines
                    if (showFiberNetwork && fiberNetworkGeoJSON.features.length > 0) {
                        try {
                            const features = e.target.queryRenderedFeatures(e.point, {
                                layers: ['fiber-network-long-haul', 'fiber-network-middle-mile', 'fiber-network-last-mile']
                            });
                            
                            if (features.length > 0) {
                                const feature = features[0];
                                const newCard = {
                                    line: feature.properties,
                                    position: { x: e.point.x, y: e.point.y }
                                };
                                
                                // Check if this fiber line is already selected
                                setSelectedFiberLines(prev => {
                                    const existing = prev.find(f => f.line.fiber_type === feature.properties?.fiber_type);
                                    if (existing) {
                                        // Update position if already selected
                                        return prev.map(f => 
                                            f.line.fiber_type === feature.properties?.fiber_type 
                                                ? newCard 
                                                : f
                                        );
                                    } else {
                                        // Add new selection
                                        return [...prev, newCard];
                                    }
                                });
                                return; // Don't clear selections if clicking on fiber line
                            }
                        } catch (error: unknown) {
                            console.log('Fiber network layer not ready yet', error);
                        }
                    }
                    
                    // Clear selections if clicking on empty space
                    setSelectedPlant(null);
                    setSelectedPlantPosition(null);
                    setSelectedLine(null);
                    setSelectedLinePosition(null);
                    setSelectedFiberLines([]);
                }}
                mapboxAccessToken={mapboxConfig.accessToken}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapboxConfig.styles[mapStyle]}
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

                {/* Fiber Network Layers - Separate layers for each type */}
                {showFiberNetwork && !routesLoading && fiberNetworkGeoJSON.features.length > 0 && (
                    <Source
                        id="fiber-network"
                        type="geojson"
                        data={fiberNetworkGeoJSON}
                    >
                        {/* Long-haul fiber (rail corridor - offset right) */}
                        <Layer
                            id="fiber-network-long-haul"
                            type="line"
                            filter={['==', ['get', 'fiber_type'], 'long-haul']}
                            paint={{
                                'line-color': ['get', 'color'],
                                'line-width': 6,
                                'line-opacity': 1.0,
                                'line-dasharray': [8, 4],
                                'line-offset': 15
                            }}
                        />
                        
                        {/* Middle-mile fiber (US-421 - offset left) */}
                        <Layer
                            id="fiber-network-middle-mile"
                            type="line"
                            filter={['==', ['get', 'fiber_type'], 'middle-mile']}
                            paint={{
                                'line-color': ['get', 'color'],
                                'line-width': 5,
                                'line-opacity': 1.0,
                                'line-dasharray': [6, 3],
                                'line-offset': -12
                            }}
                        />
                        
                        {/* Last-mile fiber (US-64 - slight offset) */}
                        <Layer
                            id="fiber-network-last-mile"
                            type="line"
                            filter={['==', ['get', 'fiber_type'], 'last-mile']}
                            paint={{
                                'line-color': ['get', 'color'],
                                'line-width': 4,
                                'line-opacity': 1.0,
                                'line-offset': 8
                            }}
                        />
                        
                        <Layer
                            id="fiber-network-labels"
                            type="symbol"
                            layout={{
                                'text-field': ['get', 'label'],
                                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                                'text-size': [
                                    'interpolate',
                                    ['linear'],
                                    ['zoom'],
                                    8, 8,  // Show at all zoom levels
                                    10, 10,
                                    12, 12,
                                    16, 14
                                ],
                                'symbol-placement': 'line',
                                'text-rotation-alignment': 'map',
                                'text-pitch-alignment': 'viewport',
                                'text-max-angle': 20,
                                'text-padding': 15,
                                'text-allow-overlap': false,
                                'text-ignore-placement': false,
                                'symbol-spacing': 500,
                                'text-offset': [0, -2]  // Offset labels above the lines
                            }}
                            paint={{
                                'text-color': ['get', 'color'],
                                'text-halo-color': 'white',
                                'text-halo-width': 2,
                                'text-opacity': 0.9
                            }}
                        />
                    </Source>
                )}

                {/* Fiber Access Point Markers */}
                {showFiberNetwork && (
                    <>
                        {/* Primary Site Access Points */}
                        <Marker
                            longitude={-79.5506}
                            latitude={35.7419}
                            anchor="center"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" title="US-64 Fiber Access Point"></div>
                            </div>
                        </Marker>
                        
                        <Marker
                            longitude={-79.5380}
                            latitude={35.7435}
                            anchor="center"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" title="Rail ROW Splice Point"></div>
                            </div>
                        </Marker>
                        
                        <Marker
                            longitude={-79.4620}
                            latitude={35.7320}
                            anchor="center"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg" title="MCNC Point of Presence"></div>
                            </div>
                        </Marker>
                        
                        {/* Major Backbone Hubs */}
                        <Marker
                            longitude={-79.7900}
                            latitude={36.0600}
                            anchor="center"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-gray-700 rounded-full border-2 border-white shadow-lg"></div>
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-1 rounded shadow">
                                    Greensboro Hub
                                </div>
                            </div>
                        </Marker>
                        
                        <Marker
                            longitude={-79.0000}
                            latitude={35.2700}
                            anchor="center"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-gray-700 rounded-full border-2 border-white shadow-lg"></div>
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-1 rounded shadow">
                                    RTP Hub
                                </div>
                            </div>
                        </Marker>
                        
                        <Marker
                            longitude={-79.5230}
                            latitude={35.4100}
                            anchor="center"
                        >
                            <div className="relative">
                                <div className="w-3 h-3 bg-gray-700 rounded-full border-2 border-white shadow-lg"></div>
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-1 rounded shadow">
                                    Sanford Junction
                                </div>
                            </div>
                        </Marker>
                        
                        {/* Regional Access Points - Simplified */}
                        <Marker
                            longitude={-79.8500}
                            latitude={35.7100}
                            anchor="center"
                        >
                            <div className="w-2 h-2 bg-blue-400 rounded-full border border-white shadow-lg" title="Ramseur Regional Access"></div>
                        </Marker>
                        
                        <Marker
                            longitude={-78.9900}
                            latitude={35.7990}
                            anchor="center"
                        >
                            <div className="w-2 h-2 bg-blue-400 rounded-full border border-white shadow-lg" title="Apex Regional Access"></div>
                        </Marker>
                    </>
                )}

                {/* Siler City Site Marker */}
                <Marker
                    longitude={silerCitySite.lng}
                    latitude={silerCitySite.lat}
                    anchor="bottom"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setShowSilerCityInfo(true);
                        if (mapRef.current) {
                            const map = mapRef.current.getMap();
                            const point = map.project([silerCitySite.lng, silerCitySite.lat]);
                            setSilerCityPosition({
                                x: point.x,
                                y: point.y
                            });
                        }
                    }}
                >
                    <div className="relative">
                        <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap max-w-64 truncate">
                                Siler City Data Center Site
                            </div>
                        </div>
                    </div>
                </Marker>

                {(showLoading || routesLoading) && (
                    <div className="absolute bottom-8 right-8 bg-white/90 px-3 py-2 rounded text-sm text-gray-600">
                        {routesLoading ? 'Loading highway routes...' : 'Loading sites...'}
                    </div>
                )}

                {routesError && showFiberNetwork && (
                    <div className="absolute bottom-8 left-8 bg-red-50 border border-red-200 px-3 py-2 rounded text-sm text-red-600">
                        Failed to load fiber routes: {routesError}
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

            {selectedFiberLines.map((fiberCard, index) => (
                <div
                    key={fiberCard.line.fiber_type}
                    className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs"
                    style={{
                        left: fiberCard.position.x + (index * 250), // Offset cards horizontally
                        top: fiberCard.position.y,
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-10px'
                    }}
                >
                    <button
                        onClick={() => {
                            setSelectedFiberLines(prev => prev.filter(f => f.line.fiber_type !== fiberCard.line.fiber_type));
                        }}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg leading-none"
                    >
                        ×
                    </button>
                    
                    <div className="mb-2">
                        <h3 className="font-semibold text-gray-800 mb-1" style={{ color: fiberCard.line.color }}>
                            {fiberCard.line.label}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                            {fiberCard.line.name}
                        </p>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="ml-2 text-gray-600 capitalize">{fiberCard.line.fiber_type}</span>
                        </div>
                        
                        {fiberCard.line.fiber_type === 'long-haul' && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                                <strong>Long-haul backbone</strong><br/>
                                • 864+ strand capacity<br/>
                                • &lt;1.8ms latency to site<br/>
                                • Zayo & Lumen carriers
                            </div>
                        )}
                        
                        {fiberCard.line.fiber_type === 'middle-mile' && (
                            <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                                <strong>Middle-mile transport</strong><br/>
                                • MCNC/NCREN backbone<br/>
                                • ~2.5ms latency to RTP<br/>
                                • Dark fiber IRU available
                            </div>
                        )}
                        
                        {fiberCard.line.fiber_type === 'last-mile' && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                <strong>County frontage access</strong><br/>
                                • 24-144 strand capacity<br/>
                                • &lt;100m from site<br/>
                                • ~2ms latency to core
                            </div>
                        )}
                    </div>
                </div>
            ))}

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

            {showSilerCityInfo && (
                <SilerCitySiteInfo
                    position={silerCityPosition || undefined}
                    onClose={() => {
                        setShowSilerCityInfo(false);
                        setSilerCityPosition(null);
                    }}
                />
            )}
        </div>
    );
}