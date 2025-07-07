import { useState, useEffect } from 'react';
import { supabase, EIAElectricityPrice } from '@/lib/supabase';

export function useEIAPrices(stateName?: string | null) {
    const [priceData, setPriceData] = useState<EIAElectricityPrice | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!stateName) {
            setPriceData(null);
            return;
        }

        const fetchPriceData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Try to match the state name with region_name in EIA table
                const { data, error } = await supabase
                    .schema('site_selection')
                    .from('eia_electricity_prices')
                    .select('*')
                    .ilike('region_name', `%${stateName}%`)
                    .limit(1);

                if (error) throw error;

                if (data && data.length > 0) {
                    setPriceData(data[0]);
                } else {
                    // Try alternative matching - sometimes state names might be different
                    const { data: altData, error: altError } = await supabase
                        .schema('site_selection')
                        .from('eia_electricity_prices')
                        .select('*')
                        .ilike('region_name', `${stateName}`)
                        .limit(1);

                    if (altError) throw altError;
                    setPriceData(altData && altData.length > 0 ? altData[0] : null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch price data');
                console.error('Error fetching EIA price data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPriceData();
    }, [stateName]);

    return { priceData, loading, error };
}