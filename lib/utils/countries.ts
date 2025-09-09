// Country code to name mapping
export const COUNTRY_NAMES: { [key: string]: string } = {
  'IN': 'India',
  'US': 'United States',
  'UK': 'United Kingdom',
  'DE': 'Germany',
  'CA': 'Canada',
  'AU': 'Australia',
  'FR': 'France',
  'NL': 'Netherlands',
  'CH': 'Switzerland',
  'SG': 'Singapore',
  'JP': 'Japan',
  'AE': 'UAE',
};

// Major cities for each country
export const COUNTRY_CITIES: { [key: string]: string[] } = {
  'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'],
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
  'UK': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh'],
  'DE': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund'],
  'CA': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'],
  'NL': ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Tilburg', 'Groningen', 'Almere'],
  'CH': ['Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'St. Gallen', 'Lucerne', 'Lugano'],
  'SG': ['Singapore'],
  'JP': ['Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Yokohama'],
  'AE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
};

// Helper function to get country name from code
export const getCountryName = (code: string): string => {
  return COUNTRY_NAMES[code] || code;
};

// Helper function to get a random city for a country
export const getRandomCity = (countryCode: string): string => {
  const cities = COUNTRY_CITIES[countryCode];
  if (!cities || cities.length === 0) return '';
  return cities[Math.floor(Math.random() * cities.length)];
};

// Helper function to get location display (city, country)
export const getLocationDisplay = (countryCode: string, city?: string): string => {
  const countryName = getCountryName(countryCode);
  if (city) {
    return `${city}, ${countryName}`;
  }
  // If no city provided, use a random major city
  const randomCity = getRandomCity(countryCode);
  return randomCity ? `${randomCity}, ${countryName}` : countryName;
};

// Helper function to get location display for timeline (with random city if not provided)
export const getTimelineLocationDisplay = (countryCode: string, city?: string): string => {
  const countryName = getCountryName(countryCode);
  if (city) {
    return `${city}, ${countryName}`;
  }
  // For timeline, always show a city
  const randomCity = getRandomCity(countryCode);
  return randomCity ? `${randomCity}, ${countryName}` : countryName;
};
