export const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

export const mapboxConfig = {
    accessToken: mapboxAccessToken,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    projection: 'globe' as const,
    defaultCenter: {
        longitude: -74.0060,
        latitude: 40.7128
    },
    defaultZoom: 6,
    northeastUSBounds: {
        west: -80.0,
        south: 38.0,
        east: -66.0,
        north: 48.0
    }
};