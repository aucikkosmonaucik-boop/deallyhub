class SubcategoryItem {
  final Map<String, String> name;
  final String? query;

  const SubcategoryItem({
    required this.name,
    this.query,
  });

  String getName(String langCode) {
    return name[langCode] ?? name['pl'] ?? name['en'] ?? '';
  }
}

class SubcategoryGroup {
  final Map<String, String> title;
  final List<SubcategoryItem> items;

  const SubcategoryGroup({
    required this.title,
    required this.items,
  });

  String getTitle(String langCode) {
    return title[langCode] ?? title['pl'] ?? title['en'] ?? '';
  }
}

class CategoryDetail {
  final String slug;
  final List<SubcategoryGroup> groups;
  final Map<String, List<String>> popularTags;

  const CategoryDetail({
    required this.slug,
    required this.groups,
    required this.popularTags,
  });

  List<String> getPopularTags(String langCode) {
    return popularTags[langCode] ?? popularTags['pl'] ?? popularTags['en'] ?? [];
  }
}

class CategoryData {
  static const Map<String, CategoryDetail> categoryDetails = {
    'electronics': CategoryDetail(
      slug: 'electronics',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Telefony i akcesoria', 'en': 'Phones & Accessories', 'de': 'Handys & Zubehör'},
          items: [
            SubcategoryItem(name: {'pl': 'Smartfony', 'en': 'Smartphones', 'de': 'Smartphones'}, query: 'smartfon'),
            SubcategoryItem(name: {'pl': 'Smartwatche i opaski', 'en': 'Smartwatches & Bands', 'de': 'Smartwatches & Fitnesstracker'}, query: 'smartwatch'),
            SubcategoryItem(name: {'pl': 'Tablety', 'en': 'Tablets', 'de': 'Tablets'}, query: 'tablet'),
            SubcategoryItem(name: {'pl': 'Akcesoria GSM i ładowarki', 'en': 'GSM Accessories & Chargers', 'de': 'Handyzubehör & Ladegeräte'}, query: 'ładowarka'),
            SubcategoryItem(name: {'pl': 'Etui, pokrowce i szkła', 'en': 'Cases & Screen Protectors', 'de': 'Hüllen & Schutzgläser'}, query: 'etui'),
            SubcategoryItem(name: {'pl': 'Powerbanki', 'en': 'Powerbanks', 'de': 'Powerbanks'}, query: 'powerbank'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Komputery i laptopy', 'en': 'Computers & Laptops', 'de': 'Computer & Laptops'},
          items: [
            SubcategoryItem(name: {'pl': 'Laptopy', 'en': 'Laptops', 'de': 'Laptops & Notebooks'}, query: 'laptop'),
            SubcategoryItem(name: {'pl': 'Komputery stacjonarne', 'en': 'Desktop PCs', 'de': 'Desktop-PCs'}, query: 'komputer'),
            SubcategoryItem(name: {'pl': 'Podzespoły komputerowe', 'en': 'PC Components', 'de': 'PC-Komponenten'}, query: 'karta graficzna'),
            SubcategoryItem(name: {'pl': 'Monitory', 'en': 'Monitors', 'de': 'Monitore'}, query: 'monitor'),
            SubcategoryItem(name: {'pl': 'Drukarki i skanery', 'en': 'Printers & Scanners', 'de': 'Drucker & Scanner'}, query: 'drukarka'),
            SubcategoryItem(name: {'pl': 'Dyski i pamięci', 'en': 'Storage & Drives', 'de': 'Festplatten & Speicher'}, query: 'dysk'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Telewizory i audio', 'en': 'TV & Audio', 'de': 'Fernseher & Audio'},
          items: [
            SubcategoryItem(name: {'pl': 'Telewizory Smart TV', 'en': 'Smart TVs', 'de': 'Smart-TVs'}, query: 'telewizor'),
            SubcategoryItem(name: {'pl': 'Słuchawki bezprzewodowe', 'en': 'Wireless Headphones', 'de': 'Kabellose Kopfhörer'}, query: 'słuchawki'),
            SubcategoryItem(name: {'pl': 'Głośniki i Soundbary', 'en': 'Speakers & Soundbars', 'de': 'Lautsprecher & Soundbars'}, query: 'głośnik'),
            SubcategoryItem(name: {'pl': 'Projektory i rzutniki', 'en': 'Projectors', 'de': 'Projektoren & Beamer'}, query: 'projektor'),
            SubcategoryItem(name: {'pl': 'Kino domowe i amplitunery', 'en': 'Home Theater & Receivers', 'de': 'Heimkino & Receiver'}, query: 'kino domowe'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Konsole i gaming', 'en': 'Gaming & Consoles', 'de': 'Konsolen & Gaming'},
          items: [
            SubcategoryItem(name: {'pl': 'PlayStation 5 / PS4', 'en': 'PlayStation 5 / PS4', 'de': 'PlayStation 5 / PS4'}, query: 'PlayStation'),
            SubcategoryItem(name: {'pl': 'Xbox Series X/S / One', 'en': 'Xbox Series X/S / One', 'de': 'Xbox Series X/S / One'}, query: 'Xbox'),
            SubcategoryItem(name: {'pl': 'Nintendo Switch', 'en': 'Nintendo Switch', 'de': 'Nintendo Switch'}, query: 'Nintendo'),
            SubcategoryItem(name: {'pl': 'Gry na konsole i PC', 'en': 'Video Games (Console & PC)', 'de': 'Videospiele (Konsole & PC)'}, query: 'gry'),
            SubcategoryItem(name: {'pl': 'Fotele i biurka gamingowe', 'en': 'Gaming Chairs & Desks', 'de': 'Gaming-Stühle & Schreibtische'}, query: 'gaming'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['iPhone', 'Samsung Galaxy', 'MacBook', 'PlayStation 5', 'RTX 4070', 'iPad', 'JBL', 'Xiaomi'],
        'en': ['iPhone', 'Samsung Galaxy', 'MacBook', 'PS5', 'RTX 4080', 'iPad Pro', 'Sony', 'Dell'],
        'de': ['iPhone', 'Samsung Galaxy', 'MacBook', 'PS5', 'RTX 4080', 'iPad Pro', 'Sony', 'Bose'],
      },
    ),

    'automotive-vehicles': CategoryDetail(
      slug: 'automotive-vehicles',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Samochody osobowe', 'en': 'Passenger Cars', 'de': 'Personenkraftwagen'},
          items: [
            SubcategoryItem(name: {'pl': 'Samochody używane', 'en': 'Used Cars', 'de': 'Gebrauchtwagen'}, query: 'samochód'),
            SubcategoryItem(name: {'pl': 'Samochody nowe', 'en': 'New Cars', 'de': 'Neuwagen'}, query: 'salon'),
            SubcategoryItem(name: {'pl': 'Auta hybrydowe i elektryczne', 'en': 'Electric & Hybrid Cars', 'de': 'Elektro- & Hybridautos'}, query: 'hybryda'),
            SubcategoryItem(name: {'pl': 'Kombi i SUV', 'en': 'SUV & Estate', 'de': 'SUVs & Kombis'}, query: 'SUV'),
            SubcategoryItem(name: {'pl': 'Hatchback i Sedan', 'en': 'Sedan & Hatchback', 'de': 'Limousinen & Schrägheck'}),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Dostawcze i ciężarowe', 'en': 'Commercial & Trucks', 'de': 'Nutzfahrzeuge & LKW'},
          items: [
            SubcategoryItem(name: {'pl': 'Samochody dostawcze do 3.5t', 'en': 'Vans up to 3.5t', 'de': 'Lieferwagen bis 3,5t'}, query: 'dostawczy'),
            SubcategoryItem(name: {'pl': 'Ciągniki siodłowe', 'en': 'Semi-Trucks', 'de': 'Sattelzugmaschinen'}, query: 'ciągnik'),
            SubcategoryItem(name: {'pl': 'Naczepy i przyczepy', 'en': 'Trailers & Semi-Trailers', 'de': 'Anhänger & Auflieger'}, query: 'przyczepa'),
            SubcategoryItem(name: {'pl': 'Autobusy i busy', 'en': 'Buses & Minibuses', 'de': 'Busse & Minibusse'}, query: 'bus'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Jednoślady i rekreacja', 'en': 'Motorcycles & Quads', 'de': 'Motorräder & Quads'},
          items: [
            SubcategoryItem(name: {'pl': 'Motocykle szosowe i turystyczne', 'en': 'Road & Touring Motorcycles', 'de': 'Straßen- & Tourer-Motorräder'}, query: 'motocykl'),
            SubcategoryItem(name: {'pl': 'Skutery i motorowery', 'en': 'Scooters & Mopeds', 'de': 'Roller & Mopeds'}, query: 'skuter'),
            SubcategoryItem(name: {'pl': 'Quady i ATV', 'en': 'Quads & ATVs', 'de': 'Quads & ATVs'}, query: 'quad'),
            SubcategoryItem(name: {'pl': 'Cross i Enduro', 'en': 'Cross & Enduro', 'de': 'Motocross & Enduro'}, query: 'cross'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Części i wyposażenie', 'en': 'Parts & Accessories', 'de': 'Teile & Zubehör'},
          items: [
            SubcategoryItem(name: {'pl': 'Opony i felgi', 'en': 'Tires & Rims', 'de': 'Reifen & Felgen'}, query: 'opony'),
            SubcategoryItem(name: {'pl': 'Części karoserii', 'en': 'Body Parts', 'de': 'Karosserieteile'}, query: 'zderzak'),
            SubcategoryItem(name: {'pl': 'Silniki i osprzęt', 'en': 'Engines & Parts', 'de': 'Motoren & Zubehör'}, query: 'silnik'),
            SubcategoryItem(name: {'pl': 'Oleje i chemia', 'en': 'Oils & Car Care', 'de': 'Öle & Autopflege'}, query: 'olej'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz', 'Toyota', 'Ford', 'Skoda', 'Volvo', 'Honda'],
        'en': ['BMW', 'Audi', 'Mercedes-Benz', 'Toyota', 'Ford', 'Volkswagen', 'Tesla', 'Porsche'],
        'de': ['BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen', 'Toyota', 'Porsche', 'Opel', 'Ford'],
      },
    ),

    'real-estate': CategoryDetail(
      slug: 'real-estate',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Mieszkania', 'en': 'Apartments & Flats', 'de': 'Wohnungen'},
          items: [
            SubcategoryItem(name: {'pl': 'Mieszkania na sprzedaż', 'en': 'Apartments for Sale', 'de': 'Wohnungen zum Kauf'}, query: 'mieszkanie sprzedaż'),
            SubcategoryItem(name: {'pl': 'Mieszkania na wynajem', 'en': 'Apartments for Rent', 'de': 'Wohnungen zur Miete'}, query: 'mieszkanie wynajem'),
            SubcategoryItem(name: {'pl': 'Kawalerki i 1-pokojowe', 'en': 'Studio Apartments', 'de': '1-Zimmer-Wohnungen & Studios'}, query: 'kawalerka'),
            SubcategoryItem(name: {'pl': 'Apartamenty i lofty', 'en': 'Luxury Apartments & Lofts', 'de': 'Luxus-Apartments & Lofts'}, query: 'apartament'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Domy i wille', 'en': 'Houses & Villas', 'de': 'Häuser & Villen'},
          items: [
            SubcategoryItem(name: {'pl': 'Domy jednorodzinne', 'en': 'Single-Family Houses', 'de': 'Einfamilienhäuser'}, query: 'dom'),
            SubcategoryItem(name: {'pl': 'Szeregowce i bliźniaki', 'en': 'Townhouses & Semis', 'de': 'Reihen- & Doppelhäuser'}, query: 'bliźniak'),
            SubcategoryItem(name: {'pl': 'Domy letniskowe', 'en': 'Holiday Homes', 'de': 'Ferienhäuser'}, query: 'letniskowy'),
            SubcategoryItem(name: {'pl': 'Domy na wynajem', 'en': 'Houses for Rent', 'de': 'Häuser zur Miete'}, query: 'dom wynajem'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Działki i grunty', 'en': 'Plots & Land', 'de': 'Grundstücke'},
          items: [
            SubcategoryItem(name: {'pl': 'Działki budowlane', 'en': 'Building Land', 'de': 'Baugrundstücke'}, query: 'działka budowlana'),
            SubcategoryItem(name: {'pl': 'Działki rekreacyjne / ROD', 'en': 'Recreation Plots', 'de': 'Freizeit- & Gartengrundstücke'}, query: 'działka rekreacyjna'),
            SubcategoryItem(name: {'pl': 'Grunty rolne i leśne', 'en': 'Agricultural Land', 'de': 'Land- & Forstwirtschaftsflächen'}, query: 'rolna'),
            SubcategoryItem(name: {'pl': 'Działki inwestycyjne', 'en': 'Commercial Plots', 'de': 'Gewerbegrundstücke'}, query: 'inwestycyjna'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Lokale i komercyjne', 'en': 'Commercial Properties', 'de': 'Gewerbeimmobilien'},
          items: [
            SubcategoryItem(name: {'pl': 'Lokale użytkowe i sklepy', 'en': 'Retail & Commercial Units', 'de': 'Ladenflächen & Gewerbe'}, query: 'lokal'),
            SubcategoryItem(name: {'pl': 'Biura i gabinety', 'en': 'Offices & Practices', 'de': 'Büros & Praxen'}, query: 'biuro'),
            SubcategoryItem(name: {'pl': 'Magazyny i hale', 'en': 'Warehouses & Halls', 'de': 'Lager & Hallen'}, query: 'magazyn'),
            SubcategoryItem(name: {'pl': 'Garaże i miejsca postojowe', 'en': 'Garages & Parking Spaces', 'de': 'Garagen & Stellplätze'}, query: 'garaż'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Kawalerka', 'Działka budowlana', 'Bez pośredników'],
        'en': ['For Rent', 'For Sale', 'Studio Flat', '2-Bedroom', 'City Center', 'Plot', 'Garage'],
        'de': ['Zur Miete', 'Zum Kauf', 'Wohnung', 'Haus', 'Grundstück', 'Garage', 'Balkon'],
      },
    ),

    'home-garden': CategoryDetail(
      slug: 'home-garden',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Meble i wyposażenie', 'en': 'Furniture & Decor', 'de': 'Möbel & Wohnen'},
          items: [
            SubcategoryItem(name: {'pl': 'Sofy, narożniki i kanapy', 'en': 'Sofas, Couches & Corner Sofas', 'de': 'Sofas, Couches & Ecksofas'}, query: 'sofa'),
            SubcategoryItem(name: {'pl': 'Stoły, krzesła i jadalnia', 'en': 'Tables, Chairs & Dining', 'de': 'Tische, Stühle & Esszimmer'}, query: 'stół'),
            SubcategoryItem(name: {'pl': 'Szafy, komody i regały', 'en': 'Wardrobes, Dressers & Shelves', 'de': 'Schränke, Kommoden & Regale'}, query: 'szafa'),
            SubcategoryItem(name: {'pl': 'Łóżka i materace', 'en': 'Beds & Mattresses', 'de': 'Betten & Matratzen'}, query: 'łóżko'),
            SubcategoryItem(name: {'pl': 'Meble kuchenne', 'en': 'Kitchen Furniture', 'de': 'Küchenmöbel'}, query: 'meble kuchenne'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Ogród i rośliny', 'en': 'Garden & Plants', 'de': 'Garten & Pflanzen'},
          items: [
            SubcategoryItem(name: {'pl': 'Meble ogrodowe i grille', 'en': 'Garden Furniture & BBQs', 'de': 'Gartenmöbel & Grills'}, query: 'meble ogrodowe'),
            SubcategoryItem(name: {'pl': 'Kosiarki i traktorki', 'en': 'Lawn Mowers & Tractors', 'de': 'Rasenmäher & Traktoren'}, query: 'kosiarka'),
            SubcategoryItem(name: {'pl': 'Rośliny, krzewy i sadzonki', 'en': 'Plants, Shrubs & Seedlings', 'de': 'Pflanzen, Sträucher & Setzlinge'}, query: 'rośliny'),
            SubcategoryItem(name: {'pl': 'Baseny i trampoliny', 'en': 'Pools & Trampolines', 'de': 'Pools & Trampoline'}, query: 'basen'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Narzędzia i majsterkowanie', 'en': 'Tools & DIY', 'de': 'Werkzeuge & Heimwerker'},
          items: [
            SubcategoryItem(name: {'pl': 'Elektronarzędzia (wkrętarki, wiertarki)', 'en': 'Power Tools (Drills, Screwdrivers)', 'de': 'Elektrowerkzeuge (Bohrer, Schrauber)'}, query: 'wkrętarka'),
            SubcategoryItem(name: {'pl': 'Narzędzia ręczne i zestawy', 'en': 'Hand Tools & Sets', 'de': 'Handwerkzeuge & Sets'}, query: 'narzędzia'),
            SubcategoryItem(name: {'pl': 'Spawarki i kompresory', 'en': 'Welders & Compressors', 'de': 'Schweißgeräte & Kompressoren'}, query: 'kompresor'),
            SubcategoryItem(name: {'pl': 'Oświetlenie i elektryka', 'en': 'Lighting & Electrical', 'de': 'Beleuchtung & Elektrik'}, query: 'oświetlenie'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Dekoracje i tekstylia', 'en': 'Home Accents & Textiles', 'de': 'Deko & Textilien'},
          items: [
            SubcategoryItem(name: {'pl': 'Dywany i chodniki', 'en': 'Rugs & Carpets', 'de': 'Teppiche & Läufer'}, query: 'dywan'),
            SubcategoryItem(name: {'pl': 'Zasłony, firany i pościele', 'en': 'Curtains, Drapes & Bedding', 'de': 'Vorhänge, Gardinen & Bettwäsche'}, query: 'zasłony'),
            SubcategoryItem(name: {'pl': 'Obrazy, plakaty i lustra', 'en': 'Wall Art, Posters & Mirrors', 'de': 'Bilder, Poster & Spiegel'}, query: 'lustro'),
            SubcategoryItem(name: {'pl': 'Zastawa i akcesoria kuchenne', 'en': 'Cookware & Dining', 'de': 'Geschirr & Küchenzubehör'}, query: 'zastawa'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['IKEA', 'Kosiarka', 'Makita', 'Bosch', 'Narożnik', 'Stół dębowy', 'Meble tarasowe', 'Grill'],
        'en': ['IKEA', 'Sofa', 'Makita', 'Lawnmower', 'Dining Table', 'Garden Set', 'Drill'],
        'de': ['IKEA', 'Sofa', 'Makita', 'Bosch', 'Rasenmäher', 'Esstisch', 'Gartenmöbel', 'Grill'],
      },
    ),

    'fashion-apparel': CategoryDetail(
      slug: 'fashion-apparel',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Odzież damska', 'en': 'Women\'s Clothing', 'de': 'Damenmode'},
          items: [
            SubcategoryItem(name: {'pl': 'Sukienki i spódnice', 'en': 'Dresses & Skirts', 'de': 'Kleider & Röcke'}, query: 'sukienka'),
            SubcategoryItem(name: {'pl': 'Kurtki, płaszcze i trencze', 'en': 'Jackets, Coats & Trench Coats', 'de': 'Jacken, Mäntel & Trenchcoats'}, query: 'kurtka'),
            SubcategoryItem(name: {'pl': 'Swetry, bluzy i kardigany', 'en': 'Sweaters, Hoodies & Cardigans', 'de': 'Pullover, Hoodies & Strickjacken'}, query: 'sweter'),
            SubcategoryItem(name: {'pl': 'Spodnie, jeansy i legginsy', 'en': 'Jeans, Trousers & Leggings', 'de': 'Hosen, Jeans & Leggings'}, query: 'jeansy'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Odzież męska', 'en': 'Men\'s Clothing', 'de': 'Herrenmode'},
          items: [
            SubcategoryItem(name: {'pl': 'Kurtki i płaszcze męskie', 'en': 'Men\'s Jackets & Coats', 'de': 'Herrenjacken & Mäntel'}, query: 'kurtka męska'),
            SubcategoryItem(name: {'pl': 'Garnitury i marynarki', 'en': 'Suits & Blazers', 'de': 'Anzüge & Sakkos'}, query: 'garnitur'),
            SubcategoryItem(name: {'pl': 'Koszule i polo', 'en': 'Shirts & Polos', 'de': 'Hemden & Poloshirts'}, query: 'koszula'),
            SubcategoryItem(name: {'pl': 'Bluzy i dresy', 'en': 'Hoodies & Tracksuits', 'de': 'Hoodies & Trainingsanzüge'}, query: 'bluza'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Obuwie', 'en': 'Shoes & Footwear', 'de': 'Schuhe'},
          items: [
            SubcategoryItem(name: {'pl': 'Sneakersy i buty sportowe', 'en': 'Sneakers & Trainers', 'de': 'Sneaker & Sportschuhe'}, query: 'sneakers'),
            SubcategoryItem(name: {'pl': 'Buty eleganckie i szpilki', 'en': 'Dress Shoes & Heels', 'de': 'Elegante Schuhe & High Heels'}, query: 'szpilki'),
            SubcategoryItem(name: {'pl': 'Kozaki, botki i trapery', 'en': 'Boots & Ankle Boots', 'de': 'Stiefel & Stiefeletten'}, query: 'botki'),
            SubcategoryItem(name: {'pl': 'Sandały i klapki', 'en': 'Sandals & Slippers', 'de': 'Sandalen & Pantoletten'}, query: 'sandały'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Dodatki i akcesoria', 'en': 'Accessories & Bags', 'de': 'Accessoires & Taschen'},
          items: [
            SubcategoryItem(name: {'pl': 'Torebki i plecaki', 'en': 'Handbags & Backpacks', 'de': 'Handtaschen & Rucksäcke'}, query: 'torebka'),
            SubcategoryItem(name: {'pl': 'Zegarki i smartbandy', 'en': 'Watches & Bands', 'de': 'Uhren & Smartbands'}, query: 'zegarek'),
            SubcategoryItem(name: {'pl': 'Biżuteria (złoto, srebro)', 'en': 'Jewelry (Gold, Silver)', 'de': 'Schmuck (Gold, Silber)'}, query: 'biżuteria'),
            SubcategoryItem(name: {'pl': 'Okulary przeciwsłoneczne', 'en': 'Sunglasses', 'de': 'Sonnenbrillen'}, query: 'okulary'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Zara', 'Nike', 'Adidas', 'Tommy Hilfiger', 'Calvin Klein', 'Jordan', 'Gucci', 'Złoto 585'],
        'en': ['Nike', 'Adidas', 'Zara', 'Gucci', 'Sneakers', 'Leather Jacket', 'Watch', 'Handbag'],
        'de': ['Nike', 'Adidas', 'Zara', 'Tommy Hilfiger', 'Sneaker', 'Uhr', 'Handtasche', 'Gold'],
      },
    ),

    'jobs-careers': CategoryDetail(
      slug: 'jobs-careers',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Branże techniczne i IT', 'en': 'Tech & Engineering', 'de': 'IT & Technik'},
          items: [
            SubcategoryItem(name: {'pl': 'Programowanie i IT', 'en': 'Software & IT', 'de': 'Programmierung & IT'}, query: 'programista'),
            SubcategoryItem(name: {'pl': 'Budownictwo i instalacje', 'en': 'Construction & Installations', 'de': 'Bau & Installationen'}, query: 'budownictwo'),
            SubcategoryItem(name: {'pl': 'Inżynieria i produkcja', 'en': 'Engineering & Production', 'de': 'Ingenieurwesen & Produktion'}, query: 'inżynier'),
            SubcategoryItem(name: {'pl': 'Mechanika i elektromechanika', 'en': 'Mechanics & Electromechanics', 'de': 'Mechanik & Elektromechanik'}, query: 'mechanik'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Handel, logistyka i usługi', 'en': 'Logistics & Services', 'de': 'Handel & Logistik'},
          items: [
            SubcategoryItem(name: {'pl': 'Kierowcy i kurierzy (kat. B, C, C+E)', 'en': 'Drivers & Couriers (B, C, C+E)', 'de': 'Fahrer & Kuriere (Kl. B, C, CE)'}, query: 'kierowca'),
            SubcategoryItem(name: {'pl': 'Magazynierzy i operatorzy wózków', 'en': 'Warehouse Workers & Forklift Drivers', 'de': 'Lagerarbeiter & Staplerfahrer'}, query: 'magazynier'),
            SubcategoryItem(name: {'pl': 'Sprzedaż, kasjer i obsługa klienta', 'en': 'Sales, Cashiers & Customer Service', 'de': 'Verkauf, Kasse & Kundenservice'}, query: 'sprzedawca'),
            SubcategoryItem(name: {'pl': 'Gastronomia, kucharz i kelner', 'en': 'Hospitality, Chefs & Waiters', 'de': 'Gastronomie, Köche & Kellner'}, query: 'kucharz'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Praca biurowa i specjaliści', 'en': 'Office & Healthcare', 'de': 'Büro & Gesundheit'},
          items: [
            SubcategoryItem(name: {'pl': 'Księgowość, finanse i HR', 'en': 'Accounting, Finance & HR', 'de': 'Buchhaltung, Finanzen & HR'}, query: 'księgowa'),
            SubcategoryItem(name: {'pl': 'Marketing, social media i reklama', 'en': 'Marketing, Social Media & Ads', 'de': 'Marketing, Social Media & Werbung'}, query: 'marketing'),
            SubcategoryItem(name: {'pl': 'Medycyna, opieka i farmacja', 'en': 'Healthcare, Nursing & Pharmacy', 'de': 'Medizin, Pflege & Pharmazie'}, query: 'pielęgniarka'),
            SubcategoryItem(name: {'pl': 'Edukacja, korepetycje i nauka', 'en': 'Education & Tutoring', 'de': 'Bildung & Nachhilfe'}, query: 'korepetycje'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Tryb pracy i za granicą', 'en': 'Work Mode & Abroad', 'de': 'Arbeitsmodell & Ausland'},
          items: [
            SubcategoryItem(name: {'pl': 'Praca zdalna / Home office', 'en': 'Remote Work / Home Office', 'de': 'Homeoffice / Remote-Arbeit'}, query: 'praca zdalna'),
            SubcategoryItem(name: {'pl': 'Praca za granicą (Niemcy, Holandia)', 'en': 'Jobs Abroad (Germany, Netherlands)', 'de': 'Jobs im Ausland'}, query: 'za granicą'),
            SubcategoryItem(name: {'pl': 'Praca dodatkowa i dla studentów', 'en': 'Part-Time & Student Jobs', 'de': 'Nebenjobs & Studentenjobs'}, query: 'dodatkowa'),
            SubcategoryItem(name: {'pl': 'Praca tymczasowa i sezonowa', 'en': 'Temporary & Seasonal Jobs', 'de': 'Zeitarbeit & Saisonarbeit'}, query: 'sezonowa'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Kierowca C+E', 'Praca zdalna', 'Magazynier', 'Spawacz', 'Operator CNC', 'Księgowa', 'Praca od zaraz', 'Niemcy'],
        'en': ['Driver', 'Remote', 'Software Developer', 'Warehouse', 'Part-Time', 'Urgent Hire'],
        'de': ['Fahrer', 'Homeoffice', 'Lagerarbeiter', 'Schweißer', 'Vollzeit', 'Teilzeit'],
      },
    ),

    'construction-renovation': CategoryDetail(
      slug: 'construction-renovation',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Materiały budowlane', 'en': 'Building Materials', 'de': 'Baumaterialien'},
          items: [
            SubcategoryItem(name: {'pl': 'Stal, pustaki i cegły', 'en': 'Steel, Bricks & Blocks', 'de': 'Stahl, Ziegel & Mauersteine'}, query: 'pustak'),
            SubcategoryItem(name: {'pl': 'Ocieplenie, styropian i wełna', 'en': 'Insulation, EPS & Mineral Wool', 'de': 'Dämmung, Styropor & Mineralwolle'}, query: 'styropian'),
            SubcategoryItem(name: {'pl': 'Dachówki i pokrycia dachowe', 'en': 'Roof Tiles & Roofing Materials', 'de': 'Dachziegel & Dacheindeckung'}, query: 'blachodachówka'),
            SubcategoryItem(name: {'pl': 'Drewno budowlane i kantówki', 'en': 'Lumber & Timber', 'de': 'Bauholz & Kanthölzer'}, query: 'drewno'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Wykończenie wnętrz', 'en': 'Interior Finishing', 'de': 'Innenausbau'},
          items: [
            SubcategoryItem(name: {'pl': 'Płytki, gres i kafelki', 'en': 'Tiles & Ceramics', 'de': 'Fliesen & Feinsteinzeug'}, query: 'płytki'),
            SubcategoryItem(name: {'pl': 'Panele podłogowe i deski', 'en': 'Laminate Flooring & Wood Boards', 'de': 'Laminat & Parkett'}, query: 'panele'),
            SubcategoryItem(name: {'pl': 'Farby, tynki i gładzie', 'en': 'Paints, Plasters & Skim Coats', 'de': 'Farben, Putze & Spachtelmassen'}, query: 'farba'),
            SubcategoryItem(name: {'pl': 'Drzwi wewnętrzne i zewnętrzne', 'en': 'Interior & Exterior Doors', 'de': 'Innen- & Außentüren'}, query: 'drzwi'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Instalacje i hydraulika', 'en': 'Plumbing & Heating', 'de': 'Heizung & Sanitär'},
          items: [
            SubcategoryItem(name: {'pl': 'Pompy ciepła i klimatyzacja', 'en': 'Heat Pumps & Air Conditioning', 'de': 'Wärmepumpen & Klimaanlagen'}, query: 'pompa ciepła'),
            SubcategoryItem(name: {'pl': 'Kotły, piece i grzejniki', 'en': 'Boilers, Furnaces & Radiators', 'de': 'Heizkessel, Öfen & Heizkörper'}, query: 'piec'),
            SubcategoryItem(name: {'pl': 'Fotowoltaika i inwertery', 'en': 'Photovoltaics & Inverters', 'de': 'Photovoltaik & Wechselrichter'}, query: 'fotowoltaika'),
            SubcategoryItem(name: {'pl': 'Rury, zawory i armatura', 'en': 'Pipes, Valves & Fittings', 'de': 'Rohre, Ventile & Armaturen'}, query: 'armatura'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Maszyny i rusztowania', 'en': 'Machinery & Scaffolding', 'de': 'Baumaschinen & Gerüste'},
          items: [
            SubcategoryItem(name: {'pl': 'Rusztowania i drabiny', 'en': 'Scaffolding & Ladders', 'de': 'Gerüste & Leitern'}, query: 'rusztowanie'),
            SubcategoryItem(name: {'pl': 'Betoniarki i zacieraczki', 'en': 'Cement Mixers & Power Trowels', 'de': 'Betonmischer & Glättmaschinen'}, query: 'betoniarka'),
            SubcategoryItem(name: {'pl': 'Agregaty tynkarskie i malarskie', 'en': 'Plaster & Paint Sprayers', 'de': 'Putz- & Farbspritzgeräte'}, query: 'agregat'),
            SubcategoryItem(name: {'pl': 'Zagęszczarki do gruntu', 'en': 'Plate Compactors', 'de': 'Rüttelplatten & Bodenverdichter'}, query: 'zagęszczarka'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Styropian', 'Pompa ciepła', 'Kostka brukowa', 'Gres', 'Rusztowanie elewacyjne', 'Fotowoltaika', 'Wełna mineralna'],
        'en': ['Heat Pump', 'Scaffolding', 'Tiles', 'Timber', 'Insulation', 'Cement Mixer'],
        'de': ['Wärmepumpe', 'Gerüst', 'Fliesen', 'Bauholz', 'Dämmung', 'Photovoltaik'],
      },
    ),

    'business-industry': CategoryDetail(
      slug: 'business-industry',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Maszyny przemysłowe', 'en': 'Industrial Machinery', 'de': 'Industriemaschinen'},
          items: [
            SubcategoryItem(name: {'pl': 'Tokarki, frezarki i CNC', 'en': 'Lathes, Mills & CNC', 'de': 'Drehbänke, Fräsen & CNC'}, query: 'tokarka'),
            SubcategoryItem(name: {'pl': 'Wtryskarki i prasy hydrauliczne', 'en': 'Injection Molding & Hydraulic Presses', 'de': 'Spritzguss & Hydraulikpressen'}, query: 'prasa'),
            SubcategoryItem(name: {'pl': 'Kompresory przemysłowe', 'en': 'Industrial Compressors', 'de': 'Industriekompressoren'}, query: 'kompresor śrubowy'),
            SubcategoryItem(name: {'pl': 'Maszyny do obróbki drewna i metalu', 'en': 'Wood & Metal Working Machines', 'de': 'Holz- & Metallbearbeitungsmaschinen'}, query: 'obróbka'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Wyposażenie firm i sklepów', 'en': 'Store & Office Equipment', 'de': 'Laden- & Geschäftsausstattung'},
          items: [
            SubcategoryItem(name: {'pl': 'Regały magazynowe wysokiego składowania', 'en': 'High-Bay Storage Racks', 'de': 'Schwerlast- & Hochregale'}, query: 'regały magazynowe'),
            SubcategoryItem(name: {'pl': 'Lady chłodnicze i lodówki sklepowe', 'en': 'Refrigerated Counters & Display Fridges', 'de': 'Kühltheken & Verkaufskühlschränke'}, query: 'lada chłodnicza'),
            SubcategoryItem(name: {'pl': 'Wyposażenie gastronomii i pizzerii', 'en': 'Commercial Kitchen & Pizzeria Equipment', 'de': 'Gastronomie- & Pizzeria-Ausstattung'}, query: 'gastronomia'),
            SubcategoryItem(name: {'pl': 'Wózki widłowe i paletowe', 'en': 'Forklifts & Pallet Jacks', 'de': 'Gabelstapler & Hubwagen'}, query: 'wózek widłowy'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Surowce i półprodukty', 'en': 'Raw Materials', 'de': 'Rohstoffe & Halbzeuge'},
          items: [
            SubcategoryItem(name: {'pl': 'Metale kolorowe i stal', 'en': 'Non-Ferrous Metals & Steel', 'de': 'Buntmetalle & Stahl'}, query: 'stal'),
            SubcategoryItem(name: {'pl': 'Tworzywa sztuczne i granulaty', 'en': 'Plastics & Granulates', 'de': 'Kunststoffe & Granulate'}, query: 'granulat'),
            SubcategoryItem(name: {'pl': 'Opakowania, kartony i palety', 'en': 'Packaging, Boxes & Pallets', 'de': 'Verpackungen, Kartons & Paletten'}, query: 'palety'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Sprzedaż przedsiębiorstw', 'en': 'Businesses for Sale', 'de': 'Unternehmensverkauf'},
          items: [
            SubcategoryItem(name: {'pl': 'Gotowe spółki i firmy', 'en': 'Ready-Made Companies & Businesses', 'de': 'Vorratsgesellschaften & Firmen'}, query: 'spółka'),
            SubcategoryItem(name: {'pl': 'Udziały i inwestorzy', 'en': 'Company Shares & Investors', 'de': 'Firmenanteile & Investoren'}, query: 'udziały'),
            SubcategoryItem(name: {'pl': 'Franczyza i koncepty', 'en': 'Franchise & Business Concepts', 'de': 'Franchise & Geschäftskonzepte'}, query: 'franczyza'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Wózek widłowy', 'Regały magazynowe', 'CNC', 'Lada chłodnicza', 'Palety EPAL', 'Piec do pizzy', 'Tokarka'],
        'en': ['Forklift', 'CNC Machine', 'Storage Racking', 'Commercial Kitchen', 'Pallets'],
        'de': ['Gabelstapler', 'Lagerregale', 'CNC-Maschine', 'Kühltheke', 'Paletten', 'Drehbank'],
      },
    ),

    'agriculture-farming': CategoryDetail(
      slug: 'agriculture-farming',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Ciągniki i traktory', 'en': 'Tractors & Harvesters', 'de': 'Traktoren & Erntemaschinen'},
          items: [
            SubcategoryItem(name: {'pl': 'Ciągniki rolnicze (Ursus, Zetor, John Deere)', 'en': 'Agricultural Tractors', 'de': 'Traktoren & Schlepper'}, query: 'ciągnik rolniczy'),
            SubcategoryItem(name: {'pl': 'Kombajny zbożowe i sieczkarnie', 'en': 'Combine Harvesters & Forage Harvesters', 'de': 'Mähdrescher & Feldhäcksler'}, query: 'kombajn'),
            SubcategoryItem(name: {'pl': 'Mini traktorki i kosiarki sadownicze', 'en': 'Compact Tractors & Orchard Mowers', 'de': 'Kleintraktoren & Obstbaumäher'}, query: 'traktorek'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Maszyny rolnicze i osprzęt', 'en': 'Agricultural Implements', 'de': 'Landmaschinen'},
          items: [
            SubcategoryItem(name: {'pl': 'Pługi, brony i agregaty', 'en': 'Ploughs, Harrows & Tillers', 'de': 'Pflüge, Eggen & Grubber'}, query: 'pług'),
            SubcategoryItem(name: {'pl': 'Siewniki i opryskiwacze', 'en': 'Seeders & Crop Sprayers', 'de': 'Sämaschinen & Feldspritzen'}, query: 'opryskiwacz'),
            SubcategoryItem(name: {'pl': 'Prasy zwijające i kostkujące', 'en': 'Round & Square Balers', 'de': 'Rund- & Quaderballenpressen'}, query: 'prasa zwijająca'),
            SubcategoryItem(name: {'pl': 'Przyczepy rolnicze i wywrotki', 'en': 'Farm Trailers & Tippers', 'de': 'Landwirtschaftliche Anhänger & Kipper'}, query: 'przyczepa rolnicza'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Płody rolne i pasze', 'en': 'Crops, Hay & Feed', 'de': 'Futtermittel & Ernte'},
          items: [
            SubcategoryItem(name: {'pl': 'Zboża, kukurydza i rzepak', 'en': 'Grains, Corn & Rapeseed', 'de': 'Getreide, Mais & Raps'}, query: 'zboże'),
            SubcategoryItem(name: {'pl': 'Siano, słoma i sianokiszonka', 'en': 'Hay, Straw & Silage', 'de': 'Heu, Stroh & Silage'}, query: 'siano'),
            SubcategoryItem(name: {'pl': 'Pasze, koncentraty i nawozy', 'en': 'Animal Feed & Fertilizers', 'de': 'Futtermittel & Dünger'}, query: 'nawóz'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Zwierzęta hodowlane', 'en': 'Livestock & Farm Animals', 'de': 'Nutztiere'},
          items: [
            SubcategoryItem(name: {'pl': 'Bydło, krowy i cielęta', 'en': 'Cattle, Cows & Calves', 'de': 'Rinder, Kühe & Kälber'}, query: 'bydło'),
            SubcategoryItem(name: {'pl': 'Trzoda chlewna i prosięta', 'en': 'Pigs & Piglets', 'de': 'Schweine & Ferkel'}, query: 'prosięta'),
            SubcategoryItem(name: {'pl': 'Drób, kury i kaczki', 'en': 'Poultry, Chickens & Ducks', 'de': 'Geflügel, Hühner & Enten'}, query: 'kury'),
            SubcategoryItem(name: {'pl': 'Konie i kuce', 'en': 'Horses & Ponies', 'de': 'Pferde & Ponys'}, query: 'koń'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Ursus C-360', 'Zetor', 'John Deere', 'Prasa zwijająca', 'Siano w balotach', 'Pług obrotowy', 'Przyczepa rolnicza'],
        'en': ['John Deere', 'Tractor', 'Harvester', 'Hay Bales', 'Farm Trailer', 'Livestock'],
        'de': ['Traktor', 'Mähdrescher', 'Pflug', 'Heu', 'Anhänger', 'John Deere', 'Rinder'],
      },
    ),

    'pets-animals': CategoryDetail(
      slug: 'pets-animals',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Psy i szczenięta', 'en': 'Dogs & Puppies', 'de': 'Hunde & Welpen'},
          items: [
            SubcategoryItem(name: {'pl': 'Psy rasowe z rodowodem (FCI/ZKwP)', 'en': 'Pedigree Dogs', 'de': 'Rassehunde mit Stammbaum'}, query: 'pies'),
            SubcategoryItem(name: {'pl': 'Szczeniaki do adopcji', 'en': 'Puppies for Adoption', 'de': 'Welpen zur Adoption'}, query: 'szczeniak'),
            SubcategoryItem(name: {'pl': 'Legowiska, budy i klatki', 'en': 'Dog Beds, Kennels & Crates', 'de': 'Hundebetten, Hütten & Boxen'}, query: 'legowisko'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Koty i kocięta', 'en': 'Cats & Kittens', 'de': 'Katzen & Kätzchen'},
          items: [
            SubcategoryItem(name: {'pl': 'Koty rasowe (brytyjskie, ragdoll, maine coon)', 'en': 'Pedigree Cats (British, Ragdoll, Maine Coon)', 'de': 'Rassekatzen (BKH, Ragdoll, Maine Coon)'}, query: 'kot'),
            SubcategoryItem(name: {'pl': 'Drapaki, kuwety i transportery', 'en': 'Scratching Posts, Litter Boxes & Carriers', 'de': 'Kratzbäume, Katzenklos & Transportboxen'}, query: 'drapak'),
            SubcategoryItem(name: {'pl': 'Karmy i przysmaki', 'en': 'Pet Food & Treats', 'de': 'Tierfutter & Leckerlis'}, query: 'karma dla kota'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Akwarystyka i terrarystyka', 'en': 'Aquarium & Terrarium', 'de': 'Aquaristik & Terraristik'},
          items: [
            SubcategoryItem(name: {'pl': 'Akwaria, filtry i oświetlenie', 'en': 'Aquariums, Filters & Lighting', 'de': 'Aquarien, Filter & Beleuchtung'}, query: 'akwarium'),
            SubcategoryItem(name: {'pl': 'Ryby akwariowe i krewetki', 'en': 'Aquarium Fish & Shrimps', 'de': 'Aquarienfische & Garnelen'}, query: 'rybki'),
            SubcategoryItem(name: {'pl': 'Terraria, gady i pająki', 'en': 'Terrariums, Reptiles & Spiders', 'de': 'Terrarien, Reptilien & Spinnen'}, query: 'terrarium'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Ptaki i gryzonie', 'en': 'Birds & Small Pets', 'de': 'Vögel & Kleintiere'},
          items: [
            SubcategoryItem(name: {'pl': 'Papugi, kanarki i klatki', 'en': 'Parrots, Canaries & Cages', 'de': 'Papageien, Kanarienvögel & Käfige'}, query: 'papuga'),
            SubcategoryItem(name: {'pl': 'Króliki miniaturowe, chomiki, świnki', 'en': 'Dwarf Rabbits, Hamsters & Guinea Pigs', 'de': 'Zwergkaninchen, Hamster & Meerschweinchen'}, query: 'królik'),
            SubcategoryItem(name: {'pl': 'Klatki, poidełka i sianko', 'en': 'Cages, Drinkers & Hay', 'de': 'Käfige, Tränken & Heu'}, query: 'klatka'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Owczarek niemiecki', 'Maltańczyk', 'Kot brytyjski', 'Ragdoll', 'Akwarium', 'Drapak', 'Królik miniaturka'],
        'en': ['Puppy', 'French Bulldog', 'British Shorthair', 'Aquarium', 'Dog Bed', 'Parrot'],
        'de': ['Welpe', 'Schäferhund', 'BKH Katze', 'Kratzbaum', 'Aquarium', 'Zwergkaninchen'],
      },
    ),

    'baby-kids': CategoryDetail(
      slug: 'baby-kids',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Wózki i foteliki', 'en': 'Strollers & Car Seats', 'de': 'Kinderwagen & Kindersitze'},
          items: [
            SubcategoryItem(name: {'pl': 'Wózki 2w1 i 3w1', 'en': '2in1 / 3in1 Strollers & Prams', 'de': 'Kombi-Kinderwagen 2-in-1 / 3-in-1'}, query: 'wózek'),
            SubcategoryItem(name: {'pl': 'Wózki spacerowe / spacerówki', 'en': 'Pushchairs & Buggies', 'de': 'Buggys & Sportwagen'}, query: 'spacerówka'),
            SubcategoryItem(name: {'pl': 'Foteliki samochodowe (Isofix)', 'en': 'Car Seats (Isofix)', 'de': 'Kindersitze (Isofix)'}, query: 'fotelik'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Pokój dziecięcy', 'en': 'Nursery & Kids Room', 'de': 'Kinderzimmer'},
          items: [
            SubcategoryItem(name: {'pl': 'Łóżeczka dziecięce i kołyski', 'en': 'Cots, Cribs & Cradles', 'de': 'Kinderbetten & Wiegen'}, query: 'łóżeczko'),
            SubcategoryItem(name: {'pl': 'Krzesełka do karmienia', 'en': 'High Chairs', 'de': 'Hochstühle'}, query: 'krzesełko'),
            SubcategoryItem(name: {'pl': 'Przewijaki i wanienki', 'en': 'Changing Tables & Baby Baths', 'de': 'Wickeltische & Babywannen'}, query: 'przewijak'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Zabawki i gry', 'en': 'Toys & Games', 'de': 'Spielzeug & Spiele'},
          items: [
            SubcategoryItem(name: {'pl': 'Klocki LEGO i konstrukcyjne', 'en': 'LEGO & Building Blocks', 'de': 'LEGO & Bausteine'}, query: 'LEGO'),
            SubcategoryItem(name: {'pl': 'Lalki, domki i maskotki', 'en': 'Dolls, Dollhouses & Plushies', 'de': 'Puppen, Puppenhäuser & Plüschtiere'}, query: 'lalka'),
            SubcategoryItem(name: {'pl': 'Samochody i pojazdy na akumulator', 'en': 'Electric Ride-on Cars & Vehicles', 'de': 'Elektro-Kinderautos & Fahrzeuge'}, query: 'na akumulator'),
            SubcategoryItem(name: {'pl': 'Gry planszowe i edukacyjne', 'en': 'Board Games & Educational Toys', 'de': 'Brettspiele & Lernspielzeug'}, query: 'planszówka'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Ubranka i buciki', 'en': 'Baby Clothes & Shoes', 'de': 'Babybekleidung & Schuhe'},
          items: [
            SubcategoryItem(name: {'pl': 'Pakiety ubranek dla niemowląt', 'en': 'Baby Clothing Bundles', 'de': 'Babykleidung-Pakete'}, query: 'ubranka'),
            SubcategoryItem(name: {'pl': 'Kombinezony i kurtki dziecięce', 'en': 'Kids Snowsuits & Jackets', 'de': 'Kinder-Schneeanzüge & Jacken'}, query: 'kombinezon'),
            SubcategoryItem(name: {'pl': 'Buciki i kapcie', 'en': 'Kids Shoes & Slippers', 'de': 'Kinderschuhe & Hausschuhe'}, query: 'buty dziecięce'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['LEGO', 'Wózek 3w1', 'Cybex', 'Fotelik Isofix', 'Łóżeczko', 'Auto na akumulator', 'Rowerek biegowy'],
        'en': ['LEGO', 'Stroller', 'Cybex', 'Car Seat', 'Crib', 'Kids Bike', 'Toys'],
        'de': ['LEGO', 'Kinderwagen', 'Cybex', 'Kindersitz', 'Babybett', 'Kinderfahrrad', 'Spielzeug'],
      },
    ),

    'sports-hobbies': CategoryDetail(
      slug: 'sports-hobbies',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Rowery i hulajnogi', 'en': 'Bikes & Scooters', 'de': 'Fahrräder & Roller'},
          items: [
            SubcategoryItem(name: {'pl': 'Rowery górskie (MTB)', 'en': 'Mountain Bikes (MTB)', 'de': 'Mountainbikes (MTB)'}, query: 'rower MTB'),
            SubcategoryItem(name: {'pl': 'Rowery szosowe i gravel', 'en': 'Road & Gravel Bikes', 'de': 'Rennräder & Gravelbikes'}, query: 'gravel'),
            SubcategoryItem(name: {'pl': 'Rowery elektryczne (e-bike)', 'en': 'Electric Bikes (E-Bikes)', 'de': 'E-Bikes & Pedelecs'}, query: 'rower elektryczny'),
            SubcategoryItem(name: {'pl': 'Hulajnogi elektryczne i wyczynowe', 'en': 'E-Scooters & Stunt Scooters', 'de': 'E-Scooter & Stunt-Roller'}, query: 'hulajnoga elektryczna'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Siłownia i fitness', 'en': 'Gym & Fitness', 'de': 'Fitness & Kraftsport'},
          items: [
            SubcategoryItem(name: {'pl': 'Hantle, gryfy i obciążenia', 'en': 'Dumbbells, Bars & Weights', 'de': 'Hanteln, Stangen & Gewichte'}, query: 'hantle'),
            SubcategoryItem(name: {'pl': 'Bieżnie i rowerki treningowe', 'en': 'Treadmills & Exercise Bikes', 'de': 'Laufbänder & Ergometer'}, query: 'bieżnia'),
            SubcategoryItem(name: {'pl': 'Ławki i atlasy do ćwiczeń', 'en': 'Weight Benches & Multigyms', 'de': 'Hantelbänke & Kraftstationen'}, query: 'ławka do ćwiczeń'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Wędkarstwo i myślistwo', 'en': 'Fishing & Hunting', 'de': 'Angeln & Jagd'},
          items: [
            SubcategoryItem(name: {'pl': 'Wędki, kołowrotki i zestawy', 'en': 'Fishing Rods, Reels & Sets', 'de': 'Angelruten, Rollen & Sets'}, query: 'wędka'),
            SubcategoryItem(name: {'pl': 'Łodzie i pontony wędkarskie', 'en': 'Fishing Boats & Inflatables', 'de': 'Angelboote & Schlauchboote'}, query: 'ponton'),
            SubcategoryItem(name: {'pl': 'Namioty i fotele wędkarskie', 'en': 'Fishing Chairs & Bivvies', 'de': 'Angelstühle & Zelte'}, query: 'fotel wędkarski'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Turystyka i sporty wodne', 'en': 'Outdoor & Water Sports', 'de': 'Outdoor & Wassersport'},
          items: [
            SubcategoryItem(name: {'pl': 'Deski SUP, kajaki i żeglarstwo', 'en': 'SUP Boards, Kayaks & Sailing', 'de': 'SUP-Boards, Kajaks & Segeln'}, query: 'deska SUP'),
            SubcategoryItem(name: {'pl': 'Namioty, śpiwory i plecaki', 'en': 'Tents, Sleeping Bags & Backpacks', 'de': 'Zelte, Schlafsäcke & Rucksäcke'}, query: 'namiot'),
            SubcategoryItem(name: {'pl': 'Narty, snowboard i łyżwy', 'en': 'Skis, Snowboards & Ice Skates', 'de': 'Ski, Snowboards & Schlittschuhe'}, query: 'narty'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Rower elektryczny', 'Gravel', 'Hantle', 'Deska SUP', 'Bieżnia', 'Wędka karpiowa', 'KROSS', 'Trek'],
        'en': ['E-Bike', 'Gravel Bike', 'SUP Board', 'Treadmill', 'Dumbbells', 'Fishing Rod', 'Trek'],
        'de': ['E-Bike', 'Gravelbike', 'SUP Board', 'Laufband', 'Hanteln', 'Angelrute', 'Trek', 'Cube'],
      },
    ),

    'services': CategoryDetail(
      slug: 'services',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Remonty i budownictwo', 'en': 'Renovation & Construction', 'de': 'Renovierung & Bau'},
          items: [
            SubcategoryItem(name: {'pl': 'Wykończenia wnętrz i malowanie', 'en': 'Interior Finishing & Painting', 'de': 'Innenausbau & Malerarbeiten'}, query: 'remont'),
            SubcategoryItem(name: {'pl': 'Układanie płytek i glazurnictwo', 'en': 'Tiling & Floor Laying', 'de': 'Fliesenlegen & Bodenbeläge'}, query: 'glazurnik'),
            SubcategoryItem(name: {'pl': 'Instalacje elektryczne i hydraulika', 'en': 'Electrical & Plumbing Services', 'de': 'Elektro- & Sanitärinstallationen'}, query: 'elektryk'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Transport i przeprowadzki', 'en': 'Moving & Transport', 'de': 'Umzüge & Transport'},
          items: [
            SubcategoryItem(name: {'pl': 'Przeprowadzki mieszkań i firm', 'en': 'Home & Office Moving', 'de': 'Wohnungs- & Firmenumzüge'}, query: 'przeprowadzki'),
            SubcategoryItem(name: {'pl': 'Transport busem i bagażówka', 'en': 'Van Delivery & Courier Services', 'de': 'Kleintransporte & Kurierdienste'}, query: 'transport busem'),
            SubcategoryItem(name: {'pl': 'Autolaweta i pomoc drogowa 24/7', 'en': 'Towing & Roadside Assistance 24/7', 'de': 'Abschleppdienst & Pannenhilfe 24/7'}, query: 'laweta'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Mechanika i naprawa', 'en': 'Auto Repair & Mechanics', 'de': 'Autoreparatur & Werkstatt'},
          items: [
            SubcategoryItem(name: {'pl': 'Mechanika samochodowa i wulkanizacja', 'en': 'Car Mechanics & Tire Service', 'de': 'Kfz-Mechanik & Reifenservice'}, query: 'mechanik samochodowy'),
            SubcategoryItem(name: {'pl': 'Naprawa AGD i sprzętu RTV', 'en': 'Home Appliance & Electronics Repair', 'de': 'Haushaltsgeräte- & Elektronikreparatur'}, query: 'naprawa AGD'),
            SubcategoryItem(name: {'pl': 'Serwis komputerów i telefonów', 'en': 'PC, Laptop & Smartphone Repair', 'de': 'PC-, Laptop- & Smartphone-Reparatur'}, query: 'serwis telefonów'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Uroda, sprzątanie i ogród', 'en': 'Cleaning, Beauty & Garden', 'de': 'Reinigung, Beauty & Garten'},
          items: [
            SubcategoryItem(name: {'pl': 'Sprzątanie domów i biur', 'en': 'House & Office Cleaning', 'de': 'Haus- & Büroreinigung'}, query: 'sprzątanie'),
            SubcategoryItem(name: {'pl': 'Pielęgnacja ogrodów i wycinka drzew', 'en': 'Garden Care & Tree Removal', 'de': 'Gartenpflege & Baumfällung'}, query: 'pielęgnacja ogrodu'),
            SubcategoryItem(name: {'pl': 'Fryzjer, kosmetyczka i masaż', 'en': 'Hairdresser, Cosmetology & Massage', 'de': 'Friseur, Kosmetik & Massage'}, query: 'masaż'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Remonty mieszkań', 'Przeprowadzki', 'Laweta 24h', 'Elektryk', 'Hydraulik', 'Sprzątanie', 'Naprawa pralki'],
        'en': ['Moving Service', 'Plumber', 'Electrician', 'Car Towing', 'Cleaning', 'Painting'],
        'de': ['Umzug', 'Malerarbeiten', 'Elektriker', 'Klempner', 'Abschleppdienst', 'Reinigung'],
      },
    ),

    'antiques-collectibles': CategoryDetail(
      slug: 'antiques-collectibles',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Numizmatyka i banknoty', 'en': 'Coins & Banknotes', 'de': 'Münzen & Banknoten'},
          items: [
            SubcategoryItem(name: {'pl': 'Monety polskie i zagraniczne', 'en': 'Domestic & Foreign Coins', 'de': 'In- & Ausländische Münzen'}, query: 'monety'),
            SubcategoryItem(name: {'pl': 'Monety srebrne i złote', 'en': 'Silver & Gold Coins', 'de': 'Silber- & Goldmünzen'}, query: 'srebrne monety'),
            SubcategoryItem(name: {'pl': 'Banknoty i walory kolekcjonerskie', 'en': 'Banknotes & Paper Money', 'de': 'Banknoten & Papiergeld'}, query: 'banknoty'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Militaria i odznaczenia', 'en': 'Militaria & Medals', 'de': 'Militaria & Orden'},
          items: [
            SubcategoryItem(name: {'pl': 'Bagnety, szable i biała broń', 'en': 'Bayonets, Swords & Blades', 'de': 'Bajonette, Säbel & Blankwaffen'}, query: 'szabla'),
            SubcategoryItem(name: {'pl': 'Medale, ordery i odznaki', 'en': 'Medals, Orders & Badges', 'de': 'Medaillen, Orden & Abzeichen'}, query: 'medale'),
            SubcategoryItem(name: {'pl': 'Mundury i hełmy', 'en': 'Uniforms & Helmets', 'de': 'Uniformen & Helme'}, query: 'hełm'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Meble i zegary antyczne', 'en': 'Antique Furniture & Clocks', 'de': 'Antike Möbel & Uhren'},
          items: [
            SubcategoryItem(name: {'pl': 'Meble zabytkowe (secesja, biedermeier)', 'en': 'Antique Furniture (Art Nouveau, Biedermeier)', 'de': 'Antikmöbel (Jugendstil, Biedermeier)'}, query: 'meble antyczne'),
            SubcategoryItem(name: {'pl': 'Zegary stojące, ścienne i kominkowe', 'en': 'Grandfather, Wall & Mantel Clocks', 'de': 'Stand-, Wand- & Kaminuhren'}, query: 'zegar ścienny'),
            SubcategoryItem(name: {'pl': 'Gramofony i patefony', 'en': 'Gramophones & Phonographs', 'de': 'Grammophone & Phonographen'}, query: 'gramofon'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Sztuka i pamiątki PRL', 'en': 'Art & Vintage Items', 'de': 'Kunst & Vintage'},
          items: [
            SubcategoryItem(name: {'pl': 'Obrazy olejne i grafiki', 'en': 'Oil Paintings & Prints', 'de': 'Ölgemälde & Grafiken'}, query: 'obraz olejny'),
            SubcategoryItem(name: {'pl': 'Porcelana, szkło i kryształy', 'en': 'Porcelain, Glass & Crystal', 'de': 'Porzellan, Glas & Kristall'}, query: 'porcelana'),
            SubcategoryItem(name: {'pl': 'Pamiątki z okresu PRL', 'en': 'Vintage & Retro Collectibles', 'de': 'Vintage- & Retro-Sammlerstücke'}, query: 'PRL'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Monety srebrne', 'PRL', 'Zegar wiszący', 'Porcelana Ćmielów', 'Szabla', 'Militaria', 'Obraz olejny'],
        'en': ['Silver Coins', 'Vintage', 'Antique Clock', 'Porcelain', 'Oil Painting', 'Medals'],
        'de': ['Silbermünzen', 'Goldmünzen', 'Antike Uhr', 'Porzellan', 'Ölgemälde', 'Militaria', 'Vintage'],
      },
    ),

    'health-beauty': CategoryDetail(
      slug: 'health-beauty',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Perfumy i zapachy', 'en': 'Perfumes & Fragrances', 'de': 'Parfums & Düfte'},
          items: [
            SubcategoryItem(name: {'pl': 'Perfumy damskie', 'en': 'Women\'s Perfumes', 'de': 'Damenparfums'}, query: 'perfumy damskie'),
            SubcategoryItem(name: {'pl': 'Perfumy męskie', 'en': 'Men\'s Perfumes', 'de': 'Herrenparfums'}, query: 'perfumy męskie'),
            SubcategoryItem(name: {'pl': 'Perfumy niszowe i próbki', 'en': 'Niche Perfumes & Decants', 'de': 'Nischendüfte & Proben'}, query: 'perfumy niszowe'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Pielęgnacja i makijaż', 'en': 'Skincare & Makeup', 'de': 'Hautpflege & Make-up'},
          items: [
            SubcategoryItem(name: {'pl': 'Kremy, sera i maseczki', 'en': 'Face Creams, Serums & Masks', 'de': 'Gesichtscremes, Seren & Masken'}, query: 'krem do twarzy'),
            SubcategoryItem(name: {'pl': 'Kosmetyki do makijażu', 'en': 'Makeup & Palettes', 'de': 'Make-up & Paletten'}, query: 'makijaż'),
            SubcategoryItem(name: {'pl': 'Pielęgnacja włosów i szampony', 'en': 'Haircare & Shampoos', 'de': 'Haarpflege & Shampoos'}, query: 'szampon'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Sprzęt kosmetyczny i fryzjerski', 'en': 'Beauty & Hair Devices', 'de': 'Beauty-Geräte'},
          items: [
            SubcategoryItem(name: {'pl': 'Suszarki, prostownice i lokówki', 'en': 'Hair Dryers, Straighteners & Curlers', 'de': 'Haartrockner, Glätteisen & Lockenstäbe'}, query: 'prostownica'),
            SubcategoryItem(name: {'pl': 'Depilatory laserowe i IPL', 'en': 'Laser & IPL Hair Removers', 'de': 'Laser- & IPL-Haarentferner'}, query: 'depilator'),
            SubcategoryItem(name: {'pl': 'Lampy UV/LED do paznokci', 'en': 'UV/LED Nail Lamps', 'de': 'UV/LED-Nagellampen'}, query: 'lampa UV'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Zdrowie i masaż', 'en': 'Health & Wellness', 'de': 'Gesundheit & Massage'},
          items: [
            SubcategoryItem(name: {'pl': 'Masażery i pistolety do masażu', 'en': 'Massagers & Massage Guns', 'de': 'Massagegeräte & Massagepistolen'}, query: 'masażer'),
            SubcategoryItem(name: {'pl': 'Ciśnieniomierze i inhalatory', 'en': 'Blood Pressure Monitors & Inhalers', 'de': 'Blutdruckmessgeräte & Inhalatoren'}, query: 'ciśnieniomierz'),
            SubcategoryItem(name: {'pl': 'Suplementy diety i witaminy', 'en': 'Dietary Supplements & Vitamins', 'de': 'Nahrungsergänzungsmittel & Vitamine'}, query: 'witaminy'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Dior', 'Chanel', 'Dyson Airwrap', 'Pistolet do masażu', 'Depilator IPL', 'Perfumy', 'Lampa do paznokci'],
        'en': ['Chanel', 'Dior', 'Dyson', 'Massage Gun', 'IPL', 'Skincare', 'Perfume'],
        'de': ['Chanel', 'Dior', 'Dyson', 'Massagepistole', 'IPL', 'Parfum', 'Hautpflege'],
      },
    ),

    'music-education': CategoryDetail(
      slug: 'music-education',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Instrumenty muzyczne', 'en': 'Musical Instruments', 'de': 'Musikinstrumente'},
          items: [
            SubcategoryItem(name: {'pl': 'Gitary (akustyczne, elektryczne, basowe)', 'en': 'Guitars (Acoustic, Electric, Bass)', 'de': 'Gitarren (Akustik, E-Gitarre, Bass)'}, query: 'gitara'),
            SubcategoryItem(name: {'pl': 'Pianina, fortepiany i keyboardy', 'en': 'Pianos, Keyboards & Synthesizers', 'de': 'Klaviere, Keyboards & Synthesizer'}, query: 'pianino'),
            SubcategoryItem(name: {'pl': 'Perkusje i talerze', 'en': 'Drums & Cymbals', 'de': 'Schlagzeuge & Becken'}, query: 'perkusja'),
            SubcategoryItem(name: {'pl': 'Skrzypce, saksofony i dęte', 'en': 'Violins, Saxophones & Wind Instruments', 'de': 'Geigen, Saxophone & Blasinstrumente'}, query: 'skrzypce'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Sprzęt studyjny i DJ', 'en': 'Studio & DJ Gear', 'de': 'Studio- & DJ-Equipment'},
          items: [
            SubcategoryItem(name: {'pl': 'Mikrofony studyjne i estradowe', 'en': 'Studio & Stage Microphones', 'de': 'Studio- & Bühnenmikrofone'}, query: 'mikrofon'),
            SubcategoryItem(name: {'pl': 'Karty dźwiękowe i interfejsy', 'en': 'Audio Interfaces & Sound Cards', 'de': 'Audio-Interfaces & Soundkarten'}, query: 'interfejs audio'),
            SubcategoryItem(name: {'pl': 'Kontrolery DJ i miksery', 'en': 'DJ Controllers & Mixers', 'de': 'DJ-Controller & Mischpulte'}, query: 'kontroler DJ'),
            SubcategoryItem(name: {'pl': 'Wzmacniacze i kolumny estradowe', 'en': 'Amplifiers & PA Speakers', 'de': 'Verstärker & PA-Lautsprecher'}, query: 'wzmacniacz'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Płyty i muzyka', 'en': 'Vinyl & Music Media', 'de': 'Vinyl & Tonträger'},
          items: [
            SubcategoryItem(name: {'pl': 'Płyty winylowe', 'en': 'Vinyl Records', 'de': 'Schallplatten (Vinyl)'}, query: 'winyl'),
            SubcategoryItem(name: {'pl': 'Płyty CD i kasety magnetofonowe', 'en': 'CDs & Cassette Tapes', 'de': 'CDs & Musikkassetten'}, query: 'płyta CD'),
            SubcategoryItem(name: {'pl': 'Nuty, śpiewniki i podręczniki', 'en': 'Sheet Music & Songbooks', 'de': 'Noten & Liederbücher'}, query: 'nuty'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Korepetycje i kursy', 'en': 'Lessons & Courses', 'de': 'Unterricht & Kurse'},
          items: [
            SubcategoryItem(name: {'pl': 'Lekcje gry na instrumentach', 'en': 'Music Instrument Lessons', 'de': 'Instrumentalunterricht'}, query: 'nauka gry'),
            SubcategoryItem(name: {'pl': 'Lekcje śpiewu i emisji głosu', 'en': 'Vocal Lessons & Voice Training', 'de': 'Gesangsunterricht & Stimmtraining'}, query: 'lekcje śpiewu'),
            SubcategoryItem(name: {'pl': 'Kursy językowe i korepetycje', 'en': 'Language Courses & Tutoring', 'de': 'Sprachkurse & Nachhilfe'}, query: 'korepetycje angielski'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Gitara klasyczna', 'Pianino cyfrowe', 'Yamaha', 'Fender', 'Płyty winylowe', 'Mikrofon Shure', 'Pioneer DJ'],
        'en': ['Fender Guitar', 'Yamaha Piano', 'Vinyl Records', 'DJ Controller', 'Microphone', 'Drum Kit'],
        'de': ['E-Gitarre', 'Klavier', 'Yamaha', 'Fender', 'Schallplatten', 'DJ-Controller', 'Mikrofon'],
      },
    ),

    'accommodations-stays': CategoryDetail(
      slug: 'accommodations-stays',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Noclegi nad morzem i w górach', 'en': 'Coast & Mountains', 'de': 'Küste & Berge'},
          items: [
            SubcategoryItem(name: {'pl': 'Domki całoroczne i letniskowe', 'en': 'Holiday Cottages & Cabins', 'de': 'Ferienhäuser & Hütten'}, query: 'domek'),
            SubcategoryItem(name: {'pl': 'Apartamenty wakacyjne', 'en': 'Holiday Apartments', 'de': 'Ferienwohnungen'}, query: 'apartament wakacyjny'),
            SubcategoryItem(name: {'pl': 'Pokoje gościnne i kwatery', 'en': 'Guest Rooms & B&Bs', 'de': 'Gästezimmer & Pensionen'}, query: 'pokoje gościnne'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Hotele i agroturystyka', 'en': 'Hotels & Agritourism', 'de': 'Hotels & Bauernhofurlaub'},
          items: [
            SubcategoryItem(name: {'pl': 'Gospodarstwa agroturystyczne', 'en': 'Agritourism Farms', 'de': 'Bauernhöfe & Landurlaub'}, query: 'agroturystyka'),
            SubcategoryItem(name: {'pl': 'Pensjonaty i wille', 'en': 'Guesthouses & Villas', 'de': 'Pensionen & Villen'}, query: 'pensjonat'),
            SubcategoryItem(name: {'pl': 'Kempingi, glamping i pola namiotowe', 'en': 'Campsites, Glamping & Tent Pitches', 'de': 'Camping, Glamping & Zeltplätze'}, query: 'glamping'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Popularne regiony', 'en': 'Popular Destinations', 'de': 'Beliebte Regionen'},
          items: [
            SubcategoryItem(name: {'pl': 'Zakopane i Tatry', 'en': 'Zakopane & Tatra Mountains', 'de': 'Zakopane & Hohe Tatra'}, query: 'Zakopane'),
            SubcategoryItem(name: {'pl': 'Władysławowo, Łeba, Hel', 'en': 'Baltic Coast (Hel, Łeba)', 'de': 'Ostseeküste (Hel, Leba)'}, query: 'morze'),
            SubcategoryItem(name: {'pl': 'Mazury i Kraina Jezior', 'en': 'Masurian Lake District', 'de': 'Masuren & Seenplatte'}, query: 'Mazury'),
            SubcategoryItem(name: {'pl': 'Bieszczady i Karkonosze', 'en': 'Bieszczady & Giant Mountains', 'de': 'Bieszczady & Riesengebirge'}, query: 'Bieszczady'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Domek z bali', 'Zakopane', 'Apartament nad morzem', 'Mazury', 'Glamping z jacuzzi', 'Bieszczady', 'Agroturystyka'],
        'en': ['Cabin with Jacuzzi', 'Sea View Apartment', 'Mountain Chalet', 'Glamping', 'Lake Cottage'],
        'de': ['Ferienhaus', 'Ferienwohnung', 'Ostsee', 'Berghütte', 'Glamping', 'Bauernhof'],
      },
    ),

    'rentals-hire': CategoryDetail(
      slug: 'rentals-hire',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Wynajem sprzętu budowlanego', 'en': 'Construction Equipment Hire', 'de': 'Baumaschinenverleih'},
          items: [
            SubcategoryItem(name: {'pl': 'Minikoparki i ładowarki', 'en': 'Mini Excavators & Loaders', 'de': 'Minibagger & Radlader'}, query: 'wynajem minikoparki'),
            SubcategoryItem(name: {'pl': 'Zagęszczarki i skoczki', 'en': 'Compactors & Tampers', 'de': 'Rüttelplatten & Stampfer'}, query: 'wynajem zagęszczarki'),
            SubcategoryItem(name: {'pl': 'Rusztowania i podnośniki koszowe', 'en': 'Scaffolding & Cherry Pickers', 'de': 'Gerüste & Hebebühnen'}, query: 'wynajem rusztowań'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Wypożyczalnia aut i przyczep', 'en': 'Vehicles & Trailers', 'de': 'Fahrzeug- & Anhängerverleih'},
          items: [
            SubcategoryItem(name: {'pl': 'Auta osobowe i sportowe', 'en': 'Passenger & Sports Cars', 'de': 'Pkw & Sportwagen'}, query: 'wynajem aut'),
            SubcategoryItem(name: {'pl': 'Busy dostawcze i 9-osobowe', 'en': 'Delivery Vans & 9-Seaters', 'de': 'Lieferwagen & 9-Sitzer-Busse'}, query: 'wynajem busa'),
            SubcategoryItem(name: {'pl': 'Przyczepy i lawety', 'en': 'Trailers & Car Transporters', 'de': 'Anhänger & Autotransporter'}, query: 'wypożyczalnia przyczep'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Imprezy i eventy', 'en': 'Party & Events', 'de': 'Eventausstattung'},
          items: [
            SubcategoryItem(name: {'pl': 'Namioty bankietowe i hale', 'en': 'Party Tents & Pavilions', 'de': 'Festzelte & Pavillons'}, query: 'namioty imprezowe'),
            SubcategoryItem(name: {'pl': 'Dmuchance i atrakcje dla dzieci', 'en': 'Bouncy Castles & Kids Attractions', 'de': 'Hüpfburgen & Kinderattraktionen'}, query: 'dmuchańce'),
            SubcategoryItem(name: {'pl': 'Nagłośnienie i oświetlenie sceniczne', 'en': 'Sound Systems & Stage Lighting', 'de': 'Tontechnik & Bühnenbeleuchtung'}, query: 'nagłośnienie'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Wynajem minikoparki', 'Wypożyczalnia busów', 'Dmuchańce na urodziny', 'Wynajem lawety', 'Podnośnik koszowy'],
        'en': ['Mini Excavator Hire', 'Van Rental', 'Bouncy Castle Hire', 'Trailer Rental'],
        'de': ['Minibagger mieten', 'Transporter mieten', 'Hüpfburg mieten', 'Anhänger mieten'],
      },
    ),

    'free-stuff': CategoryDetail(
      slug: 'free-stuff',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Oddam za darmo', 'en': 'Free Giveaways', 'de': 'Zu verschenken'},
          items: [
            SubcategoryItem(name: {'pl': 'Meble i wyposażenie za darmo', 'en': 'Free Furniture & Home Goods', 'de': 'Kostenlose Möbel & Einrichtung'}, query: 'oddam meble'),
            SubcategoryItem(name: {'pl': 'AGD i elektronika za darmo', 'en': 'Free Appliances & Electronics', 'de': 'Kostenlose Haushaltsgeräte & Elektronik'}, query: 'oddam AGD'),
            SubcategoryItem(name: {'pl': 'Ubrania i artykuły dziecięce', 'en': 'Free Clothes & Baby Items', 'de': 'Kostenlose Kleidung & Babyartikel'}, query: 'oddam ubrania'),
            SubcategoryItem(name: {'pl': 'Materiały budowlane i gruz', 'en': 'Free Building Materials & Rubble', 'de': 'Kostenloses Baumaterial & Bauschutt'}, query: 'oddam za darmo'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Zwierzęta do adopcji', 'en': 'Pets for Adoption', 'de': 'Tiere zur Adoption'},
          items: [
            SubcategoryItem(name: {'pl': 'Pieski i szczeniaki do adopcji', 'en': 'Dogs & Puppies for Adoption', 'de': 'Hunde & Welpen zur Adoption'}, query: 'oddam psa'),
            SubcategoryItem(name: {'pl': 'Kocięta szukające domu', 'en': 'Kittens for Adoption', 'de': 'Katzen & Kätzchen zur Adoption'}, query: 'oddam kota'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Oddam meble', 'Oddam za darmo', 'Do odebrania', 'Sofa za darmo', 'Adopcja psa', 'Gruz za darmo'],
        'en': ['Free Furniture', 'Free Pickup', 'Free Dog', 'Free Clothes', 'Giveaway'],
        'de': ['Zu verschenken', 'Möbel gratis', 'Hund adoptieren', 'Selbstabholer', 'Kostenlos'],
      },
    ),

    'delivery-deals': CategoryDetail(
      slug: 'delivery-deals',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Kategorie z szybką wysyłką', 'en': 'Fast Shipping Deals', 'de': 'Schneller Versand'},
          items: [
            SubcategoryItem(name: {'pl': 'Elektronika z wysyłką paczkomatem', 'en': 'Electronics with Locker Delivery', 'de': 'Elektronik mit Paketstation-Versand'}, query: 'wysyłka paczkomat'),
            SubcategoryItem(name: {'pl': 'Moda i obuwie z dostawą', 'en': 'Fashion & Shoes with Delivery', 'de': 'Mode & Schuhe mit Lieferung'}, query: 'z dostawą'),
            SubcategoryItem(name: {'pl': 'Książki, gry i drobiazgi', 'en': 'Books, Games & Small Items', 'de': 'Bücher, Spiele & Medien'}, query: 'wysyłka'),
            SubcategoryItem(name: {'pl': 'Części samochodowe kurierem', 'en': 'Auto Parts by Courier', 'de': 'Autoteile per Kurier'}, query: 'kurier'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Paczkomat', 'Wysyłka OLX/InPost', 'Darmowa dostawa', 'Kurier DPD', 'Wysyłka w 24h'],
        'en': ['Parcel Locker', 'Free Delivery', 'Express Shipping', 'Same-Day Dispatch'],
        'de': ['Kostenloser Versand', 'Expressversand', 'Paketstation', '24h Versand'],
      },
    ),

    'books-textbooks': CategoryDetail(
      slug: 'books-textbooks',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Podręczniki i nauka', 'en': 'Textbooks & Education', 'de': 'Schulbücher & Lernen'},
          items: [
            SubcategoryItem(name: {'pl': 'Podręczniki do liceum i technikum', 'en': 'High School & Technical College Textbooks', 'de': 'Gymnasium- & Berufsschulbücher'}, query: 'podręczniki liceum'),
            SubcategoryItem(name: {'pl': 'Podręczniki do szkoły podstawowej', 'en': 'Primary School Textbooks', 'de': 'Grundschulbücher'}, query: 'podręczniki podstawówka'),
            SubcategoryItem(name: {'pl': 'Książki akademickie i medyczne', 'en': 'University & Medical Books', 'de': 'Universitäts- & Medizinbücher'}, query: 'podręcznik akademicki'),
            SubcategoryItem(name: {'pl': 'Słowniki i nauka języków obcych', 'en': 'Dictionaries & Language Learning', 'de': 'Wörterbücher & Sprachkurse'}, query: 'język angielski'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Literatura i komiksy', 'en': 'Fiction & Comics', 'de': 'Literatur & Comics'},
          items: [
            SubcategoryItem(name: {'pl': 'Kryminały, thrillery i sensacja', 'en': 'Thrillers, Crime & Mystery', 'de': 'Krimis & Thriller'}, query: 'kryminał'),
            SubcategoryItem(name: {'pl': 'Fantastyka, Sci-Fi i horror', 'en': 'Fantasy, Sci-Fi & Horror', 'de': 'Fantasy, Sci-Fi & Horror'}, query: 'fantasy'),
            SubcategoryItem(name: {'pl': 'Komiksy, manga i powieści graficzne', 'en': 'Comics, Manga & Graphic Novels', 'de': 'Comics, Manga & Graphic Novels'}, query: 'manga'),
            SubcategoryItem(name: {'pl': 'Literatura faktu, biografie i historia', 'en': 'Non-Fiction, Biographies & History', 'de': 'Sachbücher, Biografien & Geschichte'}, query: 'biografia'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Nowa Era', 'Manga', 'Stephen King', 'Remigiusz Mróz', 'Wiedźmin', 'Podręczniki klasa 4', 'Język niemiecki'],
        'en': ['Manga', 'Stephen King', 'Textbooks', 'Harry Potter', 'Fantasy Books', 'Biographies'],
        'de': ['Manga', 'Stephen King', 'Schulbücher', 'Harry Potter', 'Krimi', 'Biografien'],
      },
    ),

    'auto-parts': CategoryDetail(
      slug: 'auto-parts',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Koła, felgi i opony', 'en': 'Wheels, Tires & Rims', 'de': 'Räder, Reifen & Felgen'},
          items: [
            SubcategoryItem(name: {'pl': 'Opony zimowe, letnie i całoroczne', 'en': 'Winter, Summer & All-Season Tires', 'de': 'Winter-, Sommer- & Ganzjahresreifen'}, query: 'opony zimowe'),
            SubcategoryItem(name: {'pl': 'Felgi aluminiowe (alufelgi) i stalowe', 'en': 'Alloy & Steel Rims', 'de': 'Alufelgen & Stahlfelgen'}, query: 'alufelgi'),
            SubcategoryItem(name: {'pl': 'Koła kompletne z oponami', 'en': 'Complete Wheel Sets', 'de': 'Kompletträder'}, query: 'koła'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Karoseria i oświetlenie', 'en': 'Body & Lighting', 'de': 'Karosserie & Beleuchtung'},
          items: [
            SubcategoryItem(name: {'pl': 'Reflektory LED, lampy i ksenony', 'en': 'LED Headlights & Xenon Lamps', 'de': 'LED-Scheinwerfer & Xenon-Lampen'}, query: 'reflektor'),
            SubcategoryItem(name: {'pl': 'Zderzaki, maski, błotniki i drzwi', 'en': 'Bumpers, Hoods, Fenders & Doors', 'de': 'Stoßstangen, Hauben, Kotflügel & Türen'}, query: 'zderzak'),
            SubcategoryItem(name: {'pl': 'Lusterka, szyby i grille', 'en': 'Mirrors, Windows & Grilles', 'de': 'Spiegel, Scheiben & Kühlergrills'}, query: 'lusterko'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Mechanika i podzespoły', 'en': 'Engine & Drivetrain', 'de': 'Motor & Getriebe'},
          items: [
            SubcategoryItem(name: {'pl': 'Silniki kompletne i słupki', 'en': 'Complete Engines & Engine Blocks', 'de': 'Komplettmotoren & Motorblöcke'}, query: 'silnik'),
            SubcategoryItem(name: {'pl': 'Skrzynie biegów manualne i automatyczne', 'en': 'Manual & Automatic Gearboxes', 'de': 'Schalt- & Automatikgetriebe'}, query: 'skrzynia biegów'),
            SubcategoryItem(name: {'pl': 'Turbosprężarki i wtryskiwacze', 'en': 'Turbochargers & Fuel Injectors', 'de': 'Turbolader & Einspritzdüsen'}, query: 'turbosprężarka'),
            SubcategoryItem(name: {'pl': 'Zawieszenie, amortyzatory i hamulce', 'en': 'Suspension, Shock Absorbers & Brakes', 'de': 'Fahrwerk, Stoßdämpfer & Bremsen'}, query: 'zacisk hamulcowy'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Alufelgi 17 18 19', 'Opony 205/55R16', 'Lampy LED', 'Zderzak M Pakiet', 'Turbina', 'Hak holowniczy', 'Skrzynia DSG'],
        'en': ['Alloy Rims', 'Tires', 'LED Headlights', 'Bumper', 'Turbocharger', 'Brake Caliper'],
        'de': ['Alufelgen', 'Reifen', 'LED Scheinwerfer', 'Stoßstange', 'Turbolader', 'Bremsen'],
      },
    ),

    'machinery-parts': CategoryDetail(
      slug: 'machinery-parts',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Części do maszyn rolniczych', 'en': 'Agricultural Machinery Parts', 'de': 'Landmaschinenteile'},
          items: [
            SubcategoryItem(name: {'pl': 'Części do ciągników Ursus, Zetor, MTZ', 'en': 'Tractor Spare Parts', 'de': 'Traktoren-Ersatzteile'}, query: 'części ursus'),
            SubcategoryItem(name: {'pl': 'Lemiesze, dłuta i części do pługów', 'en': 'Plow Blades & Spares', 'de': 'Pflugschare & Verschleißteile'}, query: 'lemiesz'),
            SubcategoryItem(name: {'pl': 'Paski klinowe, łańcuchy i łożyska', 'en': 'V-Belts, Chains & Bearings', 'de': 'Keilriemen, Ketten & Lager'}),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Części do maszyn budowlanych', 'en': 'Construction Machinery Spares', 'de': 'Baumaschinenteile'},
          items: [
            SubcategoryItem(name: {'pl': 'Gąsienice gumowe i rolki', 'en': 'Rubber Tracks & Rollers', 'de': 'Gummiketten & Laufrollen'}, query: 'gąsienice'),
            SubcategoryItem(name: {'pl': 'Łyżki do koparek i szybkozłącza', 'en': 'Excavator Buckets & Quick Couplers', 'de': 'Baggerschaufeln & Schnellwechsler'}, query: 'łyżka do koparki'),
            SubcategoryItem(name: {'pl': 'Pompy hydrauliczne i siłowniki', 'en': 'Hydraulic Pumps & Cylinders', 'de': 'Hydraulikpumpen & Zylinder'}, query: 'siłownik hydrauliczny'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Łyżka do minikoparki', 'Gąsienice gumowe', 'Rozdzielacz hydrauliczny', 'Części C-360', 'Siłownik'],
        'en': ['Excavator Bucket', 'Rubber Tracks', 'Hydraulic Cylinder', 'Tractor Parts'],
        'de': ['Baggerschaufel', 'Gummiketten', 'Hydraulikzylinder', 'Traktorteile'],
      },
    ),

    'featured-employers': CategoryDetail(
      slug: 'featured-employers',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Profile pracodawców', 'en': 'Employer Profiles', 'de': 'Arbeitgeberprofile'},
          items: [
            SubcategoryItem(name: {'pl': 'Duże przedsiębiorstwa i korporacje', 'en': 'Large Enterprises & Corporations', 'de': 'Großunternehmen & Konzerne'}, query: 'pracodawca'),
            SubcategoryItem(name: {'pl': 'Agencje pracy i rekrutacji', 'en': 'Employment & Recruitment Agencies', 'de': 'Personal- & Zeitarbeitsagenturen'}, query: 'agencja pracy'),
            SubcategoryItem(name: {'pl': 'Firmy produkcyjne i logistyczne', 'en': 'Manufacturing & Logistics Companies', 'de': 'Produktions- & Logistikunternehmen'}, query: 'produkcja'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Praca od zaraz', 'Umowa o pracę', 'Benefity', 'Stabilne zatrudnienie', 'Darmowe zakwaterowanie'],
        'en': ['Full-Time', 'Immediate Start', 'Benefits', 'Accommodation Included'],
        'de': ['Sofortiger Beginn', 'Festanstellung', 'Vollzeit', 'Unterkunft inklusive'],
      },
    ),

    'auto-expo-events': CategoryDetail(
      slug: 'auto-expo-events',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Wydarzenia motoryzacyjne', 'en': 'Automotive Events', 'de': 'Motorsport & Events'},
          items: [
            SubcategoryItem(name: {'pl': 'Targi i wystawy samochodowe', 'en': 'Car Shows & Automotive Expos', 'de': 'Automessen & Ausstellungen'}, query: 'targi motoryzacyjne'),
            SubcategoryItem(name: {'pl': 'Zloty samochodów klasycznych i zabytkowych', 'en': 'Classic & Vintage Car Meets', 'de': 'Oldtimer- & Youngtimer-Treffen'}, query: 'zlot klasyków'),
            SubcategoryItem(name: {'pl': 'Zawody driftingowe, KJS i rajdy', 'en': 'Drift, Rally & Racing Events', 'de': 'Drift- & Rallye-Events'}, query: 'rajd'),
            SubcategoryItem(name: {'pl': 'Track day i imprezy torowe', 'en': 'Track Days & Circuit Events', 'de': 'Trackdays & Rennstrecken-Events'}, query: 'track day'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Targi Poznań', 'Zlot Youngtimer', 'Drift Masters', 'Bilety na targi', 'Classic Auto'],
        'en': ['Car Expo', 'Track Day', 'Classic Car Meet', 'Drift Event'],
        'de': ['Automesse', 'Trackday', 'Oldtimertreffen', 'Drift Event'],
      },
    ),

  };

  static CategoryDetail? getDetails(String slug) {
    return categoryDetails[slug];
  }
}
