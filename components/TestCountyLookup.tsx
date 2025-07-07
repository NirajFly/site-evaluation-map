'use client';

import { useState } from 'react';
import { useCountyFromCoords } from '@/hooks/useCountyFromCoords';

export default function TestCountyLookup() {
    const [testCoords, setTestCoords] = useState({ lat: 39.4666, lng: -75.5377 });
    const { countyInfo, loading, error } = useCountyFromCoords({
        latitude: testCoords.lat,
        longitude: testCoords.lng
    });

    return (
        <div className="fixed bottom-20 left-4 bg-white p-4 rounded shadow-lg z-30 max-w-sm">
            <h3 className="font-bold mb-2">County Lookup Test</h3>
            <div className="text-sm space-y-1">
                <div>Lat: {testCoords.lat}, Lng: {testCoords.lng}</div>
                {loading && <div>Loading...</div>}
                {error && <div className="text-red-600">Error: {error}</div>}
                {countyInfo && (
                    <div className="mt-2 space-y-1">
                        <div><strong>State:</strong> {countyInfo.state} ({countyInfo.stateAbbrv})</div>
                        <div><strong>County:</strong> {countyInfo.county}</div>
                        <div><strong>Type:</strong> {countyInfo.countyType || 'County'}</div>
                    </div>
                )}
            </div>
            <div className="mt-3 space-y-2">
                <button
                    onClick={() => setTestCoords({ lat: 39.4666, lng: -75.5377 })}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                >
                    Test NJ Coords
                </button>
                <button
                    onClick={() => setTestCoords({ lat: 40.7128, lng: -74.0060 })}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded ml-2"
                >
                    Test NYC
                </button>
            </div>
        </div>
    );
}