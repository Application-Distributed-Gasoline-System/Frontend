import { NominatimLocation } from "../types/nominatim";

export const nominatimApi = {
    async searchAddresses(query: string, limit: number = 4): Promise<NominatimLocation[]> {
        if (!query || query.trim().length < 5) {
            return [];
        }

        try {
            const baseUrl = 'https://nominatim.openstreetmap.org';
            const encodedQuery = encodeURIComponent(query);
            const url = `${baseUrl}/search?format=json&q=${encodedQuery}&countrycodes=ec&limit=${limit}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'SafeTrade-App' },
            });
            if (!response.ok) {
                throw new Error(`Nominatim API error: ${response.statusText}`);
            }
            const data: NominatimLocation[] = await response.json();

            if (!data || data.length === 0) {
                console.log(`No results found for search: ${query}`);
                return [];
            }

            const results: NominatimLocation[] = data.map((item) => ({
                display_name: item.display_name,
                lat: item.lat,
                lon: item.lon,
                type: item.type,
                importance: item.importance,
            }));
            return results;
        } catch (error) {
            console.error('Failed to search addresses:', error);
            return [];
        }
    }

}