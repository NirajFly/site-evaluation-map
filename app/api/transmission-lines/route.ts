import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    const west = parseFloat(searchParams.get('west') || '-180');
    const south = parseFloat(searchParams.get('south') || '-90');
    const east = parseFloat(searchParams.get('east') || '180');
    const north = parseFloat(searchParams.get('north') || '90');
    const zoom = parseFloat(searchParams.get('zoom') || '1');

    try {
        let query = supabase
            .schema('site_selection')
            .from('transmission_lines')
            .select('id, geo_shape, longitude, latitude, shape_length, owner, type, status, naics_desc')
            .gte('latitude', south)
            .lte('latitude', north)
            .gte('longitude', west)
            .lte('longitude', east)
            .not('geo_shape', 'is', null);

        // Limit results to prevent too much data
        const limit = 2000;
        query = query.limit(limit);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transmission lines:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ lines: data || [] });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch transmission lines' }, { status: 500 });
    }
}