import { useState, useEffect, useCallback } from 'react';
import { supabase, PowerPlant } from '@/lib/supabase';

interface UsePowerPlantsProps {
    bounds?: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
    zoom?: number;
    filters?: {
        type?: string[];
        status?: string[];
        capacity?: { min: number; max: number };
    };
}

export function usePowerPlants({ bounds, zoom = 1, filters }: UsePowerPlantsProps) {
    const [plants, setPlants] = useState<PowerPlant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlants = useCallback(async () => {
        if (!bounds) return;

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .schema('site_selection')
                .from('global_integrated_power')
                .select('id, type, country_area, subregion, region, plant_project_name, capacity_mw, status, technology, latitude, longitude, gem_wiki_url, city, fuel, start_year, subnational_unit_state_province')
                .gte('latitude', bounds.south)
                .lte('latitude', bounds.north)
                .gte('longitude', bounds.west)
                .lte('longitude', bounds.east)
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            // Apply filters
            if (filters?.type !== undefined) {
                if (filters.type.length === 0) {
                    // If empty array, return no results
                    query = query.in('type', ['__none__']); // Use impossible value
                } else {
                    query = query.in('type', filters.type);
                }
            }
            if (filters?.status !== undefined) {
                if (filters.status.length === 0) {
                    // If empty array, return no results
                    query = query.in('status', ['__none__']); // Use impossible value
                } else {
                    query = query.in('status', filters.status);
                }
            }
            if (filters?.capacity) {
                if (filters.capacity.min > 0) {
                    query = query.gte('capacity_mw', filters.capacity.min);
                }
                if (filters.capacity.max < 10000) {
                    query = query.lte('capacity_mw', filters.capacity.max);
                }
            }

            // Limit results based on zoom level
            const limit = zoom < 5 ? 100 : zoom < 8 ? 500 : 2000;
            query = query.limit(limit);

            // For low zoom levels, only fetch larger plants
            if (zoom < 5) {
                query = query.gte('capacity_mw', 100);
            } else if (zoom < 8) {
                query = query.gte('capacity_mw', 10);
            }

            const { data, error } = await query;

            if (error) throw error;
            setPlants(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch plants');
            console.error('Error fetching plants:', err);
        } finally {
            setLoading(false);
        }
    }, [bounds, zoom, filters]);

    useEffect(() => {
        fetchPlants();
    }, [fetchPlants]);

    return { plants, loading, error, refetch: fetchPlants };
}