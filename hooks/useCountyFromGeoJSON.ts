import { useState, useEffect, useCallback } from 'react';

interface CountyInfo {
    state: string;
    stateFips: string;
    county: string;
    countyFips: string;
    geoid: string;
    name: string;
}

interface UseCountyFromGeoJSONProps {
    latitude?: number | null;
    longitude?: number | null;
}

// State FIPS to name mapping
const STATE_FIPS_TO_NAME: Record<string, string> = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
    '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia',
    '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois',
    '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana',
    '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada',
    '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York',
    '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma',
    '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina',
    '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont',
    '51': 'Virginia', '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
};

// Get bounding box of a polygon
function getBoundingBox(polygon: number[][][]): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    for (const ring of polygon) {
        for (const [x, y] of ring) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
    }
    
    return { minX, maxX, minY, maxY };
}

// Check if point is in bounding box
function pointInBoundingBox(point: [number, number], bbox: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const [x, y] = point;
    return x >= bbox.minX && x <= bbox.maxX && y >= bbox.minY && y <= bbox.maxY;
}

// Point-in-polygon algorithm (Ray casting algorithm)
function pointInPolygon(point: [number, number], polygon: number[][][]): boolean {
    const [x, y] = point;
    let inside = false;
    
    for (const ring of polygon) {
        // Skip if ring is too small
        if (ring.length < 3) continue;
        
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const [xi, yi] = ring[i];
            const [xj, yj] = ring[j];
            
            // Check if point is on the edge
            if (yi === y && xi === x) return true;
            if (yj === y && xj === x) return true;
            
            // Ray casting algorithm
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
    }
    
    return inside;
}

export function useCountyFromGeoJSON({ latitude, longitude }: UseCountyFromGeoJSONProps) {
    const [countyInfo, setCountyInfo] = useState<CountyInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [geoJSONData, setGeoJSONData] = useState<any>(null);

    // Load GeoJSON data once
    useEffect(() => {
        const loadGeoJSON = async () => {
            try {
                const response = await fetch('/counties.geojson');
                if (!response.ok) {
                    throw new Error('Failed to load counties data');
                }
                const data = await response.json();
                setGeoJSONData(data);
            } catch (err) {
                console.error('Error loading counties GeoJSON:', err);
                setError('Failed to load counties data');
            }
        };

        if (!geoJSONData) {
            loadGeoJSON();
        }
    }, [geoJSONData]);

    const findCounty = useCallback(async () => {
        if (!latitude || !longitude || !geoJSONData) {
            setCountyInfo(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Finding county for coordinates:', { latitude, longitude });
            console.log('GeoJSON features count:', geoJSONData.features.length);
            
            // Swap order for debugging: use [latitude, longitude] instead of [longitude, latitude]
            const point: [number, number] = [latitude, longitude]; // DEBUG: swapped order
            console.log('Searching for point (swapped order):', point);
            
            let checkedCount = 0;
            
            // Search through all counties
            for (const feature of geoJSONData.features) {
                checkedCount++;
                
                const { properties, geometry } = feature;
                
                // Debug: log first few counties
                if (checkedCount <= 5) {
                    console.log(`Checking county ${checkedCount}:`, {
                        name: properties.NAME,
                        state: STATE_FIPS_TO_NAME[properties.STATEFP],
                        geometryType: geometry.type,
                        coordinatesLength: geometry.coordinates.length
                    });
                }
                
                if (geometry.type === 'Polygon') {
                    // First check bounding box for performance
                    const bbox = getBoundingBox(geometry.coordinates);
                    if (pointInBoundingBox(point, bbox)) {
                        // Then do precise point-in-polygon test
                        if (pointInPolygon(point, geometry.coordinates)) {
                            const stateName = STATE_FIPS_TO_NAME[properties.STATEFP] || 'Unknown';
                            
                            console.log('Found county:', {
                                name: properties.NAME,
                                state: stateName,
                                stateFips: properties.STATEFP,
                                countyFips: properties.COUNTYFP,
                                geoid: properties.GEOID
                            });
                            
                            setCountyInfo({
                                state: stateName,
                                stateFips: properties.STATEFP,
                                county: properties.NAME,
                                countyFips: properties.COUNTYFP,
                                geoid: properties.GEOID,
                                name: properties.NAME
                            });
                            setLoading(false);
                            return;
                        }
                    }
                } else if (geometry.type === 'MultiPolygon') {
                    // Handle MultiPolygon (multiple polygons for one county)
                    for (const polygon of geometry.coordinates) {
                        // First check bounding box for performance
                        const bbox = getBoundingBox([polygon]);
                        if (pointInBoundingBox(point, bbox)) {
                            // Then do precise point-in-polygon test
                            if (pointInPolygon(point, [polygon])) {
                                const stateName = STATE_FIPS_TO_NAME[properties.STATEFP] || 'Unknown';
                                
                                console.log('Found county (MultiPolygon):', {
                                    name: properties.NAME,
                                    state: stateName,
                                    stateFips: properties.STATEFP,
                                    countyFips: properties.COUNTYFP,
                                    geoid: properties.GEOID
                                });
                                
                                setCountyInfo({
                                    state: stateName,
                                    stateFips: properties.STATEFP,
                                    county: properties.NAME,
                                    countyFips: properties.COUNTYFP,
                                    geoid: properties.GEOID,
                                    name: properties.NAME
                                });
                                setLoading(false);
                                return;
                            }
                        }
                    }
                }
            }
            
            // If we get here, no county was found
            console.log('No county found for coordinates:', { latitude, longitude });
            console.log(`Checked ${checkedCount} counties`);
            setError('No county found for these coordinates');
            setCountyInfo(null);
        } catch (err) {
            console.error('Error finding county:', err);
            setError(err instanceof Error ? err.message : 'Failed to find county');
            setCountyInfo(null);
        } finally {
            setLoading(false);
        }
    }, [latitude, longitude, geoJSONData]);

    useEffect(() => {
        findCounty();
    }, [findCounty]);

    return { countyInfo, loading, error, refetch: findCounty };
} 