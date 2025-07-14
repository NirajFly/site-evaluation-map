'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, Settings } from 'lucide-react';
import { useToggleVisibility } from '@/contexts/ToggleVisibilityContext';

export default function ToggleManagerBar() {
    const [isOpen, setIsOpen] = useState(false);
    const { toggles, setToggleVisibility } = useToggleVisibility();

    return (
        <div className="absolute top-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors rounded-lg"
                >
                    <Settings size={18} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Toggle Manager</span>
                    {isOpen ? (
                        <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                    )}
                </button>
                
                {isOpen && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[300px]">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Show/Hide UI Elements</h3>
                        <div className="space-y-2">
                            {toggles.map(toggle => (
                                <div key={toggle.id} className="flex items-center justify-between py-1">
                                    <span className="text-sm text-gray-600">{toggle.name}</span>
                                    <button
                                        onClick={() => setToggleVisibility(toggle.id, !toggle.visible)}
                                        className={`p-1 rounded transition-colors ${
                                            toggle.visible 
                                                ? 'text-blue-600 hover:bg-blue-50' 
                                                : 'text-gray-400 hover:bg-gray-50'
                                        }`}
                                        aria-label={`${toggle.visible ? 'Hide' : 'Show'} ${toggle.name}`}
                                    >
                                        {toggle.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 italic">
                                Tip: You can also drag toggles to reposition them
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}