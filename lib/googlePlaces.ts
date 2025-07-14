// Google Places API utilities
const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface GooglePlaceSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
  types: string[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  opening_hours?: {
    open_now: boolean;
    periods: unknown[];
    weekday_text: string[];
  };
}

export const googlePlacesAPI = {
  // Get place suggestions based on text input
  getPlaceSuggestions: async (
    input: string
  ): Promise<GooglePlaceSuggestion[]> => {
    try {
      if (!input || input.length < 2) {
        return [];
      }

      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.predictions || [];
    } catch (error) {
      console.error("Error fetching place suggestions:", error);
      return [];
    }
  },

  // Get detailed place information by place_id
  getPlaceDetails: async (
    placeId: string
  ): Promise<GooglePlaceDetails | null> => {
    try {
      const response = await fetch(`/api/places/details?place_id=${placeId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.result || null;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  },

  // Get photo URL from photo reference
  getPhotoUrl: (photoReference: string, maxWidth: number = 400): string => {
    if (!GOOGLE_PLACES_API_KEY) {
      return "";
    }
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  },
};
