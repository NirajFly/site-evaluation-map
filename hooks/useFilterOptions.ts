import { useState, useEffect } from 'react';

// Exact types from the database
const COMMON_TYPES = [
    'bioenergy', 'coal', 'geothermal', 'hydropower', 
    'nuclear', 'oil/gas', 'solar', 'wind'
];

const COMMON_STATUSES = [
    'operating', 'construction', 'planned', 'announced', 
    'retired', 'cancelled', 'shelved', 'permitted'
];

export function useFilterOptions() {
    const [types, setTypes] = useState<string[]>(COMMON_TYPES);
    const [statuses, setStatuses] = useState<string[]>(COMMON_STATUSES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Try the API route first
                const response = await fetch('/api/filter-options');
                if (response.ok) {
                    const data = await response.json();
                    if (data.types && data.types.length > 0) {
                        setTypes(data.types.sort());
                    }
                    if (data.statuses && data.statuses.length > 0) {
                        setStatuses(data.statuses.sort());
                    }
                }
            } catch (error) {
                console.error('Error fetching filter options:', error);
                // Keep the default values
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return { types, statuses, loading };
}