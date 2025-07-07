import { useState } from 'react';

interface TransmissionLinesToggleProps {
    showTransmissionLines: boolean;
    onToggle: (show: boolean) => void;
}

export default function TransmissionLinesToggle({ showTransmissionLines, onToggle }: TransmissionLinesToggleProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute top-4 right-60 z-10 bg-white rounded-lg shadow-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-black hover:bg-gray-100 rounded-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Infrastructure</span>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 p-4 bg-white rounded-lg shadow-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showTransmissionLines}
                            onChange={(e) => onToggle(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-orange-500"></div>
                            <span className="text-sm text-black">Transmission Lines</span>
                        </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                        Visible when zoomed in
                    </p>
                </div>
            )}
        </div>
    );
}