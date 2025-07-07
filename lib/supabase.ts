import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PowerPlant {
    id: number;
    type: string | null;
    country_area: string | null;
    subregion: string | null;
    region: string | null;
    plant_project_name: string | null;
    capacity_mw: number | null;
    status: string | null;
    technology: string | null;
    latitude: number | null;
    longitude: number | null;
    gem_wiki_url: string | null;
    city: string | null;
    fuel: string | null;
    start_year: number | null;
    subnational_unit_state_province: string | null;
}

export interface EIAElectricityPrice {
    id: number;
    region_name: string;
    residential_2025: number | null;
    residential_2024: number | null;
    commercial_2025: number | null;
    commercial_2024: number | null;
    industrial_2025: number | null;
    industrial_2024: number | null;
    transportation_2025: number | null;
    transportation_2024: number | null;
    all_sectors_2025: number | null;
    all_sectors_2024: number | null;
}

export interface TransmissionLine {
    id: number;
    geo_shape: GeoJSON.Geometry;
    longitude: number | null;
    latitude: number | null;
    shape_length: number | null;
    owner: string | null;
    type: string | null;
    status: string | null;
    naics_desc: string | null;
}