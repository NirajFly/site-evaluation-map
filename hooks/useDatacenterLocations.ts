import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DatacenterLocation {
    id: number;
    company: string;
    data_center: string;
    address: string;
    latitude: string;
    longitude: string;
    status: string;
    type: string;
    power_capacity_mw: string;
    estimated_finish: string;
    created_at: string;
    updated_at: string;
    // Computed fields from the view
    has_coordinates?: boolean;
    power_capacity_numeric?: number;
    status_normalized?: string;
}

interface UseDatacenterLocationsProps {
    bounds?: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
    zoom?: number;
    enabled?: boolean;
    useView?: boolean; // Whether to use the enhanced view with computed fields
}

interface UseDatacenterLocationsReturn {
    datacenters: DatacenterLocation[];
    loading: boolean;
    error: string | null;
}

export function useDatacenterLocations({
    bounds,
    zoom = 8,
    enabled = true,
    useView = true
}: UseDatacenterLocationsProps = {}): UseDatacenterLocationsReturn {
    const [datacenters, setDatacenters] = useState<DatacenterLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) {
            setDatacenters([]);
            return;
        }

        let isMounted = true;

        const fetchDatacenters = async () => {
            try {
                setLoading(true);
                setError(null);

                // Choose table vs view based on useView flag
                const tableName = useView ? 'datacenter_locations_view' : 'datacenter_locations';
                
                let query = supabase
                    .schema('site_selection')
                    .from(tableName)
                    .select('*');

                // Skip bounds filtering - load all datacenters
                // This makes datacenters static and visible at all zoom levels

                // Only include records with valid coordinates
                if (useView) {
                    query = query.eq('has_coordinates', true);
                } else {
                    query = query
                        .not('latitude', 'is', null)
                        .not('longitude', 'is', null);
                }

                // Order by power capacity (highest first) if using view
                if (useView) {
                    query = query.order('power_capacity_numeric', { ascending: false });
                } else {
                    query = query.order('company');
                }

                const { data, error: queryError } = await query;

                if (queryError) {
                    throw queryError;
                }

                if (isMounted) {
                    setDatacenters(data || []);
                }
            } catch (err) {
                console.error('Error fetching datacenter locations:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load datacenter locations');
                    setDatacenters([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDatacenters();

        return () => {
            isMounted = false;
        };
    }, [bounds?.west, bounds?.south, bounds?.east, bounds?.north, zoom, enabled, useView]);

    return { datacenters, loading, error };
}

// Hook to get datacenters within a specific radius of a point
export function useDatacentersNearPoint({
    centerLat,
    centerLng,
    radiusMiles = 100,
    enabled = true
}: {
    centerLat?: number;
    centerLng?: number;
    radiusMiles?: number;
    enabled?: boolean;
}): UseDatacenterLocationsReturn {
    const [datacenters, setDatacenters] = useState<DatacenterLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !centerLat || !centerLng) {
            setDatacenters([]);
            return;
        }

        let isMounted = true;

        const fetchNearbyDatacenters = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: rpcError } = await supabase
                    .schema('site_selection')
                    .rpc('get_datacenters_in_area', {
                        center_lat: centerLat,
                        center_lng: centerLng,
                        radius_miles: radiusMiles
                    });

                if (rpcError) {
                    throw rpcError;
                }

                if (isMounted) {
                    setDatacenters(data || []);
                }
            } catch (err) {
                console.error('Error fetching nearby datacenters:', err);
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load nearby datacenters');
                    setDatacenters([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchNearbyDatacenters();

        return () => {
            isMounted = false;
        };
    }, [centerLat, centerLng, radiusMiles, enabled]);

    return { datacenters, loading, error };
} 