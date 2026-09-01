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

  // 3. FRANCJA (Wszystkie 13 regionów metropolitalnych)
  {
    code: "FR",
    name: "France",
    nativeName: "France",
    flag: "🇫🇷",
    regions: [
      { id: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Clermont-Ferrand", "Annecy", "Chambéry", "Valence"] },
      { id: "bourgogne-franche-comte", name: "Bourgogne-Franche-Comté", cities: ["Dijon", "Besançon", "Belfort", "Chalon-sur-Saône", "Nevers", "Auxerre"] },
      { id: "bretagne", name: "Bretagne", cities: ["Rennes", "Brest", "Quimper", "Lorient", "Vannes", "Saint-Malo"] },
      { id: "centre-val-de-loire", name: "Centre-Val de Loire", cities: ["Tours", "Orléans", "Bourges", "Blois", "Chartres", "Châteauroux"] },
      { id: "corse", name: "Corse", cities: ["Ajaccio", "Bastia", "Porto-Vecchio", "Corte"] },
      { id: "grand-est", name: "Grand Est", cities: ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy", "Colmar", "Troyes"] },
      { id: "hauts-de-france", name: "Hauts-de-France", cities: ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque", "Calais", "Beauvais"] },
      { id: "ile-de-france", name: "Île-de-France", cities: ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Versailles", "Nanterre", "Créteil"] },
      { id: "normandie", name: "Normandie", cities: ["Rouen", "Le Havre", "Caen", "Cherbourg-en-Cotentin", "Évreux"] },
      { id: "nouvelle-aquitaine", name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle", "Mérignac", "Bayonne"] },
      { id: "occitanie", name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers", "Montauban", "Narbonne"] },
      { id: "pays-de-la-loire", name: "Pays de la Loire", cities: ["Nantes", "Angers", "Le Mans", "Saint-Nazaire", "Cholet", "La Roche-sur-Yon"] },
      { id: "provence-alpes-cote-azur", name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes", "Avignon", "Antibes"] }
    ]
  },

  // 4. HISZPANIA (Wszystkie 17 wspólnot autonomicznych - Comunidades Autónomas)
  {
    code: "ES",
    name: "Spain",
    nativeName: "España",
    flag: "🇪🇸",
    regions: [
      { id: "andalucia", name: "Andalucía", cities: ["Sevilla", "Málaga", "Córdoba", "Granada", "Jerez de la Frontera", "Almería", "Cádiz", "Huelva", "Jaén", "Marbella"] },
      { id: "aragon", name: "Aragón", cities: ["Zaragoza", "Huesca", "Teruel"] },
      { id: "asturias", name: "Principado de Asturias", cities: ["Gijón", "Oviedo", "Avilés", "Siero"] },
      { id: "baleares", name: "Islas Baleares", cities: ["Palma de Mallorca", "Ibiza", "Manacor", "Ciutadella", "Mahón"] },
      { id: "canarias", name: "Canarias", cities: ["Las Palmas de Gran Canaria", "Santa Cruz de Tenerife", "San Cristóbal de La Laguna", "Telde", "Arona"] },
      { id: "cantabria", name: "Cantabria", cities: ["Santander", "Torrelavega", "Castro-Urdiales"] },
      { id: "castilla-la-mancha", name: "Castilla-La Mancha", cities: ["Albacete", "Toledo", "Talavera de la Reina", "Guadalajara", "Ciudad Real", "Cuenca"] },
      { id: "castilla-y-leon", name: "Castilla y León", cities: ["Valladolid", "Burgos", "Salamanca", "León", "Palencia", "Ponferrada", "Zamora", "Segovia", "Ávila", "Soria"] },
      { id: "cataluna", name: "Cataluña", cities: ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Tarragona", "Lleida", "Mataró", "Girona"] },
      { id: "comunidad-valenciana", name: "Comunidad Valenciana", cities: ["Valencia", "Alicante", "Elche", "Castellón de la Plana", "Torrevieja", "Orihuela", "Gandia", "Benidorm"] },
      { id: "extremadura", name: "Extremadura", cities: ["Badajoz", "Cáceres", "Mérida", "Plasencia"] },
      { id: "galicia", name: "Galicia", cities: ["Vigo", "A Coruña", "Ourense", "Lugo", "Santiago de Compostela", "Pontevedra", "Ferrol"] },
      { id: "la-rioja", name: "La Rioja", cities: ["Logroño", "Calahorra", "Arnedo"] },
      { id: "madrid", name: "Comunidad de Madrid", cities: ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón", "Torrejón de Ardoz", "Parla"] },
      { id: "murcia", name: "Región de Murcia", cities: ["Murcia", "Cartagena", "Lorca", "Molina de Segura"] },
      { id: "navarra", name: "Comunidad Foral de Navarra", cities: ["Pamplona", "Tudela", "Barañáin", "Valle de Egüés"] },
      { id: "pais-vasco", name: "País Vasco", cities: ["Bilbao", "Vitoria-Gasteiz", "San Sebastián", "Barakaldo", "Getxo", "Irun"] }
    ]
  },

  // 5. WŁOCHY (Wszystkie 20 regionów administracyjnych - Regioni d'Italia)
  {
    code: "IT",
    name: "Italy",
    nativeName: "Italia",
    flag: "🇮🇹",
    regions: [
      { id: "abruzzo", name: "Abruzzo", cities: ["Pescara", "L'Aquila", "Teramo", "Chieti", "Montesilvano"] },
      { id: "basilicata", name: "Basilicata", cities: ["Potenza", "Matera", "Policoro"] },
      { id: "calabria", name: "Calabria", cities: ["Reggio Calabria", "Catanzaro", "Cosenza", "Lamezia Terme", "Crotone"] },
      { id: "campania", name: "Campania", cities: ["Napoli", "Salerno", "Giugliano in Campania", "Torre del Greco", "Caserta", "Castellammare di Stabia", "Benevento"] },
      { id: "emilia-romagna", name: "Emilia-Romagna", cities: ["Bologna", "Parma", "Modena", "Reggio Emilia", "Ravenna", "Rimini", "Ferrara", "Forlì", "Piacenza", "Cesena"] },
      { id: "friuli-venezia-giulia", name: "Friuli-Venezia Giulia", cities: ["Trieste", "Udine", "Pordenone", "Gorizia"] },
      { id: "lazio", name: "Lazio", cities: ["Roma", "Latina", "Guidonia Montecelio", "Fiumicino", "Viterbo", "Pomezia", "Tivoli", "Anzio", "Velletri"] },
      { id: "liguria", name: "Liguria", cities: ["Genova", "La Spezia", "Savona", "Sanremo", "Imperia"] },
      { id: "lombardia", name: "Lombardia", cities: ["Milano", "Brescia", "Monza", "Bergamo", "Como", "Busto Arsizio", "Sesto San Giovanni", "Varese", "Pavia", "Cremona"] },
      { id: "marche", name: "Marche", cities: ["Ancona", "Pesaro", "Fano", "San Benedetto del Tronto", "Ascoli Piceno", "Macerata"] },
      { id: "molise", name: "Molise", cities: ["Campobasso", "Termoli", "Isernia"] },
      { id: "piemonte", name: "Piemonte", cities: ["Torino", "Novara", "Alessandria", "Asti", "Moncalieri", "Cuneo", "Vercelli", "Biella"] },
      { id: "puglia", name: "Puglia", cities: ["Bari", "Taranto", "Foggia", "Andria", "Lecce", "Barletta", "Brindisi", "Altamura", "Molfetta"] },
      { id: "sardegna", name: "Sardegna", cities: ["Cagliari", "Sassari", "Quartu Sant'Elena", "Olbia", "Alghero", "Nuoro"] },
      { id: "sicilia", name: "Sicilia", cities: ["Palermo", "Catania", "Messina", "Siracusa", "Marsala", "Gela", "Ragusa", "Trapani", "Agrigento"] },
      { id: "toscana", name: "Toscana", cities: ["Firenze", "Prato", "Livorno", "Arezzo", "Pistoia", "Pisa", "Lucca", "Grosseto", "Massa", "Siena"] },
      { id: "trentino-alto-adige", name: "Trentino-Alto Adige", cities: ["Trento", "Bolzano", "Rovereto", "Merano"] },
      { id: "umbria", name: "Umbria", cities: ["Perugia", "Terni", "Foligno", "Città di Castello", "Spoleto"] },
      { id: "valle-d-aosta", name: "Valle d'Aosta", cities: ["Aosta"] },
      { id: "veneto", name: "Veneto", cities: ["Venezia", "Verona", "Padova", "Vicenza", "Treviso", "Chioggia", "Rovigo", "Bassano del Grappa"] }
    ]
  },

  // 6. WIELKA BRYTANIA (Wszystkie kraje składowe i główne regiony)
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
  },

  // 7. GRECJA (Wszystkie 13 regionów administracyjnych - Peripheries of Greece)
  {
    code: "GR",
    name: "Greece",
    nativeName: "Ελλάδα",
    flag: "🇬🇷",
    regions: [
      { id: "attica", name: "Attica", cities: ["Athens", "Piraeus", "Peristeri", "Kallithea", "Glyfada", "Marousi", "Nea Smyrni", "Chalandri"] },
      { id: "central-greece", name: "Central Greece", cities: ["Chalcis", "Lamia", "Livadeia", "Thebes", "Amfissa"] },
      { id: "central-macedonia", name: "Central Macedonia", cities: ["Thessaloniki", "Kalamaria", "Katerini", "Serres", "Veria", "Giannitsa", "Kilkis"] },
      { id: "crete", name: "Crete", cities: ["Heraklion", "Chania", "Rethymno", "Agios Nikolaos", "Ierapetra"] },
      { id: "eastern-macedonia-thrace", name: "Eastern Macedonia and Thrace", cities: ["Alexandroupoli", "Kavala", "Komotini", "Xanthi", "Drama", "Orestiada"] },
      { id: "epirus", name: "Epirus", cities: ["Ioannina", "Arta", "Preveza", "Igoumenitsa"] },
      { id: "ionian-islands", name: "Ionian Islands", cities: ["Corfu", "Zakynthos", "Argostoli", "Lefkada"] },
      { id: "north-aegean", name: "North Aegean", cities: ["Mytilene", "Chios", "Samos", "Myrina"] },
      { id: "peloponnese", name: "Peloponnese", cities: ["Kalamata", "Corinth", "Tripoli", "Argos", "Sparta", "Nafplio"] },
      { id: "south-aegean", name: "South Aegean", cities: ["Rhodes", "Kos", "Ermoupoli", "Mykonos", "Naxos", "Santorini"] },
      { id: "thessaly", name: "Thessaly", cities: ["Larissa", "Volos", "Trikala", "Karditsa"] },
      { id: "western-greece", name: "Western Greece", cities: ["Patras", "Agrinio", "Aigio", "Pyrgos", "Mesolongi"] },
      { id: "western-macedonia", name: "Western Macedonia", cities: ["Kozani", "Ptolemaida", "Kastoria", "Florina", "Grevena"] }
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
