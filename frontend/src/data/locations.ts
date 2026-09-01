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
  // 1. POLSKA (Wszystkie 16 województw)
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

  // 2. NIEMCY (Wszystkie 16 krajów związkowych - Bundesländer)
  {
    code: "DE",
    name: "Germany",
    nativeName: "Deutschland",
    flag: "🇩🇪",
    regions: [
      { id: "baden-wuerttemberg", name: "Baden-Württemberg", cities: ["Stuttgart", "Karlsruhe", "Mannheim", "Freiburg", "Heidelberg", "Ulm", "Heilbronn", "Pforzheim"] },
      { id: "bayern", name: "Bayern", cities: ["München", "Nürnberg", "Augsburg", "Regensburg", "Ingolstadt", "Würzburg", "Fürth", "Erlangen", "Bamberg"] },
      { id: "berlin", name: "Berlin", cities: ["Berlin"] },
      { id: "brandenburg", name: "Brandenburg", cities: ["Potsdam", "Cottbus", "Brandenburg an der Havel", "Frankfurt (Oder)", "Oranienburg"] },
      { id: "bremen", name: "Bremen", cities: ["Bremen", "Bremerhaven"] },
      { id: "hamburg", name: "Hamburg", cities: ["Hamburg"] },
      { id: "hessen", name: "Hessen", cities: ["Frankfurt am Main", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach am Main", "Hanau", "Gießen"] },
      { id: "mecklenburg-vorpommern", name: "Mecklenburg-Vorpommern", cities: ["Rostock", "Schwerin", "Neubrandenburg", "Stralsund", "Greifswald"] },
      { id: "niedersachsen", name: "Niedersachsen", cities: ["Hannover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen", "Salzgitter", "Hildesheim"] },
      { id: "nordrhein-westfalen", name: "Nordrhein-Westfalen", cities: ["Köln", "Düsseldorf", "Dortmund", "Essen", "Bonn", "Münster", "Aachen", "Bielefeld", "Duisburg", "Bochum", "Wuppertal"] },
      { id: "rheinland-pfalz", name: "Rheinland-Pfalz", cities: ["Mainz", "Ludwigshafen", "Koblenz", "Trier", "Kaiserslautern", "Worms"] },
      { id: "saarland", name: "Saarland", cities: ["Saarbrücken", "Neunkirchen", "Homburg", "Völklingen"] },
      { id: "sachsen", name: "Sachsen", cities: ["Leipzig", "Dresden", "Chemnitz", "Zwickau", "Plauen", "Görlitz"] },
      { id: "sachsen-anhalt", name: "Sachsen-Anhalt", cities: ["Magdeburg", "Halle (Saale)", "Dessau-Roßlau", "Lutherstadt Wittenberg"] },
      { id: "schleswig-holstein", name: "Schleswig-Holstein", cities: ["Kiel", "Lübeck", "Flensburg", "Neumünster", "Norderstedt"] },
      { id: "thueringen", name: "Thüringen", cities: ["Erfurt", "Jena", "Gera", "Weimar", "Gotha", "Eisenach"] }
    ]
  },

  // 3. WIELKA BRYTANIA (Wszystkie kraje składowe i główne regiony)
  {
    code: "GB",
    name: "United Kingdom",
    nativeName: "United Kingdom",
    flag: "🇬🇧",
    regions: [
      { id: "greater-london", name: "Greater London", cities: ["London", "Croydon", "Barnet", "Ealing", "Bromley", "Enfield", "Brent"] },
      { id: "south-east", name: "South East (England)", cities: ["Brighton", "Southampton", "Portsmouth", "Oxford", "Reading", "Milton Keynes", "Slough"] },
      { id: "north-west", name: "North West (England)", cities: ["Manchester", "Liverpool", "Salford", "Bolton", "Stockport", "Oldham", "Blackpool", "Preston"] },
      { id: "west-midlands", name: "West Midlands", cities: ["Birmingham", "Coventry", "Wolverhampton", "Solihull", "Walsall", "Dudley", "Stoke-on-Trent"] },
      { id: "yorkshire-and-the-humber", name: "Yorkshire and the Humber", cities: ["Leeds", "Sheffield", "Bradford", "Kingston upon Hull", "York", "Wakefield", "Huddersfield"] },
      { id: "east-of-england", name: "East of England", cities: ["Cambridge", "Norwich", "Ipswich", "Luton", "Peterborough", "Southend-on-Sea", "Colchester"] },
      { id: "south-west", name: "South West (England)", cities: ["Bristol", "Plymouth", "Bournemouth", "Swindon", "Poole", "Exeter", "Gloucester", "Bath"] },
      { id: "east-midlands", name: "East Midlands", cities: ["Leicester", "Nottingham", "Derby", "Northampton", "Lincoln", "Mansfield"] },
      { id: "north-east", name: "North East (England)", cities: ["Newcastle upon Tyne", "Sunderland", "Middlesbrough", "Gateshead", "Darlington", "Hartlepool"] },
      { id: "scotland", name: "Scotland", cities: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Paisley", "East Kilbride", "Inverness", "Stirling"] },
      { id: "wales", name: "Wales", cities: ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Bridgend"] },
      { id: "northern-ireland", name: "Northern Ireland", cities: ["Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Bangor"] }
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
