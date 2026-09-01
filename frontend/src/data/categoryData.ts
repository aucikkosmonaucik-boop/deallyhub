export interface SubcategoryGroup {
  title: Record<string, string>;
  items: Array<{
    name: Record<string, string>;
    query?: string;
  }>;
}

export interface CategoryDetails {
  slug: string;
  groups: SubcategoryGroup[];
  popularTags: Record<string, string[]>;
}

export const CATEGORY_DETAILS: Record<string, CategoryDetails> = {
  "electronics": {
    slug: "electronics",
    groups: [
      {
        title: { pl: "Telefony i akcesoria", en: "Phones & Accessories", de: "Handys & Zubehör" },
        items: [
          { name: { pl: "Smartfony", en: "Smartphones" }, query: "smartfon" },
          { name: { pl: "Smartwatche i opaski", en: "Smartwatches" }, query: "smartwatch" },
          { name: { pl: "Tablety", en: "Tablets" }, query: "tablet" },
          { name: { pl: "Akcesoria GSM i ładowarki", en: "GSM Accessories & Chargers" }, query: "ładowarka" },
          { name: { pl: "Etui, pokrowce i szkła", en: "Cases & Screen Protectors" }, query: "etui" },
          { name: { pl: "Powerbanki", en: "Powerbanks" }, query: "powerbank" }
        ]
      },
      {
        title: { pl: "Komputery i laptopy", en: "Computers & Laptops", de: "Computer & Laptops" },
        items: [
          { name: { pl: "Laptopy", en: "Laptops" }, query: "laptop" },
          { name: { pl: "Komputery stacjonarne", en: "Desktop PCs" }, query: "komputer" },
          { name: { pl: "Podzespoły komputerowe", en: "PC Components" }, query: "karta graficzna" },
          { name: { pl: "Monitory", en: "Monitors" }, query: "monitor" },
          { name: { pl: "Drukarki i skanery", en: "Printers & Scanners" }, query: "drukarka" },
          { name: { pl: "Dyski i pamięci", en: "Storage & Drives" }, query: "dysk" }
        ]
      },
      {
        title: { pl: "Telewizory i audio", en: "TV & Audio", de: "Fernseher & Audio" },
        items: [
          { name: { pl: "Telewizory Smart TV", en: "Smart TVs" }, query: "telewizor" },
          { name: { pl: "Słuchawki bezprzewodowe", en: "Headphones" }, query: "słuchawki" },
          { name: { pl: "Głośniki i Soundbary", en: "Speakers & Soundbars" }, query: "głośnik" },
          { name: { pl: "Projektory i rzutniki", en: "Projectors" }, query: "projektor" },
          { name: { pl: "Kino domowe i amplitunery", en: "Home Theater" }, query: "kino domowe" }
        ]
      },
      {
        title: { pl: "Konsole i gaming", en: "Gaming & Consoles", de: "Konsolen & Gaming" },
        items: [
          { name: { pl: "PlayStation 5 / PS4", en: "PlayStation 5 / PS4" }, query: "PlayStation" },
          { name: { pl: "Xbox Series X/S / One", en: "Xbox Series X/S" }, query: "Xbox" },
          { name: { pl: "Nintendo Switch", en: "Nintendo Switch" }, query: "Nintendo" },
          { name: { pl: "Gry na konsole i PC", en: "Video Games" }, query: "gry" },
          { name: { pl: "Fotele i biurka gamingowe", en: "Gaming Chairs & Desks" }, query: "gaming" }
        ]
      }
    ],
    popularTags: {
      pl: ["iPhone", "Samsung Galaxy", "MacBook", "PlayStation 5", "RTX 4070", "iPad", "JBL", "Xiaomi"],
      en: ["iPhone", "Samsung Galaxy", "MacBook", "PS5", "RTX 4080", "iPad Pro", "Sony", "Dell"]
    }
  },

  "automotive-vehicles": {
    slug: "automotive-vehicles",
    groups: [
      {
        title: { pl: "Samochody osobowe", en: "Passenger Cars", de: "Personenkraftwagen" },
        items: [
          { name: { pl: "Samochody używane", en: "Used Cars" }, query: "samochód" },
          { name: { pl: "Samochody nowe", en: "New Cars" }, query: "salon" },
          { name: { pl: "Auta hybrydowe i elektryczne", en: "Electric & Hybrid" }, query: "hybryda" },
          { name: { pl: "Kombi i SUV", en: "SUV & Estate" }, query: "SUV" },
          { name: { pl: "Hatchback i Sedan", en: "Sedan & Hatchback" }, query: "sedan" }
        ]
      },
      {
        title: { pl: "Dostawcze i ciężarowe", en: "Commercial & Trucks", de: "Nutzfahrzeuge & LKW" },
        items: [
          { name: { pl: "Samochody dostawcze do 3.5t", en: "Vans up to 3.5t" }, query: "dostawczy" },
          { name: { pl: "Ciągniki siodłowe", en: "Semi-Trucks" }, query: "ciągnik" },
          { name: { pl: "Naczepy i przyczepy", en: "Trailers" }, query: "przyczepa" },
          { name: { pl: "Autobusy i busy", en: "Buses & Minibuses" }, query: "bus" }
        ]
      },
      {
        title: { pl: "Jednoślady i rekreacja", en: "Motorcycles & Quads", de: "Motorräder & Quads" },
        items: [
          { name: { pl: "Motocykle szosowe i turystyczne", en: "Motorcycles" }, query: "motocykl" },
          { name: { pl: "Skutery i motorowery", en: "Scooters" }, query: "skuter" },
          { name: { pl: "Quady i ATV", en: "Quads & ATVs" }, query: "quad" },
          { name: { pl: "Cross i Enduro", en: "Cross & Enduro" }, query: "cross" }
        ]
      },
      {
        title: { pl: "Części i wyposażenie", en: "Parts & Accessories", de: "Teile & Zubehör" },
        items: [
          { name: { pl: "Opony i felgi", en: "Tires & Rims" }, query: "opony" },
          { name: { pl: "Części karoserii", en: "Body Parts" }, query: "zderzak" },
          { name: { pl: "Silniki i osprzęt", en: "Engines & Parts" }, query: "silnik" },
          { name: { pl: "Oleje i chemia", en: "Oils & Car Care" }, query: "olej" }
        ]
      }
    ],
    popularTags: {
      pl: ["BMW", "Audi", "Volkswagen", "Mercedes-Benz", "Toyota", "Ford", "Skoda", "Volvo", "Honda"],
      en: ["BMW", "Audi", "Mercedes-Benz", "Toyota", "Ford", "Volkswagen", "Tesla", "Porsche"]
    }
  },

  "real-estate": {
    slug: "real-estate",
    groups: [
      {
        title: { pl: "Mieszkania", en: "Apartments & Flats", de: "Wohnungen" },
        items: [
          { name: { pl: "Mieszkania na sprzedaż", en: "Apartments for Sale" }, query: "mieszkanie sprzedaż" },
          { name: { pl: "Mieszkania na wynajem", en: "Apartments for Rent" }, query: "mieszkanie wynajem" },
          { name: { pl: "Kawalerki i 1-pokojowe", en: "Studio Apartments" }, query: "kawalerka" },
          { name: { pl: "Apartamenty i lofty", en: "Luxury Lofts" }, query: "apartament" }
        ]
      },
      {
        title: { pl: "Domy i wille", en: "Houses & Villas", de: "Häuser & Villen" },
        items: [
          { name: { pl: "Domy jednorodzinne", en: "Single-Family Houses" }, query: "dom" },
          { name: { pl: "Szeregowce i bliźniaki", en: "Townhouses & Semis" }, query: "bliźniak" },
          { name: { pl: "Domy letniskowe", en: "Holiday Homes" }, query: "letniskowy" },
          { name: { pl: "Domy na wynajem", en: "Houses for Rent" }, query: "dom wynajem" }
        ]
      },
      {
        title: { pl: "Działki i grunty", en: "Plots & Land", de: "Grundstücke" },
        items: [
          { name: { pl: "Działki budowlane", en: "Building Land" }, query: "działka budowlana" },
          { name: { pl: "Działki rekreacyjne / ROD", en: "Recreation Plots" }, query: "działka rekreacyjna" },
          { name: { pl: "Grunty rolne i leśne", en: "Agricultural Land" }, query: "rolna" },
          { name: { pl: "Działki inwestycyjne", en: "Commercial Plots" }, query: "inwestycyjna" }
        ]
      },
      {
        title: { pl: "Lokale i komercyjne", en: "Commercial Properties", de: "Gewerbeimmobilien" },
        items: [
          { name: { pl: "Lokale użytkowe i sklepy", en: "Retail & Shops" }, query: "lokal" },
          { name: { pl: "Biura i gabinety", en: "Offices" }, query: "biuro" },
          { name: { pl: "Magazyny i hale", en: "Warehouses" }, query: "magazyn" },
          { name: { pl: "Garaże i miejsca postojowe", en: "Garages & Parking" }, query: "garaż" }
        ]
      }
    ],
    popularTags: {
      pl: ["Warszawa", "Kraków", "Wrocław", "Gdańsk", "Poznań", "Kawalerka", "Działka budowlana", "Bez pośredników"],
      en: ["For Rent", "For Sale", "Studio Flat", "2-Bedroom", "City Center", "Plot", "Garage"]
    }
  },

  "home-garden": {
    slug: "home-garden",
    groups: [
      {
        title: { pl: "Meble i wyposażenie", en: "Furniture & Decor", de: "Möbel & Wohnen" },
        items: [
          { name: { pl: "Sofy, narożniki i kanapy", en: "Sofas & Couches" }, query: "sofa" },
          { name: { pl: "Stoły, krzesła i jadalnia", en: "Tables & Chairs" }, query: "stół" },
          { name: { pl: "Szafy, komody i regały", en: "Wardrobes & Chests" }, query: "szafa" },
          { name: { pl: "Łóżka i materace", en: "Beds & Mattresses" }, query: "łóżko" },
          { name: { pl: "Meble kuchenne", en: "Kitchen Furniture" }, query: "meble kuchenne" }
        ]
      },
      {
        title: { pl: "Ogród i rośliny", en: "Garden & Plants", de: "Garten & Pflanzen" },
        items: [
          { name: { pl: "Meble ogrodowe i grille", en: "Garden Furniture & BBQs" }, query: "meble ogrodowe" },
          { name: { pl: "Kosiarki i traktorki", en: "Lawn Mowers" }, query: "kosiarka" },
          { name: { pl: "Rośliny, krzewy i sadzonki", en: "Plants & Trees" }, query: "rośliny" },
          { name: { pl: "Baseny i trampoliny", en: "Pools & Trampolines" }, query: "basen" }
        ]
      },
      {
        title: { pl: "Narzędzia i majsterkowanie", en: "Tools & DIY", de: "Werkzeuge & Heimwerker" },
        items: [
          { name: { pl: "Elektronarzędzia (wkrętarki, wiertarki)", en: "Power Tools" }, query: "wkrętarka" },
          { name: { pl: "Narzędzia ręczne i zestawy", en: "Hand Tools" }, query: "narzędzia" },
          { name: { pl: "Spawarki i kompresory", en: "Welders & Compressors" }, query: "kompresor" },
          { name: { pl: "Oświetlenie i elektryka", en: "Lighting & Electrical" }, query: "oświetlenie" }
        ]
      },
      {
        title: { pl: "Dekoracje i tekstylia", en: "Home Accents & Textiles", de: "Deko & Textilien" },
        items: [
          { name: { pl: "Dywany i chodniki", en: "Rugs & Carpets" }, query: "dywan" },
          { name: { pl: "Zasłony, firany i pościele", en: "Curtains & Bedding" }, query: "zasłony" },
          { name: { pl: "Obrazy, plakaty i lustra", en: "Wall Art & Mirrors" }, query: "lustro" },
          { name: { pl: "Zastawa i akcesoria kuchenne", en: "Cookware & Dining" }, query: "zastawa" }
        ]
      }
    ],
    popularTags: {
      pl: ["IKEA", "Kosiarka", "Makita", "Bosch", "Narożnik", "Stół dębowy", "Meble tarasowe", "Grill"],
      en: ["IKEA", "Sofa", "Makita", "Lawnmower", "Dining Table", "Garden Set", "Drill"]
    }
  },

  "fashion-apparel": {
    slug: "fashion-apparel",
    groups: [
      {
        title: { pl: "Odzież damska", en: "Women's Clothing", de: "Damenmode" },
        items: [
          { name: { pl: "Sukienki i spódnice", en: "Dresses & Skirts" }, query: "sukienka" },
          { name: { pl: "Kurtki, płaszcze i trencze", en: "Jackets & Coats" }, query: "kurtka" },
          { name: { pl: "Swetry, bluzy i kardigany", en: "Sweaters & Hoodies" }, query: "sweter" },
          { name: { pl: "Spodnie, jeansy i legginsy", en: "Jeans & Trousers" }, query: "jeansy" }
        ]
      },
      {
        title: { pl: "Odzież męska", en: "Men's Clothing", de: "Herrenmode" },
        items: [
          { name: { pl: "Kurtki i płaszcze męskie", en: "Men's Jackets" }, query: "kurtka męska" },
          { name: { pl: "Garnitury i marynarki", en: "Suits & Blazers" }, query: "garnitur" },
          { name: { pl: "Koszule i polo", en: "Shirts & Polos" }, query: "koszula" },
          { name: { pl: "Bluzy i dresy", en: "Hoodies & Tracksuits" }, query: "bluza" }
        ]
      },
      {
        title: { pl: "Obuwie", en: "Shoes & Footwear", de: "Schuhe" },
        items: [
          { name: { pl: "Sneakersy i buty sportowe", en: "Sneakers & Trainers" }, query: "sneakers" },
          { name: { pl: "Buty eleganckie i szpilki", en: "Dress Shoes & Heels" }, query: "szpilki" },
          { name: { pl: "Kozaki, botki i trapery", en: "Boots" }, query: "botki" },
          { name: { pl: "Sandały i klapki", en: "Sandals & Slippers" }, query: "sandały" }
        ]
      },
      {
        title: { pl: "Dodatki i akcesoria", en: "Accessories & Bags", de: "Accessoires & Taschen" },
        items: [
          { name: { pl: "Torebki i plecaki", en: "Handbags & Backpacks" }, query: "torebka" },
          { name: { pl: "Zegarki i smartbandy", en: "Watches" }, query: "zegarek" },
          { name: { pl: "Biżuteria (złoto, srebro)", en: "Jewelry" }, query: "biżuteria" },
          { name: { pl: "Okulary przeciwsłoneczne", en: "Sunglasses" }, query: "okulary" }
        ]
      }
    ],
    popularTags: {
      pl: ["Zara", "Nike", "Adidas", "Tommy Hilfiger", "Calvin Klein", "Jordan", "Gucci", "Złoto 585"],
      en: ["Nike", "Adidas", "Zara", "Gucci", "Sneakers", "Leather Jacket", "Watch", "Handbag"]
    }
  },

  "jobs-careers": {
    slug: "jobs-careers",
    groups: [
      {
        title: { pl: "Branże techniczne i IT", en: "Tech & Engineering", de: "IT & Technik" },
        items: [
          { name: { pl: "Programowanie i IT", en: "Software & IT" }, query: "programista" },
          { name: { pl: "Budownictwo i instalacje", en: "Construction" }, query: "budownictwo" },
          { name: { pl: "Inżynieria i produkcja", en: "Engineering & Production" }, query: "inżynier" },
          { name: { pl: "Mechanika i elektromechanika", en: "Mechanics" }, query: "mechanik" }
        ]
      },
      {
        title: { pl: "Handel, logistyka i usługi", en: "Logistics & Services", de: "Handel & Logistik" },
        items: [
          { name: { pl: "Kierowcy i kurierzy (kat. B, C, C+E)", en: "Drivers & Couriers" }, query: "kierowca" },
          { name: { pl: "Magazynierzy i operatorzy wózków", en: "Warehouse Workers" }, query: "magazynier" },
          { name: { pl: "Sprzedaż, kasjer i obsługa klienta", en: "Sales & Retail" }, query: "sprzedawca" },
          { name: { pl: "Gastronomia, kucharz i kelner", en: "Hospitality & Chefs" }, query: "kucharz" }
        ]
      },
      {
        title: { pl: "Praca biurowa i specjaliści", en: "Office & Healthcare", de: "Büro & Gesundheit" },
        items: [
          { name: { pl: "Księgowość, finanse i HR", en: "Accounting & HR" }, query: "księgowa" },
          { name: { pl: "Marketing, social media i reklama", en: "Marketing & Ads" }, query: "marketing" },
          { name: { pl: "Medycyna, opieka i farmacja", en: "Healthcare & Nursing" }, query: "pielęgniarka" },
          { name: { pl: "Edukacja, korepetycje i nauka", en: "Teaching & Tutoring" }, query: "korepetycje" }
        ]
      },
      {
        title: { pl: "Tryb pracy i za granicą", en: "Work Mode & Abroad", de: "Ausland & Remote" },
        items: [
          { name: { pl: "Praca zdalna / Home office", en: "Remote Work" }, query: "praca zdalna" },
          { name: { pl: "Praca za granicą (Niemcy, Holandia)", en: "Jobs Abroad" }, query: "za granicą" },
          { name: { pl: "Praca dodatkowa i dla studentów", en: "Part-Time & Student" }, query: "dodatkowa" },
          { name: { pl: "Praca tymczasowa i sezonowa", en: "Seasonal Jobs" }, query: "sezonowa" }
        ]
      }
    ],
    popularTags: {
      pl: ["Kierowca C+E", "Praca zdalna", "Magazynier", "Spawacz", "Operator CNC", "Księgowa", "Praca od zaraz", "Niemcy"],
      en: ["Driver", "Remote", "Software Developer", "Warehouse", "Part-Time", "Urgent Hire"]
    }
  },

  "construction-renovation": {
    slug: "construction-renovation",
    groups: [
      {
        title: { pl: "Materiały budowlane", en: "Building Materials", de: "Baumaterialien" },
        items: [
          { name: { pl: "Stal, pustaki i cegły", en: "Bricks, Blocks & Steel" }, query: "pustak" },
          { name: { pl: "Ocieplenie, styropian i wełna", en: "Insulation & Foam" }, query: "styropian" },
          { name: { pl: "Dachówki i pokrycia dachowe", en: "Roofing Materials" }, query: "blachodachówka" },
          { name: { pl: "Drewno budowlane i kantówki", en: "Lumber & Timber" }, query: "drewno" }
        ]
      },
      {
        title: { pl: "Wykończenie wnętrz", en: "Interior Finishing", de: "Innenausbau" },
        items: [
          { name: { pl: "Płytki, gres i kafelki", en: "Tiles & Ceramics" }, query: "płytki" },
          { name: { pl: "Panele podłogowe i deski", en: "Flooring & Parquet" }, query: "panele" },
          { name: { pl: "Farby, tynki i gładzie", en: "Paints & Plaster" }, query: "farba" },
          { name: { pl: "Drzwi wewnętrzne i zewnętrzne", en: "Doors & Frames" }, query: "drzwi" }
        ]
      },
      {
        title: { pl: "Instalacje i hydraulika", en: "Plumbing & Heating", de: "Heizung & Sanitär" },
        items: [
          { name: { pl: "Pompy ciepła i klimatyzacja", en: "Heat Pumps & AC" }, query: "pompa ciepła" },
          { name: { pl: "Kotły, piece i grzejniki", en: "Boilers & Radiators" }, query: "piec" },
          { name: { pl: "Fotowoltaika i inwertery", en: "Solar & Inverters" }, query: "fotowoltaika" },
          { name: { pl: "Rury, zawory i armatura", en: "Pipes & Fittings" }, query: "armatura" }
        ]
      },
      {
        title: { pl: "Maszyny i rusztowania", en: "Machinery & Scaffolding", de: "Baumaschinen & Gerüste" },
        items: [
          { name: { pl: "Rusztowania i drabiny", en: "Scaffolding & Ladders" }, query: "rusztowanie" },
          { name: { pl: "Betoniarki i zacieraczki", en: "Cement Mixers" }, query: "betoniarka" },
          { name: { pl: "Agregaty tynkarskie i malarskie", en: "Sprayers & Generators" }, query: "agregat" },
          { name: { pl: "Zagęszczarki do gruntu", en: "Plate Compactors" }, query: "zagęszczarka" }
        ]
      }
    ],
    popularTags: {
      pl: ["Styropian", "Pompa ciepła", "Kostka brukowa", "Gres", "Rusztowanie elewacyjne", "Fotowoltaika", "Wełna mineralna"],
      en: ["Heat Pump", "Scaffolding", "Tiles", "Timber", "Insulation", "Cement Mixer"]
    }
  },

  "business-industry": {
    slug: "business-industry",
    groups: [
      {
        title: { pl: "Maszyny przemysłowe", en: "Industrial Machinery", de: "Industriemaschinen" },
        items: [
          { name: { pl: "Tokarki, frezarki i CNC", en: "Lathes, Mills & CNC" }, query: "tokarka" },
          { name: { pl: "Wtryskarki i prasy hydrauliczne", en: "Injection & Presses" }, query: "prasa" },
          { name: { pl: "Kompresory przemysłowe", en: "Industrial Compressors" }, query: "kompresor śrubowy" },
          { name: { pl: "Maszyny do obróbki drewna i metalu", en: "Wood & Metal Tools" }, query: "obróbka" }
        ]
      },
      {
        title: { pl: "Wyposażenie firm i sklepów", en: "Store & Office Equipment", de: "Laden- & Geschäftsausstattung" },
        items: [
          { name: { pl: "Regały magazynowe wysokiego składowania", en: "Storage Racks" }, query: "regały magazynowe" },
          { name: { pl: "Lady chłodnicze i lodówki sklepowe", en: "Refrigerated Counters" }, query: "lada chłodnicza" },
          { name: { pl: "Wyposażenie gastronomii i pizzerii", en: "Restaurant Equipment" }, query: "gastronomia" },
          { name: { pl: "Wózki widłowe i paletowe", en: "Forklifts & Pallet Jacks" }, query: "wózek widłowy" }
        ]
      },
      {
        title: { pl: "Surowce i półprodukty", en: "Raw Materials", de: "Rohstoffe" },
        items: [
          { name: { pl: "Metale kolorowe i stal", en: "Steel & Metals" }, query: "stal" },
          { name: { pl: "Tworzywa sztuczne i granulaty", en: "Plastics & Resins" }, query: "granulat" },
          { name: { pl: "Opakowania, kartony i palety", en: "Packaging & Pallets" }, query: "palety" }
        ]
      },
      {
        title: { pl: "Sprzedaż przedsiębiorstw", en: "Businesses for Sale", de: "Firmenverkauf" },
        items: [
          { name: { pl: "Gotowe spółki i firmy", en: "Companies for Sale" }, query: "spółka" },
          { name: { pl: "Udziały i inwestorzy", en: "Shares & Investors" }, query: "udziały" },
          { name: { pl: "Franczyza i koncepty", en: "Franchise" }, query: "franczyza" }
        ]
      }
    ],
    popularTags: {
      pl: ["Wózek widłowy", "Regały magazynowe", "CNC", "Lada chłodnicza", "Palety EPAL", "Piec do pizzy", "Tokarka"],
      en: ["Forklift", "CNC Machine", "Storage Racking", "Commercial Kitchen", "Pallets"]
    }
  },

  "agriculture-farming": {
    slug: "agriculture-farming",
    groups: [
      {
        title: { pl: "Ciągniki i traktory", en: "Tractors & Harvesters", de: "Traktoren & Erntemaschinen" },
        items: [
          { name: { pl: "Ciągniki rolnicze (Ursus, Zetor, John Deere)", en: "Tractors" }, query: "ciągnik rolniczy" },
          { name: { pl: "Kombajny zbożowe i sieczkarnie", en: "Combine Harvesters" }, query: "kombajn" },
          { name: { pl: "Mini traktorki i kosiarki sadownicze", en: "Compact Tractors" }, query: "traktorek" }
        ]
      },
      {
        title: { pl: "Maszyny rolnicze i osprzęt", en: "Agricultural Implements", de: "Landmaschinen" },
        items: [
          { name: { pl: "Pługi, brony i agregaty", en: "Ploughs & Harrows" }, query: "pług" },
          { name: { pl: "Siewniki i opryskiwacze", en: "Seeders & Sprayers" }, query: "opryskiwacz" },
          { name: { pl: "Prasy zwijające i kostkujące", en: "Balers" }, query: "prasa zwijająca" },
          { name: { pl: "Przyczepy rolnicze i wywrotki", en: "Farm Trailers" }, query: "przyczepa rolnicza" }
        ]
      },
      {
        title: { pl: "Płody rolne i pasze", en: "Crops, Hay & Feed", de: "Futtermittel & Ernte" },
        items: [
          { name: { pl: "Zboża, kukurydza i rzepak", en: "Grain & Corn" }, query: "zboże" },
          { name: { pl: "Siano, słoma i sianokiszonka", en: "Hay & Straw" }, query: "siano" },
          { name: { pl: "Pasze, koncentraty i nawozy", en: "Feed & Fertilizers" }, query: "nawóz" }
        ]
      },
      {
        title: { pl: "Zwierzęta hodowlane", en: "Livestock & Farm Animals", de: "Nutztiere" },
        items: [
          { name: { pl: "Bydło, krowy i cielęta", en: "Cattle & Calves" }, query: "bydło" },
          { name: { pl: "Trzoda chlewna i prosięta", en: "Pigs" }, query: "prosięta" },
          { name: { pl: "Drób, kury i kaczki", en: "Poultry & Chickens" }, query: "kury" },
          { name: { pl: "Konie i kuce", en: "Horses & Ponies" }, query: "koń" }
        ]
      }
    ],
    popularTags: {
      pl: ["Ursus C-360", "Zetor", "John Deere", "Prasa zwijająca", "Siano w balotach", "Pług obrotowy", "Przyczepa rolnicza"],
      en: ["John Deere", "Tractor", "Harvester", "Hay Bales", "Farm Trailer", "Livestock"]
    }
  },

  "pets-animals": {
    slug: "pets-animals",
    groups: [
      {
        title: { pl: "Psy i szczenięta", en: "Dogs & Puppies", de: "Hunde & Welpen" },
        items: [
          { name: { pl: "Psy rasowe z rodowodem (FCI/ZKwP)", en: "Pedigree Dogs" }, query: "pies" },
          { name: { pl: "Szczeniaki do adopcji", en: "Puppies for Adoption" }, query: "szczeniak" },
          { name: { pl: "Legowiska, budy i klatki", en: "Beds & Crates" }, query: "legowisko" }
        ]
      },
      {
        title: { pl: "Koty i kocięta", en: "Cats & Kittens", de: "Katzen & Kätzchen" },
        items: [
          { name: { pl: "Koty rasowe (brytyjskie, ragdoll, maine coon)", en: "Pedigree Cats" }, query: "kot" },
          { name: { pl: "Drapaki, kuwety i transportery", en: "Scratching Posts & Litter" }, query: "drapak" },
          { name: { pl: "Karmy i przysmaki", en: "Cat Food" }, query: "karma dla kota" }
        ]
      },
      {
        title: { pl: "Akwarystyka i terrarystyka", en: "Aquarium & Terrarium", de: "Aquaristik & Terraristik" },
        items: [
          { name: { pl: "Akwaria, filtry i oświetlenie", en: "Aquariums & Filters" }, query: "akwarium" },
          { name: { pl: "Ryby akwariowe i krewetki", en: "Fish & Shrimp" }, query: "rybki" },
          { name: { pl: "Terraria, gady i pająki", en: "Terrariums & Reptiles" }, query: "terrarium" }
        ]
      },
      {
        title: { pl: "Ptaki i gryzonie", en: "Birds & Small Pets", de: "Vögel & Kleintiere" },
        items: [
          { name: { pl: "Papugi, kanarki i klatki", en: "Parrots & Cages" }, query: "papuga" },
          { name: { pl: "Króliki miniaturowe, chomiki, świnki", en: "Rabbits & Guinea Pigs" }, query: "królik" },
          { name: { pl: "Klatki, poidełka i sianko", en: "Cages & Accessories" }, query: "klatka" }
        ]
      }
    ],
    popularTags: {
      pl: ["Owczarek niemiecki", "Maltańczyk", "Kot brytyjski", "Ragdoll", "Akwarium", "Drapak", "Królik miniaturka"],
      en: ["Puppy", "French Bulldog", "British Shorthair", "Aquarium", "Dog Bed", "Parrot"]
    }
  },

  "baby-kids": {
    slug: "baby-kids",
    groups: [
      {
        title: { pl: "Wózki i foteliki", en: "Strollers & Car Seats", de: "Kinderwagen & Kindersitze" },
        items: [
          { name: { pl: "Wózki 2w1 i 3w1", en: "2in1 / 3in1 Strollers" }, query: "wózek" },
          { name: { pl: "Wózki spacerowe / spacerówki", en: "Pushchairs" }, query: "spacerówka" },
          { name: { pl: "Foteliki samochodowe (Isofix)", en: "Car Seats" }, query: "fotelik" }
        ]
      },
      {
        title: { pl: "Pokój dziecięcy", en: "Nursery & Kids Room", de: "Kinderzimmer" },
        items: [
          { name: { pl: "Łóżeczka dziecięce i kołyski", en: "Cribs & Cots" }, query: "łóżeczko" },
          { name: { pl: "Krzesełka do karmienia", en: "High Chairs" }, query: "krzesełko" },
          { name: { pl: "Przewijaki i wanienki", en: "Changing Tables & Baths" }, query: "przewijak" }
        ]
      },
      {
        title: { pl: "Zabawki i gry", en: "Toys & Games", de: "Spielzeug & Spiele" },
        items: [
          { name: { pl: "Klocki LEGO i konstrukcyjne", en: "LEGO Sets" }, query: "LEGO" },
          { name: { pl: "Lalki, domki i maskotki", en: "Dolls & Plush Toys" }, query: "lalka" },
          { name: { pl: "Samochody i pojazdy na akumulator", en: "Ride-on Cars" }, query: "na akumulator" },
          { name: { pl: "Gry planszowe i edukacyjne", en: "Board Games" }, query: "planszówka" }
        ]
      },
      {
        title: { pl: "Ubranka i buciki", en: "Baby Clothes & Shoes", de: "Babybekleidung & Schuhe" },
        items: [
          { name: { pl: "Pakiety ubranek dla niemowląt", en: "Baby Bundles" }, query: "ubranka" },
          { name: { pl: "Kombinezony i kurtki dziecięce", en: "Kids Winter Suits" }, query: "kombinezon" },
          { name: { pl: "Buciki i kapcie", en: "Kids Shoes" }, query: "buty dziecięce" }
        ]
      }
    ],
    popularTags: {
      pl: ["LEGO", "Wózek 3w1", "Cybex", "Fotelik Isofix", "Łóżeczko", "Auto na akumulator", "Rowerek biegowy"],
      en: ["LEGO", "Stroller", "Cybex", "Car Seat", "Crib", "Kids Bike", "Toys"]
    }
  },

  "sports-hobbies": {
    slug: "sports-hobbies",
    groups: [
      {
        title: { pl: "Rowery i hulajnogi", en: "Bikes & Scooters", de: "Fahrräder & Roller" },
        items: [
          { name: { pl: "Rowery górskie (MTB)", en: "Mountain Bikes (MTB)" }, query: "rower MTB" },
          { name: { pl: "Rowery szosowe i gravel", en: "Road & Gravel Bikes" }, query: "gravel" },
          { name: { pl: "Rowery elektryczne (e-bike)", en: "Electric Bikes" }, query: "rower elektryczny" },
          { name: { pl: "Hulajnogi elektryczne i wyczynowe", en: "E-Scooters" }, query: "hulajnoga elektryczna" }
        ]
      },
      {
        title: { pl: "Siłownia i fitness", en: "Gym & Fitness", de: "Fitness & Kraftsport" },
        items: [
          { name: { pl: "Hantle, gryfy i obciążenia", en: "Dumbbells & Weights" }, query: "hantle" },
          { name: { pl: "Bieżnie i rowerki treningowe", en: "Treadmills & Bikes" }, query: "bieżnia" },
          { name: { pl: "Ławki i atlasy do ćwiczeń", en: "Benches & Multigyms" }, query: "ławka do ćwiczeń" }
        ]
      },
      {
        title: { pl: "Wędkarstwo i myślistwo", en: "Fishing & Hunting", de: "Angeln & Jagd" },
        items: [
          { name: { pl: "Wędki, kołowrotki i zestawy", en: "Fishing Rods & Reels" }, query: "wędka" },
          { name: { pl: "Łodzie i pontony wędkarskie", en: "Boats & Inflatables" }, query: "ponton" },
          { name: { pl: "Namioty i fotele wędkarskie", en: "Fishing Chairs & Tents" }, query: "fotel wędkarski" }
        ]
      },
      {
        title: { pl: "Turystyka i sporty wodne", en: "Outdoor & Water Sports", de: "Outdoor & Wassersport" },
        items: [
          { name: { pl: "Deski SUP, kajaki i żeglarstwo", en: "SUP Boards & Kayaks" }, query: "deska SUP" },
          { name: { pl: "Namioty, śpiwory i plecaki", en: "Tents & Sleeping Bags" }, query: "namiot" },
          { name: { pl: "Narty, snowboard i łyżwy", en: "Skis & Snowboards" }, query: "narty" }
        ]
      }
    ],
    popularTags: {
      pl: ["Rower elektryczny", "Gravel", "Hantle", "Deska SUP", "Bieżnia", "Wędka karpiowa", "KROSS", "Trek"],
      en: ["E-Bike", "Gravel Bike", "SUP Board", "Treadmill", "Dumbbells", "Fishing Rod", "Trek"]
    }
  },

  "services": {
    slug: "services",
    groups: [
      {
        title: { pl: "Remonty i budownictwo", en: "Renovation & Construction", de: "Renovierung & Bau" },
        items: [
          { name: { pl: "Wykończenia wnętrz i malowanie", en: "Painting & Plastering" }, query: "remont" },
          { name: { pl: "Układanie płytek i glazurnictwo", en: "Tiling & Floors" }, query: "glazurnik" },
          { name: { pl: "Instalacje elektryczne i hydraulika", en: "Electrician & Plumber" }, query: "elektryk" }
        ]
      },
      {
        title: { pl: "Transport i przeprowadzki", en: "Moving & Transport", de: "Umzüge & Transport" },
        items: [
          { name: { pl: "Przeprowadzki mieszkań i firm", en: "Home & Office Moving" }, query: "przeprowadzki" },
          { name: { pl: "Transport busem i bagażówka", en: "Van Transport" }, query: "transport busem" },
          { name: { pl: "Autolaweta i pomoc drogowa 24/7", en: "Towing Service 24/7" }, query: "laweta" }
        ]
      },
      {
        title: { pl: "Mechanika i naprawa", en: "Auto Repair & Mechanics", de: "Autoreparatur" },
        items: [
          { name: { pl: "Mechanika samochodowa i wulkanizacja", en: "Car Repair & Tires" }, query: "mechanik samochodowy" },
          { name: { pl: "Naprawa AGD i sprzętu RTV", en: "Appliance Repair" }, query: "naprawa AGD" },
          { name: { pl: "Serwis komputerów i telefonów", en: "Phone & PC Repair" }, query: "serwis telefonów" }
        ]
      },
      {
        title: { pl: "Uroda, sprzątanie i ogród", en: "Cleaning, Beauty & Garden", de: "Reinigung & Pflege" },
        items: [
          { name: { pl: "Sprzątanie domów i biur", en: "House & Office Cleaning" }, query: "sprzątanie" },
          { name: { pl: "Pielęgnacja ogrodów i wycinka drzew", en: "Gardening & Tree Cutting" }, query: "pielęgnacja ogrodu" },
          { name: { pl: "Fryzjer, kosmetyczka i masaż", en: "Beauty & Massage" }, query: "masaż" }
        ]
      }
    ],
    popularTags: {
      pl: ["Remonty mieszkań", "Przeprowadzki", "Laweta 24h", "Elektryk", "Hydraulik", "Sprzątanie", "Naprawa pralki"],
      en: ["Moving Service", "Plumber", "Electrician", "Car Towing", "Cleaning", "Painting"]
    }
  },

  "antiques-collectibles": {
    slug: "antiques-collectibles",
    groups: [
      {
        title: { pl: "Numizmatyka i banknoty", en: "Coins & Banknotes", de: "Münzen & Banknoten" },
        items: [
          { name: { pl: "Monety polskie i zagraniczne", en: "Coins" }, query: "monety" },
          { name: { pl: "Monety srebrne i złote", en: "Silver & Gold Coins" }, query: "srebrne monety" },
          { name: { pl: "Banknoty i walory kolekcjonerskie", en: "Banknotes" }, query: "banknoty" }
        ]
      },
      {
        title: { pl: "Militaria i odznaczenia", en: "Militaria & Medals", de: "Militaria & Orden" },
        items: [
          { name: { pl: "Bagnety, szable i biała broń", en: "Bayonets & Swords" }, query: "szabla" },
          { name: { pl: "Medale, ordery i odznaki", en: "Medals & Badges" }, query: "medale" },
          { name: { pl: "Mundury i hełmy", en: "Uniforms & Helmets" }, query: "hełm" }
        ]
      },
      {
        title: { pl: "Meble i zegary antyczne", en: "Antique Furniture & Clocks", de: "Antike Möbel & Uhren" },
        items: [
          { name: { pl: "Meble zabytkowe (secesja, biedermeier)", en: "Period Furniture" }, query: "meble antyczne" },
          { name: { pl: "Zegary stojące, ścienne i kominkowe", en: "Antique Clocks" }, query: "zegar ścienny" },
          { name: { pl: "Gramofony i patefony", en: "Gramophones" }, query: "gramofon" }
        ]
      },
      {
        title: { pl: "Sztuka i pamiątki PRL", en: "Art & Vintage Items", de: "Kunst & Vintage" },
        items: [
          { name: { pl: "Obrazy olejne i grafiki", en: "Oil Paintings" }, query: "obraz olejny" },
          { name: { pl: "Porcelana, szkło i kryształy", en: "Porcelain & Crystal" }, query: "porcelana" },
          { name: { pl: "Pamiątki z okresu PRL", en: "Vintage / Retro Collectibles" }, query: "PRL" }
        ]
      }
    ],
    popularTags: {
      pl: ["Monety srebrne", "PRL", "Zegar wiszący", "Porcelana Ćmielów", "Szabla", "Militaria", "Obraz olejny"],
      en: ["Silver Coins", "Vintage", "Antique Clock", "Porcelain", "Oil Painting", "Medals"]
    }
  },

  "health-beauty": {
    slug: "health-beauty",
    groups: [
      {
        title: { pl: "Perfumy i zapachy", en: "Perfumes & Fragrances", de: "Parfums & Düfte" },
        items: [
          { name: { pl: "Perfumy damskie", en: "Women's Perfumes" }, query: "perfumy damskie" },
          { name: { pl: "Perfumy męskie", en: "Men's Perfumes" }, query: "perfumy męskie" },
          { name: { pl: "Perfumy niszowe i próbki", en: "Niche Fragrances" }, query: "perfumy niszowe" }
        ]
      },
      {
        title: { pl: "Pielęgnacja i makijaż", en: "Skincare & Makeup", de: "Hautpflege & Make-up" },
        items: [
          { name: { pl: "Kremy, sera i maseczki", en: "Creams & Serums" }, query: "krem do twarzy" },
          { name: { pl: "Kosmetyki do makijażu", en: "Makeup & Palettes" }, query: "makijaż" },
          { name: { pl: "Pielęgnacja włosów i szampony", en: "Haircare" }, query: "szampon" }
        ]
      },
      {
        title: { pl: "Sprzęt kosmetyczny i fryzjerski", en: "Beauty & Hair Devices", de: "Beauty-Geräte" },
        items: [
          { name: { pl: "Suszarki, prostownice i lokówki", en: "Hair Dryers & Straighteners" }, query: "prostownica" },
          { name: { pl: "Depilatory laserowe i IPL", en: "IPL Hair Removal" }, query: "depilator" },
          { name: { pl: "Lampy UV/LED do paznokci", en: "Nail Lamps" }, query: "lampa UV" }
        ]
      },
      {
        title: { pl: "Zdrowie i masaż", en: "Health & Wellness", de: "Gesundheit & Massage" },
        items: [
          { name: { pl: "Masażery i pistolety do masażu", en: "Massage Guns" }, query: "masażer" },
          { name: { pl: "Ciśnieniomierze i inhalatory", en: "Inhalers & Monitors" }, query: "ciśnieniomierz" },
          { name: { pl: "Suplementy diety i witaminy", en: "Supplements" }, query: "witaminy" }
        ]
      }
    ],
    popularTags: {
      pl: ["Dior", "Chanel", "Dyson Airwrap", "Pistolet do masażu", "Depilator IPL", "Perfumy", "Lampa do paznokci"],
      en: ["Chanel", "Dior", "Dyson", "Massage Gun", "IPL", "Skincare", "Perfume"]
    }
  },

  "music-education": {
    slug: "music-education",
    groups: [
      {
        title: { pl: "Instrumenty muzyczne", en: "Musical Instruments", de: "Musikinstrumente" },
        items: [
          { name: { pl: "Gitary (akustyczne, elektryczne, basowe)", en: "Guitars" }, query: "gitara" },
          { name: { pl: "Pianina, fortepiany i keyboardy", en: "Pianos & Keyboards" }, query: "pianino" },
          { name: { pl: "Perkusje i talerze", en: "Drums & Cymbals" }, query: "perkusja" },
          { name: { pl: "Skrzypce, saksofony i dęte", en: "Violins & Wind Instruments" }, query: "skrzypce" }
        ]
      },
      {
        title: { pl: "Sprzęt studyjny i DJ", en: "Studio & DJ Gear", de: "Studio- & DJ-Equipment" },
        items: [
          { name: { pl: "Mikrofony studyjne i estradowe", en: "Microphones" }, query: "mikrofon" },
          { name: { pl: "Karty dźwiękowe i interfejsy", en: "Audio Interfaces" }, query: "interfejs audio" },
          { name: { pl: "Kontrolery DJ i miksery", en: "DJ Controllers" }, query: "kontroler DJ" },
          { name: { pl: "Wzmacniacze i kolumny estradowe", en: "Amplifiers & PA" }, query: "wzmacniacz" }
        ]
      },
      {
        title: { pl: "Płyty i muzyka", en: "Vinyl & Music Media", de: "Vinyl & CDs" },
        items: [
          { name: { pl: "Płyty winylowe", en: "Vinyl Records" }, query: "winyl" },
          { name: { pl: "Płyty CD i kasety magnetofonowe", en: "CDs & Cassettes" }, query: "płyta CD" },
          { name: { pl: "Nuty, śpiewniki i podręczniki", en: "Sheet Music" }, query: "nuty" }
        ]
      },
      {
        title: { pl: "Korepetycje i kursy", en: "Lessons & Courses", de: "Unterricht & Kurse" },
        items: [
          { name: { pl: "Lekcje gry na instrumentach", en: "Instrument Lessons" }, query: "nauka gry" },
          { name: { pl: "Lekcje śpiewu i emisji głosu", en: "Vocal Lessons" }, query: "lekcje śpiewu" },
          { name: { pl: "Kursy językowe i korepetycje", en: "Language Tutors" }, query: "korepetycje angielski" }
        ]
      }
    ],
    popularTags: {
      pl: ["Gitara klasyczna", "Pianino cyfrowe", "Yamaha", "Fender", "Płyty winylowe", "Mikrofon Shure", "Pioneer DJ"],
      en: ["Fender Guitar", "Yamaha Piano", "Vinyl Records", "DJ Controller", "Microphone", "Drum Kit"]
    }
  },

  "accommodations-stays": {
    slug: "accommodations-stays",
    groups: [
      {
        title: { pl: "Noclegi nad morzem i w górach", en: "Coast & Mountains", de: "Küste & Berge" },
        items: [
          { name: { pl: "Domki całoroczne i letniskowe", en: "Holiday Cottages" }, query: "domek" },
          { name: { pl: "Apartamenty wakacyjne", en: "Holiday Apartments" }, query: "apartament wakacyjny" },
          { name: { pl: "Pokoje gościnne i kwatery", en: "Guest Rooms" }, query: "pokoje gościnne" }
        ]
      },
      {
        title: { pl: "Hotele i agroturystyka", en: "Hotels & Agritourism", de: "Hotels & Bauernhofurlaub" },
        items: [
          { name: { pl: "Gospodarstwa agroturystyczne", en: "Agritourism Farms" }, query: "agroturystyka" },
          { name: { pl: "Pensjonaty i wille", en: "Guesthouses & B&Bs" }, query: "pensjonat" },
          { name: { pl: "Kempingi, glamping i pola namiotowe", en: "Glamping & Camping" }, query: "glamping" }
        ]
      },
      {
        title: { pl: "Popularne regiony", en: "Popular Destinations", de: "Beliebte Regionen" },
        items: [
          { name: { pl: "Zakopane i Tatry", en: "Zakopane & Tatras" }, query: "Zakopane" },
          { name: { pl: "Władysławowo, Łeba, Hel", en: "Baltic Coast" }, query: "morze" },
          { name: { pl: "Mazury i Kraina Jezior", en: "Masurian Lakes" }, query: "Mazury" },
          { name: { pl: "Bieszczady i Karkonosze", en: "Bieszczady Mountains" }, query: "Bieszczady" }
        ]
      }
    ],
    popularTags: {
      pl: ["Domek z bali", "Zakopane", "Apartament nad morzem", "Mazury", "Glamping z jacuzzi", "Bieszczady", "Agroturystyka"],
      en: ["Cabin with Jacuzzi", "Sea View Apartment", "Mountain Chalet", "Glamping", "Lake Cottage"]
    }
  },

  "rentals-hire": {
    slug: "rentals-hire",
    groups: [
      {
        title: { pl: "Wynajem sprzętu budowlanego", en: "Construction Equipment", de: "Baumaschinenverleih" },
        items: [
          { name: { pl: "Minikoparki i ładowarki", en: "Mini Excavators" }, query: "wynajem minikoparki" },
          { name: { pl: "Zagęszczarki i skoczki", en: "Compactors" }, query: "wynajem zagęszczarki" },
          { name: { pl: "Rusztowania i podnośniki koszowe", en: "Cherry Pickers & Scaffolding" }, query: "wynajem rusztowań" }
        ]
      },
      {
        title: { pl: "Wypożyczalnia aut i przyczep", en: "Vehicles & Trailers", de: "Fahrzeug- & Anhängerverleih" },
        items: [
          { name: { pl: "Auta osobowe i sportowe", en: "Cars & Sports Cars" }, query: "wynajem aut" },
          { name: { pl: "Busy dostawcze i 9-osobowe", en: "Vans & Minibuses" }, query: "wynajem busa" },
          { name: { pl: "Przyczepy i lawety", en: "Trailers & Car Haulers" }, query: "wypożyczalnia przyczep" }
        ]
      },
      {
        title: { pl: "Imprezy i eventy", en: "Party & Events", de: "Eventausstattung" },
        items: [
          { name: { pl: "Namioty bankietowe i hale", en: "Party Tents" }, query: "namioty imprezowe" },
          { name: { pl: "Dmuchance i atrakcje dla dzieci", en: "Bouncy Castles" }, query: "dmuchańce" },
          { name: { pl: "Nagłośnienie i oświetlenie sceniczne", en: "Sound & Lighting" }, query: "nagłośnienie" }
        ]
      }
    ],
    popularTags: {
      pl: ["Wynajem minikoparki", "Wypożyczalnia busów", "Dmuchańce na urodziny", "Wynajem lawety", "Podnośnik koszowy"],
      en: ["Mini Excavator Hire", "Van Rental", "Bouncy Castle Hire", "Trailer Rental"]
    }
  },

  "free-stuff": {
    slug: "free-stuff",
    groups: [
      {
        title: { pl: "Oddam za darmo", en: "Free Giveaways", de: "Zu verschenken" },
        items: [
          { name: { pl: "Meble i wyposażenie za darmo", en: "Free Furniture" }, query: "oddam meble" },
          { name: { pl: "AGD i elektronika za darmo", en: "Free Appliances & Electronics" }, query: "oddam AGD" },
          { name: { pl: "Ubrania i artykuły dziecięce", en: "Free Clothes & Baby Items" }, query: "oddam ubrania" },
          { name: { pl: "Materiały budowlane i gruz", en: "Free Materials & Dirt" }, query: "oddam za darmo" }
        ]
      },
      {
        title: { pl: "Zwierzęta do adopcji", en: "Pets for Adoption", de: "Tiere zur Adoption" },
        items: [
          { name: { pl: "Pieski i szczeniaki do adopcji", en: "Dogs for Adoption" }, query: "oddam psa" },
          { name: { pl: "Kocięta szukające domu", en: "Kittens for Adoption" }, query: "oddam kota" }
        ]
      }
    ],
    popularTags: {
      pl: ["Oddam meble", "Oddam za darmo", "Do odebrania", "Sofa za darmo", "Adopcja psa", "Gruz za darmo"],
      en: ["Free Furniture", "Free Pickup", "Free Dog", "Free Clothes", "Giveaway"]
    }
  },

  "delivery-deals": {
    slug: "delivery-deals",
    groups: [
      {
        title: { pl: "Kategorie z szybką wysyłką", en: "Fast Shipping Deals", de: "Schneller Versand" },
        items: [
          { name: { pl: "Elektronika z wysyłką paczkomatem", en: "Electronics with Locker Delivery" }, query: "wysyłka paczkomat" },
          { name: { pl: "Moda i obuwie z dostawą", en: "Fashion with Delivery" }, query: "z dostawą" },
          { name: { pl: "Książki, gry i drobiazgi", en: "Books & Media with Delivery" }, query: "wysyłka" },
          { name: { pl: "Części samochodowe kurierem", en: "Auto Parts Delivered" }, query: "kurier" }
        ]
      }
    ],
    popularTags: {
      pl: ["Paczkomat", "Wysyłka OLX/InPost", "Darmowa dostawa", "Kurier DPD", "Wysyłka w 24h"],
      en: ["Parcel Locker", "Free Delivery", "Express Shipping", "Same-Day Dispatch"]
    }
  },

  "books-textbooks": {
    slug: "books-textbooks",
    groups: [
      {
        title: { pl: "Podręczniki i nauka", en: "Textbooks & Education", de: "Schulbücher & Lernen" },
        items: [
          { name: { pl: "Podręczniki do liceum i technikum", en: "High School Books" }, query: "podręczniki liceum" },
          { name: { pl: "Podręczniki do szkoły podstawowej", en: "Primary School Books" }, query: "podręczniki podstawówka" },
          { name: { pl: "Książki akademickie i medyczne", en: "University & Medical" }, query: "podręcznik akademicki" },
          { name: { pl: "Słowniki i nauka języków obcych", en: "Language Learning & Dictionaries" }, query: "język angielski" }
        ]
      },
      {
        title: { pl: "Literatura i komiksy", en: "Fiction & Comics", de: "Literatur & Comics" },
        items: [
          { name: { pl: "Kryminały, thrillery i sensacja", en: "Thrillers & Crime" }, query: "kryminał" },
          { name: { pl: "Fantastyka, Sci-Fi i horror", en: "Fantasy & Sci-Fi" }, query: "fantasy" },
          { name: { pl: "Komiksy, manga i powieści graficzne", en: "Comics & Manga" }, query: "manga" },
          { name: { pl: "Literatura faktu, biografie i historia", en: "Biographies & History" }, query: "biografia" }
        ]
      }
    ],
    popularTags: {
      pl: ["Nowa Era", "Manga", "Stephen King", "Remigiusz Mróz", "Wiedźmin", "Podręczniki klasa 4", "Język niemiecki"],
      en: ["Manga", "Stephen King", "Textbooks", "Harry Potter", "Fantasy Books", "Biographies"]
    }
  },

  "auto-parts": {
    slug: "auto-parts",
    groups: [
      {
        title: { pl: "Koła, felgi i opony", en: "Wheels, Tires & Rims", de: "Reifen & Felgen" },
        items: [
          { name: { pl: "Opony zimowe, letnie i całoroczne", en: "Tires (Winter/Summer)" }, query: "opony zimowe" },
          { name: { pl: "Felgi aluminiowe (alufelgi) i stalowe", en: "Alloy & Steel Rims" }, query: "alufelgi" },
          { name: { pl: "Koła kompletne z oponami", en: "Complete Wheel Sets" }, query: "koła" }
        ]
      },
      {
        title: { pl: "Karoseria i oświetlenie", en: "Body & Lighting", de: "Karosserie & Beleuchtung" },
        items: [
          { name: { pl: "Reflektory LED, lampy i ksenony", en: "Headlights & Lamps" }, query: "reflektor" },
          { name: { pl: "Zderzaki, maski, błotniki i drzwi", en: "Bumpers, Hoods & Doors" }, query: "zderzak" },
          { name: { pl: "Lusterka, szyby i grille", en: "Mirrors & Windshields" }, query: "lusterko" }
        ]
      },
      {
        title: { pl: "Mechanika i podzespoły", en: "Engine & Drivetrain", de: "Motor & Getriebe" },
        items: [
          { name: { pl: "Silniki kompletne i słupki", en: "Complete Engines" }, query: "silnik" },
          { name: { pl: "Skrzynie biegów manualne i automatyczne", en: "Gearboxes & Transmission" }, query: "skrzynia biegów" },
          { name: { pl: "Turbosprężarki i wtryskiwacze", en: "Turbos & Injectors" }, query: "turbosprężarka" },
          { name: { pl: "Zawieszenie, amortyzatory i hamulce", en: "Brakes & Suspension" }, query: "zacisk hamulcowy" }
        ]
      }
    ],
    popularTags: {
      pl: ["Alufelgi 17 18 19", "Opony 205/55R16", "Lampy LED", "Zderzak M Pakiet", "Turbina", "Hak holowniczy", "Skrzynia DSG"],
      en: ["Alloy Rims", "Tires", "LED Headlights", "Bumper", "Turbocharger", "Brake Caliper"]
    }
  },

  "machinery-parts": {
    slug: "machinery-parts",
    groups: [
      {
        title: { pl: "Części do maszyn rolniczych", en: "Agricultural Parts", de: "Landmaschinenteile" },
        items: [
          { name: { pl: "Części do ciągników Ursus, Zetor, MTZ", en: "Tractor Spares" }, query: "części ursus" },
          { name: { pl: "Lemiesze, dłuta i części do pługów", en: "Plow Blades & Spares" }, query: "lemiesz" },
          { name: { pl: "Paski klinowe, łańcuchy i łożyska", en: "Belts, Chains & Bearings" }, query: "łożyska" }
        ]
      },
      {
        title: { pl: "Części do maszyn budowlanych", en: "Construction Spares", de: "Baumaschinenteile" },
        items: [
          { name: { pl: "Gąsienice gumowe i rolki", en: "Rubber Tracks" }, query: "gąsienice" },
          { name: { pl: "Łyżki do koparek i szybkozłącza", en: "Excavator Buckets" }, query: "łyżka do koparki" },
          { name: { pl: "Pompy hydrauliczne i siłowniki", en: "Hydraulic Pumps & Cylinders" }, query: "siłownik hydrauliczny" }
        ]
      }
    ],
    popularTags: {
      pl: ["Łyżka do minikoparki", "Gąsienice gumowe", "Rozdzielacz hydrauliczny", "Części C-360", "Siłownik"],
      en: ["Excavator Bucket", "Rubber Tracks", "Hydraulic Cylinder", "Tractor Parts"]
    }
  },

  "featured-employers": {
    slug: "featured-employers",
    groups: [
      {
        title: { pl: "Profile pracodawców", en: "Employer Profiles", de: "Arbeitgeberprofile" },
        items: [
          { name: { pl: "Duże przedsiębiorstwa i korporacje", en: "Top Enterprises" }, query: "pracodawca" },
          { name: { pl: "Agencje pracy i rekrutacji", en: "Employment Agencies" }, query: "agencja pracy" },
          { name: { pl: "Firmy produkcyjne i logistyczne", en: "Manufacturing & Logistics" }, query: "produkcja" }
        ]
      }
    ],
    popularTags: {
      pl: ["Praca od zaraz", "Umowa o pracę", "Benefity", "Stabilne zatrudnienie", "Darmowe zakwaterowanie"],
      en: ["Full-Time", "Immediate Start", "Benefits", "Accommodation Included"]
    }
  },

  "auto-expo-events": {
    slug: "auto-expo-events",
    groups: [
      {
        title: { pl: "Wydarzenia motoryzacyjne", en: "Automotive Events", de: "Motorsport & Events" },
        items: [
          { name: { pl: "Targi i wystawy samochodowe", en: "Car Shows & Expos" }, query: "targi motoryzacyjne" },
          { name: { pl: "Zloty samochodów klasycznych i zabytkowych", en: "Classic Car Meets" }, query: "zlot klasyków" },
          { name: { pl: "Zawody driftingowe, KJS i rajdy", en: "Drift & Rally Events" }, query: "rajd" },
          { name: { pl: "Track day i imprezy torowe", en: "Track Days" }, query: "track day" }
        ]
      }
    ],
    popularTags: {
      pl: ["Targi Poznań", "Zlot Youngtimer", "Drift Masters", "Bilety na targi", "Classic Auto"],
      en: ["Car Expo", "Track Day", "Classic Car Meet", "Drift Event"]
    }
  }
};
