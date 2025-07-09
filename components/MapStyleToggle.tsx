'use client';

import { useState } from 'react';
import { Satellite, Map } from 'lucide-react';

export type MapStyle = 'satellite' | 'default';

interface MapStyleToggleProps {
    currentStyle: MapStyle;
    onStyleChange: (style: MapStyle) => void;
}

export default function MapStyleToggle({ currentStyle, onStyleChange }: MapStyleToggleProps) {
    return (
        <div className="absolute top-4 right-4 z-10 flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
            <button
                onClick={() => onStyleChange('default')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    currentStyle === 'default'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Default Map View"
            >
                <Map size={16} />
                <span>Default</span>
            </button>
            <button
                onClick={() => onStyleChange('satellite')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                    currentStyle === 'satellite'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Satellite View"
            >
                <Satellite size={16} />
                <span>Satellite</span>
            </button>
        </div>
    );
} 