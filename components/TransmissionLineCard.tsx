import { TransmissionLine } from '@/lib/supabase';

interface TransmissionLineCardProps {
    line: TransmissionLine;
    onClose: () => void;
    position?: {
        x: number;
        y: number;
    };
}

const capitalizeFirst = (str: string | null): string => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function TransmissionLineCard({ line, onClose, position }: TransmissionLineCardProps) {
    const cardStyle = position ? {
        position: 'absolute' as const,
        left: `${Math.min(position.x + 30, window.innerWidth - 350)}px`,
        top: `${Math.max(position.y - 100, 20)}px`,
        zIndex: 20
    } : {
        position: 'absolute' as const,
        bottom: '8rem',
        right: '2rem',
        zIndex: 20
    };

    return (
        <div 
            className="w-80 bg-white rounded-lg shadow-lg p-6"
            style={cardStyle}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Transmission Line</h2>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Owner:</span>
                    <span className="text-gray-900">{capitalizeFirst(line.owner)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Type:</span>
                    <span className="text-gray-900">{capitalizeFirst(line.type)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                        line.status?.toLowerCase() === 'operating' ? 'bg-green-100 text-green-800' :
                        line.status?.toLowerCase() === 'under construction' ? 'bg-yellow-100 text-yellow-800' :
                        line.status?.toLowerCase() === 'planned' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {capitalizeFirst(line.status)}
                    </span>
                </div>

                {line.shape_length && (
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">Length:</span>
                        <span className="text-gray-900">
                            {(line.shape_length / 1000).toFixed(1)} km
                        </span>
                    </div>
                )}

                {line.naics_desc && (
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-800">Description:</span>
                        <span className="text-gray-900 text-right text-sm">
                            {line.naics_desc}
                        </span>
                    </div>
                )}

                {line.latitude && line.longitude && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Coordinates: {line.latitude.toFixed(4)}, {line.longitude.toFixed(4)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}