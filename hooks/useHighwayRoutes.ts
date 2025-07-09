import { useState, useEffect, useCallback } from 'react';
import { mapboxConfig } from '@/lib/mapbox-config';

interface HighwayRoute {
    id: string;
    name: string;
    coordinates: [number, number][];
    color: string;
    fiber_type: string;
    label: string;
}

interface UseHighwayRoutesProps {
    enabled?: boolean;
}

export function useHighwayRoutes({ enabled = true }: UseHighwayRoutesProps = {}) {
    const [routes, setRoutes] = useState<HighwayRoute[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHighwayRoute = useCallback(async (
        waypoints: [number, number][],
        routeId: string,
        routeName: string,
        color: string,
        fiberType: string,
        label: string
    ): Promise<HighwayRoute | null> => {
        try {
            const coordinates = waypoints.map(point => `${point[0]},${point[1]}`).join(';');
            
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
                `access_token=${mapboxConfig.accessToken}&` +
                `geometries=geojson&` +
                `overview=full&` +
                `steps=false&` +
                `alternatives=false`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch route: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    id: routeId,
                    name: routeName,
                    coordinates: route.geometry.coordinates,
                    color,
                    fiber_type: fiberType,
                    label
                };
            }
            
            return null;
        } catch (err) {
            console.error(`Error fetching route ${routeId}:`, err);
            return null;
        }
    }, []);

    const fetchAllRoutes = useCallback(async () => {
        if (!enabled) return;

        setLoading(true);
        setError(null);

        try {
            const routePromises = [
                // US-64 Route: Ramseur → Siler City → Apex
                fetchHighwayRoute(
                    [
                        [-79.8500, 35.7100], // Ramseur area
                        [-79.5506, 35.7419], // Siler City site
                        [-79.0700, 35.7800], // Pittsboro area
                        [-78.9900, 35.7990]  // Apex area
                    ],
                    'us-64',
                    'US-64 County Fiber',
                    '#3B82F6',
                    'last-mile',
                    'County open access'
                ),
                
                // US-421 Route: Greensboro → Siler City area → RTP
                fetchHighwayRoute(
                    [
                        [-79.7900, 36.0600], // Greensboro
                        [-79.6200, 35.8900], // Intermediate point
                        [-79.4620, 35.7320], // Near Siler City
                        [-79.2000, 35.4700], // Intermediate point
                        [-79.0000, 35.2700]  // RTP area
                    ],
                    'us-421',
                    'US-421 MCNC Fiber',
                    '#8B5CF6',
                    'middle-mile',
                    'MCNC middle-mile'
                ),
                
                // Approximate rail route (using roads close to rail line)
                fetchHighwayRoute(
                    [
                        [-79.7900, 36.0700], // Greensboro area
                        [-79.6000, 35.8000], // Intermediate
                        [-79.5400, 35.7300], // Near Siler City
                        [-79.5230, 35.4100]  // Sanford area
                    ],
                    'rail-row',
                    'Norfolk Southern Rail ROW',
                    '#10B981',
                    'long-haul',
                    'Zayo long-haul'
                )
            ];

            const results = await Promise.all(routePromises);
            const validRoutes = results.filter((route): route is HighwayRoute => route !== null);
            
            setRoutes(validRoutes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch highway routes');
            console.error('Error fetching highway routes:', err);
        } finally {
            setLoading(false);
        }
    }, [enabled, fetchHighwayRoute]);

    useEffect(() => {
        fetchAllRoutes();
    }, [fetchAllRoutes]);

    return { routes, loading, error, refetch: fetchAllRoutes };
} 