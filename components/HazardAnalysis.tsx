import { useCountyFromCoords } from '@/hooks/useCountyFromCoords';
import { useNRIData } from '@/hooks/useNRIData';

interface HazardAnalysisProps {
    latitude?: number | null;
    longitude?: number | null;
    onClose: () => void;
}

const getRiskColor = (rating?: string) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    
    const ratingLower = rating.toLowerCase();
    if (ratingLower.includes('very high')) return 'bg-red-100 text-red-800';
    if (ratingLower.includes('high')) return 'bg-orange-100 text-orange-800';
    if (ratingLower.includes('medium')) return 'bg-yellow-100 text-yellow-800';
    if (ratingLower.includes('low')) return 'bg-green-100 text-green-800';
    if (ratingLower.includes('very low')) return 'bg-blue-100 text-blue-800';
    
    return 'bg-gray-100 text-gray-800';
};

const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return 'N/A';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
};

const formatArea = (area?: number) => {
    if (area === undefined || area === null) return 'N/A';
    return `${area.toLocaleString()} sq mi`;
};

const hazardData = [
    { key: 'rfld_riskr', name: 'Riverine Flood', icon: '🌊' },
    { key: 'cfld_riskr', name: 'Coastal Surge', icon: '🌊' },
    { key: 'erqk_riskr', name: 'Earthquake', icon: '🌋' },
    { key: 'hrcn_riskr', name: 'Hurricane', icon: '🌀' },
    { key: 'trnd_riskr', name: 'Tornado', icon: '🌪️' },
    { key: 'wfir_riskr', name: 'Wildfire', icon: '🔥' },
    { key: 'drgt_riskr', name: 'Drought', icon: '☀️' },
    { key: 'hwav_riskr', name: 'Extreme Heat', icon: '🌡️' },
    { key: 'lnds_riskr', name: 'Landslide', icon: '🏔️' },
    { key: 'wntw_riskr', name: 'Severe Winter Weather', icon: '❄️' },
    { key: 'avln_riskr', name: 'Avalanche', icon: '🏔️' },
    { key: 'cwav_riskr', name: 'Coastal Wave', icon: '🌊' },
    { key: 'hail_riskr', name: 'Hail', icon: '🧊' },
    { key: 'isth_riskr', name: 'Ice Storm', icon: '🧊' },
    { key: 'ltng_riskr', name: 'Lightning', icon: '⚡' },
    { key: 'swnd_riskr', name: 'Strong Wind', icon: '💨' },
    { key: 'tsun_riskr', name: 'Tsunami', icon: '🌊' },
    { key: 'vlcn_riskr', name: 'Volcanic Activity', icon: '🌋' },
];

export default function HazardAnalysis({ latitude, longitude, onClose }: HazardAnalysisProps) {
    const { countyInfo, loading: countyLoading, error: countyError } = useCountyFromCoords({ latitude, longitude });
    const { data, loading: nriLoading, error: nriError } = useNRIData({ 
        state: countyInfo?.state, 
        county: countyInfo?.county 
    });

    const loading = countyLoading || nriLoading;
    const error = countyError || nriError;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Hazard Analysis</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                {countyLoading ? 'Identifying location...' : 'Analyzing hazards...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Hazard Analysis</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                            {error || 'No hazard data available for this location'}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Hazard Analysis</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-black mb-2">
                        {data.county}, {data.stateabbrv}
                    </h3>
                    <p className="text-sm text-black">NRI ID: {data.nri_id}</p>
                </div>

                {/* Administrative Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Administrative Info</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-black">State FIPS:</span>
                                <span className="font-medium text-black">{data.stateabbrv}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black">County Type:</span>
                                <span className="font-medium text-black">{data.countytype || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-3">Exposure Baseline</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-black">Population:</span>
                                <span className="font-medium text-black">{formatNumber(data.population)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black">Building Value:</span>
                                <span className="font-medium text-black">${formatNumber(data.buildvalue)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black">Agriculture Value:</span>
                                <span className="font-medium text-black">${formatNumber(data.agrivalue)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black">Area:</span>
                                <span className="font-medium text-black">{formatArea(data.area)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Composite Risk */}
                <div className="bg-blue-50 p-6 rounded-lg mb-8">
                    <h4 className="font-semibold text-gray-800 mb-4">Composite Risk Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{formatNumber(data.risk_value)}</div>
                            <div className="text-sm text-gray-600">Risk Value</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{data.risk_score?.toFixed(1) || 'N/A'}</div>
                            <div className="text-sm text-gray-600">Risk Score</div>
                        </div>
                        <div className="text-center">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(data.risk_ratng)}`}>
                                {data.risk_ratng || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Risk Rating</div>
                        </div>
                    </div>
                </div>

                {/* Per-Hazard Risk Analysis */}
                <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Per-Hazard Risk Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {hazardData.map((hazard) => {
                            const riskRating = data[hazard.key as keyof typeof data] as string | undefined;
                            return (
                                <div key={hazard.key} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{hazard.icon}</span>
                                            <span className="font-medium text-gray-800">{hazard.name}</span>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskRating)}`}>
                                            {riskRating || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    );
} 