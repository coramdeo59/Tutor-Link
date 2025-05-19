// List of Ethiopian regions (states/provinces)
export const ethiopianRegions = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South West Ethiopia",
  "Southern Nations, Nationalities, and Peoples' Region (SNNPR)",
  "Tigray"
];

// Map of regions to their major cities
export const ethiopianCities: { [region: string]: string[] } = {
  "Addis Ababa": [
    "Addis Ababa",
    "Bole",
    "Kirkos",
    "Arada",
    "Lideta",
    "Yeka",
    "Akaki-Kaliti",
    "Nefas Silk-Lafto",
    "Kolfe Keranio",
    "Gulele",
    "Addis Ketema"
  ],
  "Afar": [
    "Semera",
    "Dubti",
    "Gewane",
    "Assaita",
    "Awash",
    "Chifra",
    "Dichoto",
    "Aysaita",
    "Afdera",
    "Mille"
  ],
  "Amhara": [
    "Bahir Dar",
    "Gondar",
    "Dessie",
    "Kombolcha",
    "Debre Birhan",
    "Woldia",
    "Debre Markos",
    "Finote Selam",
    "Injibara",
    "Lalibela",
    "Metema",
    "Debre Tabor",
    "Sekota"
  ],
  "Benishangul-Gumuz": [
    "Assosa",
    "Bambasi",
    "Menge",
    "Debati",
    "Kamashi",
    "Kurmuk",
    "Sherkole",
    "Wembera",
    "Pawe"
  ],
  "Dire Dawa": [
    "Dire Dawa"
  ],
  "Gambela": [
    "Gambela",
    "Abobo",
    "Itang",
    "Lare",
    "Jikawo",
    "Godere",
    "Mengesh"
  ],
  "Harari": [
    "Harar"
  ],
  "Oromia": [
    "Adama",
    "Jimma",
    "Nekemte",
    "Shashamane",
    "Bishoftu",
    "Asella",
    "Ambo",
    "Bale Robe",
    "Fiche",
    "Metu",
    "Negele Arsi",
    "Batu (Ziway)",
    "Sebeta",
    "Woliso",
    "Gimbi",
    "Chiro",
    "Waliso",
    "Dodola",
    "Negele Borana",
    "Moyale",
    "Yabelo"
  ],
  "Sidama": [
    "Hawassa",
    "Yirgalem",
    "Leku",
    "Aleta Wendo",
    "Daye",
    "Bensa",
    "Arbegona",
    "Wondo Genet",
    "Chuko",
    "Bona"
  ],
  "Somali": [
    "Jijiga",
    "Degehabur",
    "Kebri Dehar",
    "Gode",
    "Kelafo",
    "Werder",
    "Shinile",
    "Erer",
    "Afdem",
    "Dolo Odo",
    "Filtu",
    "Moyale"
  ],
  "South West Ethiopia": [
    "Bonga",
    "Tepi",
    "Mizan Teferi",
    "Masha",
    "Jemu",
    "Chencha",
    "Arba Minch",
    "Sawla",
    "Konso",
    "Jinka"
  ],
  "Southern Nations, Nationalities, and Peoples' Region (SNNPR)": [
    "Dilla",
    "Sodo",
    "Hosaena",
    "Werabe",
    "Durame",
    "Butajira",
    "Worabe",
    "Boditi",
    "Welkite",
    "Areka",
    "Halaba Kulito"
  ],
  "Tigray": [
    "Mekelle",
    "Adigrat",
    "Shire",
    "Aksum",
    "Adwa",
    "Wukro",
    "Maychew",
    "Humera",
    "Alamata",
    "Korem"
  ]
};

// Getting all cities in a flat list (for filtering or searching)
export const getAllEthiopianCities = (): string[] => {
  return Object.values(ethiopianCities).flat();
};

// Function to get cities for a specific region
export const getCitiesByRegion = (region: string): string[] => {
  return ethiopianCities[region] || [];
};
