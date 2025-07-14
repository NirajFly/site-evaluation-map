'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToggleConfig {
    id: string;
    name: string;
    visible: boolean;
}

interface ToggleVisibilityContextType {
    toggles: ToggleConfig[];
    setToggleVisibility: (id: string, visible: boolean) => void;
    getToggleVisibility: (id: string) => boolean;
}

const defaultToggles: ToggleConfig[] = [
    { id: 'typeFilter', name: 'Type Filter', visible: true },
    { id: 'statusFilter', name: 'Status Filter', visible: false },
    { id: 'datacenters', name: 'Data Centers', visible: false },
    { id: 'transmissionLines', name: 'Transmission Lines', visible: false },
    { id: 'fiberNetwork', name: 'Fiber Network', visible: false },
    { id: 'datacenterDistance', name: 'Datacenter Distances', visible: false },
    { id: 'datacenterProximity', name: 'Datacenter Proximity', visible: false },
    { id: 'fiberInfrastructure', name: 'Fiber Infrastructure', visible: false },
    { id: 'mapStyle', name: 'Map Style', visible: true },
    { id: 'datacenterDistanceFilter', name: 'Distance Filter', visible: false }
];

const ToggleVisibilityContext = createContext<ToggleVisibilityContextType | undefined>(undefined);

export function ToggleVisibilityProvider({ children }: { children: ReactNode }) {
    const [toggles, setToggles] = useState<ToggleConfig[]>(defaultToggles);

    const setToggleVisibility = (id: string, visible: boolean) => {
        setToggles(prev => prev.map(toggle => 
            toggle.id === id ? { ...toggle, visible } : toggle
        ));
    };

    const getToggleVisibility = (id: string): boolean => {
        const toggle = toggles.find(t => t.id === id);
        return toggle?.visible ?? true;
    };

    return (
        <ToggleVisibilityContext.Provider value={{ toggles, setToggleVisibility, getToggleVisibility }}>
            {children}
        </ToggleVisibilityContext.Provider>
    );
}

export function useToggleVisibility() {
    const context = useContext(ToggleVisibilityContext);
    if (!context) {
        throw new Error('useToggleVisibility must be used within a ToggleVisibilityProvider');
    }
    return context;
}