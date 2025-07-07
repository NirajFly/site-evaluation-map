import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@googlemaps/google-maps-services-js';

const client = new Client({});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
        return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
    }

    try {
        const response = await client.findPlaceFromText({
            params: {
                input: query,
                inputtype: 'textquery',
                key: googleApiKey,
                fields: ['place_id', 'name', 'geometry', 'formatted_address', 'types'],
                locationbias: 'country:us',
            },
        });

        if (response.data.candidates.length === 0) {
            return NextResponse.json({ candidates: [] });
        }

        const placeIds = response.data.candidates.map(candidate => candidate.place_id).filter(Boolean);
        
        const detailsPromises = placeIds.map(placeId => 
            client.placeDetails({
                params: {
                    place_id: placeId!,
                    key: googleApiKey,
                    fields: ['place_id', 'name', 'geometry', 'formatted_address', 'types', 'photos'],
                },
            })
        );

        const detailsResponses = await Promise.all(detailsPromises);
        
        const places = detailsResponses.map(detailsResponse => {
            const place = detailsResponse.data.result;
            return {
                place_id: place.place_id,
                name: place.name,
                formatted_address: place.formatted_address,
                geometry: place.geometry,
                types: place.types,
                photos: place.photos?.slice(0, 1) || [],
            };
        });

        return NextResponse.json({ candidates: places });
    } catch (error) {
        console.error('Google Places API error:', error);
        return NextResponse.json({ error: 'Failed to search places' }, { status: 500 });
    }
}