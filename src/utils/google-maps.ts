import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_GEOCODE_URL, GOOGLE_MAPS_DISTANCE_MATRIX_URL } from './google-maps-config';

export interface GeocodeResult {
    lat: number;
    lng: number;
    formatted_address: string;
}

export interface DistanceMatrixResult {
    distance: {
        meters: number;
        text: string;
    };
    duration: {
        seconds: number;
        text: string;
    };
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    try {
        const url = `${GOOGLE_MAPS_GEOCODE_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&language=ko&region=kr`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                formatted_address: result.formatted_address,
            };
        }

        console.error('Geocoding failed:', data.status, data.error_message);
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const url = `${GOOGLE_MAPS_GEOCODE_URL}?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=ko&region=kr`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        }

        console.error('Reverse geocoding failed:', data.status, data.error_message);
        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

/**
 * Calculate distance and duration between two locations
 */
export async function calculateDistanceMatrix(
    origins: string,
    destinations: string
): Promise<DistanceMatrixResult | null> {
    try {
        const url = `${GOOGLE_MAPS_DISTANCE_MATRIX_URL}?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&key=${GOOGLE_MAPS_API_KEY}&language=ko&region=kr&mode=driving`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.rows && data.rows.length > 0) {
            const element = data.rows[0].elements[0];

            if (element.status === 'OK') {
                return {
                    distance: {
                        meters: element.distance.value,
                        text: element.distance.text,
                    },
                    duration: {
                        seconds: element.duration.value,
                        text: element.duration.text,
                    },
                };
            }
        }

        console.error('Distance Matrix failed:', data.status, data.error_message);
        return null;
    } catch (error) {
        console.error('Distance Matrix error:', error);
        return null;
    }
}
