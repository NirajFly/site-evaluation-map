'use client';

import { useState } from 'react';
import { X, MapPin, Network, Zap, Clock, ArrowRight } from 'lucide-react';

interface SilerCitySiteInfoProps {
    onClose: () => void;
    position?: { x: number; y: number };
}

export default function SilerCitySiteInfo({ onClose, position }: SilerCitySiteInfoProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'fiber' | 'infrastructure' | 'advantages'>('fiber');

    const siteInfo = {
        address: "1000 Carolina Core Pkwy, Siler City, NC 27344, United States",
        coordinates: { lat: 35.7419, lng: -79.5506 }
    };

    const fiberCorridors: Array<{
        name: string;
        provider: string;
        distance: string;
        latency: string;
        installType: string;
        strands?: string;
        notes: string;
        color: string;
        networkType?: string;
    }> = [
        {
            name: "County-owned fiber (US-64 frontage)",
            provider: "Chatham County MIS / open access",
            distance: "< 100 m",
            latency: "≈ 2 ms",
            installType: "Buried",
            strands: "24-144 (varies)",
            notes: "County installs are carrier-neutral; quick, low-cost entry conduit already stubbed under the highway apron. Network extends 30-50 miles from Ramseur/Randolph County to Apex/RTP.",
            color: "bg-blue-500",
            networkType: "Last-mile"
        },
        {
            name: "Norfolk Southern rail / Lumen & Zayo long-haul",
            provider: "Lumen (legacy CenturyLink) & Zayo IRU on rail ROW",
            distance: "≈ 300 m east",
            latency: "≈ 1.8 ms",
            installType: "Buried duct bank",
            notes: "Lumen & Zayo each have 864-strand trunks here; ideal for diverse A-B routing. Network extends 100+ miles from Sanford/Fayetteville to Greensboro/Durham.",
            color: "bg-green-500",
            networkType: "Long-haul"
        },
        {
            name: "MCNC / NCREN backbone (US-421 / future I-685)",
            provider: "MCNC open-access middle-mile",
            distance: "≈ 4.2 km",
            latency: "≈ 2.5 ms",
            installType: "Conduit (can be leased as dark fiber)",
            notes: "Provides inexpensive dark-fiber IRUs and ties directly into the NCREN 400-Gb backbone. Network extends 40-60 miles from Greensboro Triad to RTP core.",
            color: "bg-purple-500",
            networkType: "Middle-mile"
        }
    ];

    const cardStyle = position ? {
        position: 'fixed' as const,
        top: Math.min(position.y, window.innerHeight - 600),
        left: Math.min(position.x, window.innerWidth - 800),
        zIndex: 1000,
    } : {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
    };

    return (
        <div style={cardStyle} className="w-[800px] max-h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MapPin className="h-6 w-6" />
                        <div>
                            <h2 className="text-xl font-bold">Siler City Data Center Site</h2>
                            <p className="text-blue-100 text-sm">{siteInfo.address}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-blue-100 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {[
                        { id: 'fiber', label: 'Fiber Networks', icon: Network },
                        { id: 'infrastructure', label: 'Infrastructure', icon: Zap },
                        { id: 'advantages', label: 'Site Advantages', icon: ArrowRight }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[400px]">
                {activeTab === 'fiber' && (
                    <div className="space-y-6">
                        {/* Overview */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-semibold text-green-800 mb-2">Fiber Connectivity Assessment</h3>
                            <p className="text-green-700 text-sm">
                                Excellent fiber infrastructure with multiple providers and redundant pathways. 
                                Telecom fiber can be brought to service in as little as 90 days with carrier-neutral 
                                access and high-bandwidth, low-latency connectivity to major data centers.
                            </p>
                        </div>

                        {/* Fiber Corridors */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Available Fiber Corridors</h3>
                            {fiberCorridors.map((corridor, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${corridor.color}`}></div>
                                            <div>
                                                <h4 className="font-medium text-gray-800">{corridor.name}</h4>
                                                {corridor.networkType && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                        {corridor.networkType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="text-gray-600">{corridor.distance}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock size={14} className="text-gray-400" />
                                                <span className="text-gray-600">{corridor.latency}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Provider:</span>
                                            <p className="text-sm text-gray-700">{corridor.provider}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Install Type:</span>
                                            <p className="text-sm text-gray-700">{corridor.installType}</p>
                                        </div>
                                    </div>
                                    
                                    {corridor.strands && (
                                        <div className="mb-3">
                                            <span className="text-sm font-medium text-gray-500">Strands:</span>
                                            <p className="text-sm text-gray-700">{corridor.strands}</p>
                                        </div>
                                    )}
                                    
                                    <p className="text-sm text-gray-600 italic">{corridor.notes}</p>
                                </div>
                            ))}
                        </div>

                        {/* Key Benefits */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">Key Connectivity Benefits</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Carrier-neutral fiber availability with multiple providers</li>
                                <li>• High-bandwidth, low-latency connectivity to Research Triangle Park</li>
                                <li>• Redundant pathways for network resilience</li>
                                <li>• Quick deployment timeline (90 days or less)</li>
                                <li>• Access to major long-haul fiber routes</li>
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'infrastructure' && (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <Network size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Infrastructure Details</h3>
                            <p className="text-gray-500">Transportation and utility infrastructure information coming soon...</p>
                        </div>
                    </div>
                )}

                {activeTab === 'advantages' && (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <ArrowRight size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Site Advantages</h3>
                            <p className="text-gray-500">Tech Triangle proximity and other advantages coming soon...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 