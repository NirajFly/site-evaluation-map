import { useState, useEffect, useCallback } from 'react';
import { mapboxConfig } from '@/lib/mapbox-config';

interface CountyInfo {
    state: string;
    stateAbbrv: string;
    county: string;
    countyType?: string;
}

interface UseCountyFromCoordsProps {
    latitude?: number | null;
    longitude?: number | null;
}

export function useCountyFromCoords({ latitude, longitude }: UseCountyFromCoordsProps) {
    const [countyInfo, setCountyInfo] = useState<CountyInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCountyInfo = useCallback(async () => {
        if (!latitude || !longitude) {
            setCountyInfo(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use our API route to avoid CORS issues
            const url = `/api/geocode?lat=${latitude}&lng=${longitude}`;
            console.log('Fetching from API route:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to fetch county information: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API response:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (data.countyInfo) {
                const { state, stateAbbrv, county, countyType } = data.countyInfo;
                console.log('Parsed county info:', data.countyInfo);
                
                if (state) {
                    setCountyInfo({
                        state,
                        stateAbbrv: stateAbbrv || state,
                        county: county || 'Unknown',
                        countyType
                    });
                } else {
                    setError('Could not determine state from coordinates');
                }
            } else {
                setError('No location data found for these coordinates');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch county information');
            console.error('Error fetching county info:', err);
        } finally {
            setLoading(false);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        fetchCountyInfo();
    }, [fetchCountyInfo]);

    return { countyInfo, loading, error, refetch: fetchCountyInfo };
} 