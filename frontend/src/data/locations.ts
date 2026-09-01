export interface CityInfo {
  name: string;
  isPopular?: boolean;
}

export interface RegionInfo {
  id: string;
  name: string;
  cities: string[];
}

export interface CountryInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  regions: RegionInfo[];
}

export interface LocationMatch {
  type: 'country' | 'region' | 'city';
  countryCode: string;
  countryName: string;
  regionId?: string;
  regionName?: string;
  cityName?: string;
  displayName: string;
  formattedValue: string;
}

export const POPULAR_POLISH_CITIES: Array<{ city: string; region: string }> = [
  { city: "Warszawa", region: "Mazowieckie" },
  { city: "Kraków", region: "Małopolskie" },
  { city: "Wrocław", region: "Dolnośląskie" },
  { city: "Poznań", region: "Wielkopolskie" },
  { city: "Gdańsk", region: "Pomorskie" },
  { city: "Katowice", region: "Śląskie" },
  { city: "Łódź", region: "Łódzkie" },
  { city: "Szczecin", region: "Zachodniopomorskie" },
  { city: "Lublin", region: "Lubelskie" },
  { city: "Bydgoszcz", region: "Kujawsko-Pomorskie" },
  { city: "Białystok", region: "Podlaskie" },
  { city: "Gdynia", region: "Pomorskie" },
];

