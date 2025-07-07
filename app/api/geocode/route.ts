import { NextRequest, NextResponse } from 'next/server';
import { mapboxConfig } from '@/lib/mapbox-config';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxConfig.accessToken}&country=us`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Mapbox API error:', response.status, errorText);
            return NextResponse.json({ 
                error: 'Mapbox API error', 
                status: response.status,
                details: errorText 
            }, { status: response.status });
        }

        const data = await response.json();
        
        // Parse county information
        const countyInfo = {
            state: '',
            stateAbbrv: '',
            county: '',
            countyType: 'County'
        };

        if (data.features && data.features.length > 0) {
            // Look through all features to find county and state information
            for (const feature of data.features) {
                const context = feature.context || [];
                
                // Check if this feature itself is a district (county)
                if (feature.place_type?.includes('district')) {
                    countyInfo.county = feature.text;
                }
                
                // Look through context for state and county information
                for (const item of context) {
                    if (item.id?.startsWith('region')) {
                        countyInfo.state = item.text;
                        if (item.short_code) {
                            countyInfo.stateAbbrv = item.short_code.replace('US-', '');
                        }
                    } else if (item.id?.startsWith('district')) {
                        countyInfo.county = item.text;
                    }
                }
                
                // If we found both state and county, we can break
                if (countyInfo.state && countyInfo.county) {
                    break;
                }
            }
            
            // If we still don't have a county, look for it in any feature
            if (!countyInfo.county) {
                for (const feature of data.features) {
                    if (feature.place_type?.includes('place') || feature.place_type?.includes('locality')) {
                        // Sometimes county info is in the context of a place
                        const context = feature.context || [];
                        for (const item of context) {
                            if (item.id?.startsWith('district')) {
                                countyInfo.county = item.text;
                                break;
                            }
                        }
                        if (countyInfo.county) break;
                    }
                }
            }
        }

        return NextResponse.json({ 
            countyInfo,
            raw: data 
        });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ 
            error: 'Server error', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}