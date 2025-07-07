import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Get distinct types and statuses using raw SQL
        const { data: typeData, error: typeError } = await supabase.rpc('get_distinct_types');
        const { data: statusData, error: statusError } = await supabase.rpc('get_distinct_statuses');

        if (typeError || statusError) {
            // Fallback to regular query
            const { data: sampleData } = await supabase
                .from('global_integrated_power')
                .select('type, status')
                .limit(5000);

            if (sampleData) {
                const types = [...new Set(sampleData.map(item => item.type).filter(Boolean))];
                const statuses = [...new Set(sampleData.map(item => item.status).filter(Boolean))];
                
                return NextResponse.json({ types, statuses });
            }
        }

        return NextResponse.json({ 
            types: typeData || [], 
            statuses: statusData || [] 
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ types: [], statuses: [] });
    }
}