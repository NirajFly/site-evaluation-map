import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface NRIData {
    // Administrative IDs
    state?: string;
    stateabbrv?: string;
    county?: string;
    countytype?: string;
    nri_id?: string;
    
    // Exposure Baseline
    population?: number;
    buildvalue?: number;
    agrivalue?: number;
    area?: number;
    
    // Composite Risk
    risk_value?: number;
    risk_score?: number;
    risk_ratng?: string;
    risk_spctl?: number;
    
    // Expected Annual Loss (EAL)
    eal_score?: number;
    eal_ratng?: string;
    eal_spctl?: number;
    
    // Social Vulnerability
    sovi_score?: number;
    sovi_ratng?: string;
    sovi_spctl?: number;
    
    // Community Resilience
    resl_score?: number;
    resl_ratng?: string;
    resl_spctl?: number;
    
  
    
    // Per-Hazard Risk Ratings
    rfld_riskr?: string; // Riverine Flood Rating
    cfld_riskr?: string; // Coastal Surge Rating
    erqk_riskr?: string; // Earthquake Rating
    hrcn_riskr?: string; // Hurricane Rating
    trnd_riskr?: string; // Tornado Rating
    wfir_riskr?: string; // Wildfire Rating
    drgt_riskr?: string; // Drought Rating
    hwav_riskr?: string; // Extreme Heat Rating
    lnds_riskr?: string; // Landslide Rating
    wntw_riskr?: string; // Severe Winter Weather Rating
    avln_riskr?: string; // Avalanche Rating
    cwav_riskr?: string; // Coastal Wave Rating
    hail_riskr?: string; // Hail Rating
    isth_riskr?: string; // Ice Storm Rating
    ltng_riskr?: string; // Lightning Rating
    swnd_riskr?: string; // Strong Wind Rating
    tsun_riskr?: string; // Tsunami Rating
    vlcn_riskr?: string; // Volcanic Activity Rating
}

interface UseNRIDataProps {
    state?: string;
    county?: string;
}

export function useNRIData({ state, county }: UseNRIDataProps) {
    const [data, setData] = useState<NRIData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNRIData = useCallback(async () => {
        if (!state) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Fetching NRI data for:', { state, county });
            
            // Build query - start with state match
            let query = supabase
                .schema('site_selection')
                .from('nri_counties')
                .select(`
                    state,
                    stateabbrv,
                    county,
                    countytype,
                    nri_id,
                    population,
                    buildvalue,
                    agrivalue,
                    area,
                    risk_value,
                    risk_score,
                    risk_ratng,
                    risk_spctl,
                    eal_score,
                    eal_ratng,
                    eal_spctl,
                    sovi_score,
                    sovi_ratng,
                    sovi_spctl,
                    resl_score,
                    resl_ratng,
                    resl_spctl,
                    rfld_riskr,
                    cfld_riskr,
                    erqk_riskr,
                    hrcn_riskr,
                    trnd_riskr,
                    wfir_riskr,
                    drgt_riskr,
                    hwav_riskr,
                    lnds_riskr,
                    wntw_riskr,
                    avln_riskr,
                    cwav_riskr,
                    hail_riskr,
                    isth_riskr,
                    ltng_riskr,
                    swnd_riskr,
                    tsun_riskr,
                    vlcn_riskr
                `)
                .ilike('state', `%${state}%`);

            // Add county filter if we have it
            if (county && county !== 'Unknown') {
                query = query.ilike('county', `%${county}%`);
            }

            // Get multiple results instead of single
            const { data: nriData, error } = await query.limit(5);

            console.log('NRI query result:', { nriData, error });
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            if (!nriData || nriData.length === 0) {
                // Try a broader search with just state
                console.log('No exact match found, trying broader state search...');
                const { data: broaderData, error: broaderError } = await supabase
                    .schema('site_selection')
                    .from('nri_counties')
                    .select(`
                        state,
                        stateabbrv,
                        county,
                        countytype,
                        nri_id,
                        population,
                        buildvalue,
                        agrivalue,
                        area,
                        risk_value,
                        risk_score,
                        risk_ratng,
                        risk_spctl,
                        eal_score,
                        eal_ratng,
                        eal_spctl,
                        sovi_score,
                        sovi_ratng,
                        sovi_spctl,
                        resl_score,
                        resl_ratng,
                        resl_spctl,
                        rfld_riskr,
                        cfld_riskr,
                        erqk_riskr,
                        hrcn_riskr,
                        trnd_riskr,
                        wfir_riskr,
                        drgt_riskr,
                        hwav_riskr,
                        lnds_riskr,
                        wntw_riskr,
                        avln_riskr,
                        cwav_riskr,
                        hail_riskr,
                        isth_riskr,
                        ltng_riskr,
                        swnd_riskr,
                        tsun_riskr,
                        vlcn_riskr
                    `)
                    .ilike('state', `%${state}%`)
                    .limit(1);

                if (broaderError) {
                    throw broaderError;
                }

                if (!broaderData || broaderData.length === 0) {
                    throw new Error(`No NRI data found for state: ${state}`);
                }

                console.log('Using broader match:', broaderData[0]);
                setData(broaderData[0]);
                return;
            }
            
            // Use the first (best) match
            console.log('Using exact match:', nriData[0]);
            setData(nriData[0]);
        } catch (err) {
            console.error('Full error details:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch NRI data');
        } finally {
            setLoading(false);
        }
    }, [state, county]);

    useEffect(() => {
        fetchNRIData();
    }, [fetchNRIData]);

    return { data, loading, error, refetch: fetchNRIData };
} 