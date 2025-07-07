import { useState, useEffect, useCallback } from 'react';
import { TransmissionLine } from '@/lib/supabase';

interface UseTransmissionLinesProps {
    bounds?: {
        west: number;
        south: number;
        east: number;
        north: number;
    };
    zoom?: number;
    enabled?: boolean;
}

export function useTransmissionLines({ bounds, zoom = 1, enabled = false }: UseTransmissionLinesProps) {
    const [lines, setLines] = useState<TransmissionLine[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLines = useCallback(async () => {
        if (!bounds || !enabled) {
            setLines([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                west: bounds.west.toString(),
                south: bounds.south.toString(),
                east: bounds.east.toString(),
                north: bounds.north.toString(),
                zoom: zoom.toString()
            });

            const response = await fetch(`/api/transmission-lines?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch transmission lines');
            }

            setLines(data.lines || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch transmission lines');
            console.error('Error fetching transmission lines:', err);
        } finally {
            setLoading(false);
        }
    }, [bounds, zoom, enabled]);

    useEffect(() => {
        fetchLines();
    }, [fetchLines]);

    return { lines, loading, error, refetch: fetchLines };
}