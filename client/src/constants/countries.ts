export interface Region {
  name: string;
  shortCode: string;
}

export interface Country {
  countryName: string;
  countryShortCode: string;
  regions: Region[];
}

// Popular countries for e-commerce (subset for better performance)
export const countries: Country[] = [
  {
    countryName: "United States",
    countryShortCode: "US",
    regions: [
      { name: "Alabama", shortCode: "AL" },
      { name: "Alaska", shortCode: "AK" },
      { name: "Arizona", shortCode: "AZ" },
      { name: "Arkansas", shortCode: "AR" },
      { name: "California", shortCode: "CA" },
      { name: "Colorado", shortCode: "CO" },
      { name: "Connecticut", shortCode: "CT" },
      { name: "Delaware", shortCode: "DE" },
      { name: "Florida", shortCode: "FL" },
      { name: "Georgia", shortCode: "GA" },
      { name: "Hawaii", shortCode: "HI" },
      { name: "Idaho", shortCode: "ID" },
      { name: "Illinois", shortCode: "IL" },
      { name: "Indiana", shortCode: "IN" },
      { name: "Iowa", shortCode: "IA" },
      { name: "Kansas", shortCode: "KS" },
      { name: "Kentucky", shortCode: "KY" },
      { name: "Louisiana", shortCode: "LA" },
      { name: "Maine", shortCode: "ME" },
      { name: "Maryland", shortCode: "MD" },
      { name: "Massachusetts", shortCode: "MA" },
      { name: "Michigan", shortCode: "MI" },
      { name: "Minnesota", shortCode: "MN" },
      { name: "Mississippi", shortCode: "MS" },
      { name: "Missouri", shortCode: "MO" },
      { name: "Montana", shortCode: "MT" },
      { name: "Nebraska", shortCode: "NE" },
      { name: "Nevada", shortCode: "NV" },
      { name: "New Hampshire", shortCode: "NH" },
      { name: "New Jersey", shortCode: "NJ" },
      { name: "New Mexico", shortCode: "NM" },
      { name: "New York", shortCode: "NY" },
      { name: "North Carolina", shortCode: "NC" },
      { name: "North Dakota", shortCode: "ND" },
      { name: "Ohio", shortCode: "OH" },
      { name: "Oklahoma", shortCode: "OK" },
      { name: "Oregon", shortCode: "OR" },
      { name: "Pennsylvania", shortCode: "PA" },
      { name: "Rhode Island", shortCode: "RI" },
      { name: "South Carolina", shortCode: "SC" },
      { name: "South Dakota", shortCode: "SD" },
      { name: "Tennessee", shortCode: "TN" },
      { name: "Texas", shortCode: "TX" },
      { name: "Utah", shortCode: "UT" },
      { name: "Vermont", shortCode: "VT" },
      { name: "Virginia", shortCode: "VA" },
      { name: "Washington", shortCode: "WA" },
      { name: "West Virginia", shortCode: "WV" },
      { name: "Wisconsin", shortCode: "WI" },
      { name: "Wyoming", shortCode: "WY" },
    ],
  },
  {
    countryName: "Canada",
    countryShortCode: "CA",
    regions: [
      { name: "Alberta", shortCode: "AB" },
      { name: "British Columbia", shortCode: "BC" },
      { name: "Manitoba", shortCode: "MB" },
      { name: "New Brunswick", shortCode: "NB" },
      { name: "Newfoundland and Labrador", shortCode: "NL" },
      { name: "Northwest Territories", shortCode: "NT" },
      { name: "Nova Scotia", shortCode: "NS" },
      { name: "Nunavut", shortCode: "NU" },
      { name: "Ontario", shortCode: "ON" },
      { name: "Prince Edward Island", shortCode: "PE" },
      { name: "Quebec", shortCode: "QC" },
      { name: "Saskatchewan", shortCode: "SK" },
      { name: "Yukon", shortCode: "YT" },
    ],
  },
  {
    countryName: "United Kingdom",
    countryShortCode: "GB",
    regions: [
      { name: "England", shortCode: "ENG" },
      { name: "Scotland", shortCode: "SCT" },
      { name: "Wales", shortCode: "WLS" },
      { name: "Northern Ireland", shortCode: "NIR" },
    ],
  },
  {
    countryName: "Australia",
    countryShortCode: "AU",
    regions: [
      { name: "Australian Capital Territory", shortCode: "ACT" },
      { name: "New South Wales", shortCode: "NSW" },
      { name: "Northern Territory", shortCode: "NT" },
      { name: "Queensland", shortCode: "QLD" },
      { name: "South Australia", shortCode: "SA" },
      { name: "Tasmania", shortCode: "TAS" },
      { name: "Victoria", shortCode: "VIC" },
      { name: "Western Australia", shortCode: "WA" },
    ],
  },
  {
    countryName: "Germany",
    countryShortCode: "DE",
    regions: [
      { name: "Baden-Württemberg", shortCode: "BW" },
      { name: "Bavaria", shortCode: "BY" },
      { name: "Berlin", shortCode: "BE" },
      { name: "Brandenburg", shortCode: "BB" },
      { name: "Bremen", shortCode: "HB" },
      { name: "Hamburg", shortCode: "HH" },
      { name: "Hesse", shortCode: "HE" },
      { name: "Lower Saxony", shortCode: "NI" },
      { name: "Mecklenburg-Vorpommern", shortCode: "MV" },
      { name: "North Rhine-Westphalia", shortCode: "NW" },
      { name: "Rhineland-Palatinate", shortCode: "RP" },
      { name: "Saarland", shortCode: "SL" },
      { name: "Saxony", shortCode: "SN" },
      { name: "Saxony-Anhalt", shortCode: "ST" },
      { name: "Schleswig-Holstein", shortCode: "SH" },
      { name: "Thuringia", shortCode: "TH" },
    ],
  },
  {
    countryName: "France",
    countryShortCode: "FR",
    regions: [
      { name: "Auvergne-Rhône-Alpes", shortCode: "ARA" },
      { name: "Bourgogne-Franche-Comté", shortCode: "BFC" },
      { name: "Brittany", shortCode: "BRE" },
      { name: "Centre-Val de Loire", shortCode: "CVL" },
      { name: "Corsica", shortCode: "COR" },
      { name: "Grand Est", shortCode: "GES" },
      { name: "Hauts-de-France", shortCode: "HDF" },
      { name: "Île-de-France", shortCode: "IDF" },
      { name: "Normandy", shortCode: "NOR" },
      { name: "Nouvelle-Aquitaine", shortCode: "NAQ" },
      { name: "Occitania", shortCode: "OCC" },
      { name: "Pays de la Loire", shortCode: "PDL" },
      { name: "Provence-Alpes-Côte d'Azur", shortCode: "PAC" },
    ],
  },
  {
    countryName: "India",
    countryShortCode: "IN",
    regions: [
      { name: "Andhra Pradesh", shortCode: "AP" },
      { name: "Arunachal Pradesh", shortCode: "AR" },
      { name: "Assam", shortCode: "AS" },
      { name: "Bihar", shortCode: "BR" },
      { name: "Chhattisgarh", shortCode: "CG" },
      { name: "Delhi", shortCode: "DL" },
      { name: "Goa", shortCode: "GA" },
      { name: "Gujarat", shortCode: "GJ" },
      { name: "Haryana", shortCode: "HR" },
      { name: "Himachal Pradesh", shortCode: "HP" },
      { name: "Jharkhand", shortCode: "JH" },
      { name: "Karnataka", shortCode: "KA" },
      { name: "Kerala", shortCode: "KL" },
      { name: "Madhya Pradesh", shortCode: "MP" },
      { name: "Maharashtra", shortCode: "MH" },
      { name: "Manipur", shortCode: "MN" },
      { name: "Meghalaya", shortCode: "ML" },
      { name: "Mizoram", shortCode: "MZ" },
      { name: "Nagaland", shortCode: "NL" },
      { name: "Odisha", shortCode: "OR" },
      { name: "Punjab", shortCode: "PB" },
      { name: "Rajasthan", shortCode: "RJ" },
      { name: "Sikkim", shortCode: "SK" },
      { name: "Tamil Nadu", shortCode: "TN" },
      { name: "Telangana", shortCode: "TS" },
      { name: "Tripura", shortCode: "TR" },
      { name: "Uttar Pradesh", shortCode: "UP" },
      { name: "Uttarakhand", shortCode: "UK" },
      { name: "West Bengal", shortCode: "WB" },
    ],
  },
];

// Helper functions
export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find((country) => country.countryShortCode === code);
};

export const getRegionsByCountry = (countryCode: string): Region[] => {
  const country = getCountryByCode(countryCode);
  return country ? country.regions : [];
};

export const getCountryNames = (): string[] => {
  return countries.map((country) => country.countryName);
};

export const getCountryCodes = (): string[] => {
  return countries.map((country) => country.countryShortCode);
};