export const COUNTRIES_DATA: CountryInfo[] = [
  {
    code: "PL",
    name: "Poland",
    nativeName: "Polska",
    flag: "🇵🇱",
    regions: [
      {
        id: "dolnoslaskie",
        name: "Dolnośląskie",
        cities: [
          "Wrocław", "Wałbrzych", "Legnica", "Jelenia Góra", "Lubin", 
          "Głogów", "Świdnica", "Bolesławiec", "Oleśnica", "Dzierżoniów",
          "Oława", "Zgorzelec", "Bielawa", "Kłodzko", "Jawor", "Świebodzice"
        ]
      },
      {
        id: "kujawsko-pomorskie",
        name: "Kujawsko-Pomorskie",
        cities: [
          "Bydgoszcz", "Toruń", "Włocławek", "Grudziądz", "Inowrocław", 
          "Brodnica", "Świecie", "Chełmno", "Nakło nad Notecią", "Rypin",
          "Solec Kujawski", "Lipno", "Żnin", "Tuchola"
        ]
      },
      {
        id: "lubelskie",
        name: "Lubelskie",
        cities: [
          "Lublin", "Zamość", "Chełm", "Biała Podlaska", "Puławy", 
          "Świdnik", "Kraśnik", "Łuków", "Biłgoraj", "Lubartów",
          "Tomaszów Lubelski", "Łęczna", "Krasnystaw", "Hrubieszów", "Dęblin"
        ]
      },
      {
        id: "lubuskie",
        name: "Lubuskie",
        cities: [
          "Gorzów Wielkopolski", "Zielona Góra", "Nowa Sól", "Żary", "Żagań", 
          "Świebodzin", "Międzyrzecz", "Kostrzyn nad Odrą", "Słubice", "Gubin",
          "Lubsko", "Wschowa", "Szprotawa"
        ]
      },
      {
        id: "lodzkie",
        name: "Łódzkie",
        cities: [
          "Łódź", "Piotrków Trybunalski", "Pabianice", "Tomaszów Mazowiecki", 
          "Bełchatów", "Zgierz", "Skierniewice", "Radomsko", "Kutno", 
          "Sieradz", "Zduńska Wola", "Łowicz", "Wieluń", "Aleksandrów Łódzki", "Opoczno"
        ]
      },
      {
        id: "malopolskie",
        name: "Małopolskie",
        cities: [
          "Kraków", "Tarnów", "Nowy Sącz", "Oświęcim", "Chrzanów", 
          "Olkusz", "Nowy Targ", "Bochnia", "Gorlice", "Zakopane", 
          "Wieliczka", "Skawina", "Andrychów", "Wadowice", "Kęty", "Myślenice"
        ]
      },
      {
        id: "mazowieckie",
        name: "Mazowieckie",
        cities: [
          "Warszawa", "Radom", "Płock", "Siedlce", "Pruszków", 
          "Legionowo", "Ostrołęka", "Piaseczno", "Otwock", "Ciechanów", 
          "Żyrardów", "Mińsk Mazowiecki", "Wołomin", "Sochaczew", "Ząbki", 
          "Marki", "Nowy Dwór Mazowiecki", "Grodzisk Mazowiecki", "Wyszków", "Mława"
        ]
      },
      {
        id: "opolskie",
        name: "Opolskie",
        cities: [
          "Opole", "Kędzierzyn-Koźle", "Nysa", "Brzeg", "Kluczbork", 
          "Prudnik", "Strzelce Opolskie", "Krapkowice", "Namysłów", "Głuchołazy",
          "Kietrz", "Gogolin"
        ]
      },
      {
        id: "podkarpackie",
        name: "Podkarpackie",
        cities: [
          "Rzeszów", "Przemyśl", "Stalowa Wola", "Mielec", "Tarnobrzeg", 
          "Krosno", "Dębica", "Sanok", "Jarosław", "Jasło", 
          "Łańcut", "Przeworsk", "Ropczyce", "Nisko", "Leżajsk"
        ]
      },
      {
        id: "podlaskie",
        name: "Podlaskie",
        cities: [
          "Białystok", "Suwałki", "Łomża", "Augustów", "Bielsk Podlaski", 
          "Zambrów", "Grajewo", "Hajnówka", "Sokółka", "Łapy", 
          "Siemiatycze", "Kolno", "Mońki"
        ]
      },
      {
        id: "pomorskie",
        name: "Pomorskie",
        cities: [
          "Gdańsk", "Gdynia", "Sopot", "Słupsk", "Tczew", 
          "Wejherowo", "Starogard Gdański", "Rumia", "Chojnice", "Malbork", 
          "Kwidzyn", "Lębork", "Pruszcz Gdański", "Reda", "Kościerzyna", "Bytów"
        ]
      },
      {
        id: "slaskie",
        name: "Śląskie",
        cities: [
          "Katowice", "Częstochowa", "Sosnowiec", "Gliwice", "Zabrze", 
          "Bielsko-Biała", "Bytom", "Ruda Śląska", "Rybnik", "Tychy", 
          "Dąbrowa Górnicza", "Chorzów", "Jaworzno", "Jastrzębie-Zdrój", "Mysłowice",
          "Siemianowice Śląskie", "Żory", "Tarnowskie Góry", "Będzin", "Piekary Śląskie",
          "Racibórz", "Świętochłowice", "Zawiercie", "Wodzisław Śląski", "Cieszyn"
        ]
      },
      {
        id: "swietokrzyskie",
        name: "Świętokrzyskie",
        cities: [
          "Kielce", "Ostrowiec Świętokrzyski", "Starachowice", "Skarżysko-Kamienna", 
          "Sandomierz", "Końskie", "Busko-Zdrój", "Jędrzejów", "Staszów", 
          "Pińczów", "Włoszczowa"
        ]
      },
      {
        id: "warminsko-mazurskie",
        name: "Warmińsko-Mazurskie",
        cities: [
          "Olsztyn", "Elbląg", "Ełk", "Iława", "Ostróda", 
          "Giżycko", "Kętrzyn", "Szczytno", "Bartoszyce", "Działdowo", 
          "Mrągowo", "Braniewo", "Olecko", "Lidzbark Warmiński", "Pisz"
        ]
      },
      {
        id: "wielkopolskie",
        name: "Wielkopolskie",
        cities: [
          "Poznań", "Kalisz", "Konin", "Piła", "Ostrów Wielkopolski", 
          "Gniezno", "Leszno", "Swarzędz", "Śrem", "Krotoszyn", 
          "Września", "Luboń", "Turek", "Jarocin", "Wągrowiec", "Kościan"
        ]
      },
      {
        id: "zachodniopomorskie",
        name: "Zachodniopomorskie",
        cities: [
          "Szczecin", "Koszalin", "Stargard", "Kołobrzeg", "Świnoujście", 
          "Szczecinek", "Police", "Wałcz", "Białogard", "Goleniów", 
          "Gryfino", "Nowogard", "Świdwin", "Choszczno", "Barlinek"
        ]
      }
    ]
  },
  {
    code: "DE",
    name: "Germany",
    nativeName: "Deutschland",
    flag: "🇩🇪",
    regions: [
      { id: "berlin", name: "Berlin", cities: ["Berlin"] },
      { id: "bayern", name: "Bayern", cities: ["München", "Nürnberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg"] },
      { id: "baden-wuerttemberg", name: "Baden-Württemberg", cities: ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg", "Ulm"] },
      { id: "nordrhein-westfalen", name: "Nordrhein-Westfalen", cities: ["Köln", "Düsseldorf", "Dortmund", "Essen", "Bonn", "Münster", "Aachen", "Bielefeld"] },
      { id: "hessen", name: "Hessen", cities: ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach"] },
      { id: "sachsen", name: "Sachsen", cities: ["Leipzig", "Dresden", "Chemnitz", "Zwickau"] },
      { id: "hamburg", name: "Hamburg", cities: ["Hamburg"] },
      { id: "niedersachsen", name: "Niedersachsen", cities: ["Hannover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg"] }
    ]
  },
  {
    code: "FR",
    name: "France",
    nativeName: "France",
    flag: "🇫🇷",
    regions: [
      { id: "ile-de-france", name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Versailles"] },
      { id: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Annecy"] },
      { id: "provence-alpes-cote-azur", name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes", "Avignon"] },
      { id: "occitanie", name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"] },
      { id: "nouvelle-aquitaine", name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle"] },
      { id: "grand-est", name: "Grand Est", cities: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy"] }
    ]
  },
  {
    code: "ES",
    name: "Spain",
    nativeName: "España",
    flag: "🇪🇸",
    regions: [
      { id: "madrid", name: "Comunidad de Madrid", cities: ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés", "Getafe"] },
      { id: "cataluna", name: "Cataluña", cities: ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Tarragona", "Girona"] },
      { id: "andalucia", name: "Andalucía", cities: ["Sevilla", "Málaga", "Córdoba", "Granada", "Jerez de la Frontera", "Almería", "Cádiz"] },
      { id: "comunidad-valenciana", name: "Comunidad Valenciana", cities: ["Valencia", "Alicante", "Elche", "Castellón de la Plana", "Torrevieja"] },
      { id: "pais-vasco", name: "País Vasco", cities: ["Bilbao", "Vitoria-Gasteiz", "San Sebastián", "Barakaldo"] },
      { id: "galicia", name: "Galicia", cities: ["Vigo", "A Coruña", "Ourense", "Santiago de Compostela", "Lugo"] }
    ]
  },
  {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    flag: "🇮🇹",
    regions: [
      { id: "lombardia", name: "Lombardia", cities: ["Milano", "Brescia", "Monza", "Bergamo", "Como", "Varese", "Pavia"] },
      { id: "lazio", name: "Lazio", cities: ["Roma", "Latina", "Guidonia Montecelio", "Fiumicino", "Viterbo"] },
      { id: "campania", name: "Campania", cities: ["Napoli", "Salerno", "Giugliano in Campania", "Torre del Greco", "Caserta"] },
      { id: "veneto", name: "Veneto", cities: ["Venezia", "Verona", "Padova", "Vicenza", "Treviso"] },
      { id: "piemonte", name: "Piemonte", cities: ["Torino", "Novara", "Alessandria", "Asti"] },
      { id: "toscana", name: "Toscana", cities: ["Firenze", "Prato", "Livorno", "Arezzo", "Pisa", "Lucca"] },
      { id: "sicilia", name: "Sicilia", cities: ["Palermo", "Catania", "Messina", "Siracusa", "Trapani"] }
    ]
  },
  {
    code: "GB",
    name: "United Kingdom",
    nativeName: "United Kingdom",
    flag: "🇬🇧",
    regions: [
      { id: "greater-london", name: "Greater London", cities: ["London", "Croydon", "Barnet", "Ealing", "Bromley"] },
      { id: "greater-manchester", name: "Greater Manchester", cities: ["Manchester", "Salford", "Bolton", "Stockport", "Oldham"] },
      { id: "west-midlands", name: "West Midlands", cities: ["Birmingham", "Coventry", "Wolverhampton", "Solihull", "Walsall"] },
      { id: "scotland", name: "Scotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"] },
      { id: "west-yorkshire", name: "West Yorkshire", cities: ["Leeds", "Bradford", "Wakefield", "Huddersfield", "Halifax"] }
    ]
  },
  {
    code: "GR",
    name: "Greece",
    nativeName: "Ελλάδα",
    flag: "🇬🇷",
    regions: [
      { id: "attica", name: "Attica", cities: ["Athens", "Piraeus", "Peristeri", "Kallithea", "Glyfada", "Marousi"] },
      { id: "central-macedonia", name: "Central Macedonia", cities: ["Thessaloniki", "Katerini", "Serres", "Veria", "Giannitsa"] },
      { id: "crete", name: "Crete", cities: ["Heraklion", "Chania", "Rethymno", "Agios Nikolaos"] },
      { id: "western-greece", name: "Western Greece", cities: ["Patras", "Agrinio", "Aigio"] }
    ]
  }
];

// Normalize Polish diacritics and accents for robust search
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .trim();
}

/**
 * Searches across all countries, regions, and cities for instant autocompletion
 */
export function searchLocations(query: string, maxResults: number = 10): LocationMatch[] {
  const q = normalizeText(query);
  if (!q) return [];

  const results: LocationMatch[] = [];

  for (const country of COUNTRIES_DATA) {
    const cNorm = normalizeText(country.nativeName + " " + country.name);
    const countryMatches = cNorm.includes(q);

    for (const region of country.regions) {
      const rNorm = normalizeText(region.name);
      const regionMatches = rNorm.includes(q);

      // 1. Check Cities
      for (const city of region.cities) {
        const cityNorm = normalizeText(city);
        if (cityNorm.includes(q) || (regionMatches && q.length > 2)) {
          results.push({
            type: 'city',
            countryCode: country.code,
            countryName: country.nativeName,
            regionId: region.id,
            regionName: region.name,
            cityName: city,
            displayName: `${city}, ${region.name}`,
            formattedValue: `${city}, ${region.name}`
          });
          if (results.length >= maxResults) return results;
        }
      }

      // 2. Check Region Match
      if (regionMatches) {
        results.push({
          type: 'region',
          countryCode: country.code,
          countryName: country.nativeName,
          regionId: region.id,
          regionName: region.name,
          displayName: `${region.name} (${country.nativeName})`,
          formattedValue: `${region.name}, ${country.nativeName}`
        });
        if (results.length >= maxResults) return results;
      }
    }

    // 3. Check Country Match
    if (countryMatches) {
      results.push({
        type: 'country',
        countryCode: country.code,
        countryName: country.nativeName,
        displayName: `${country.flag} ${country.nativeName}`,
        formattedValue: country.nativeName
      });
      if (results.length >= maxResults) return results;
    }
  }

  return results;
}
