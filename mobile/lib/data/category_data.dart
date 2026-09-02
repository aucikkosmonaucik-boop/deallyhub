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
            SubcategoryItem(name: {'pl': 'Smartwatche i opaski', 'en': 'Smartwatches', 'de': 'Smartwatches'}, query: 'smartwatch'),
            SubcategoryItem(name: {'pl': 'Tablety', 'en': 'Tablets', 'de': 'Tablets'}, query: 'tablet'),
            SubcategoryItem(name: {'pl': 'Akcesoria GSM i ładowarki', 'en': 'GSM Accessories & Chargers', 'de': 'Ladekabel & Zubehör'}, query: 'ładowarka'),
            SubcategoryItem(name: {'pl': 'Etui, pokrowce i szkła', 'en': 'Cases & Screen Protectors', 'de': 'Hüllen & Schutzfolien'}, query: 'etui'),
            SubcategoryItem(name: {'pl': 'Powerbanki', 'en': 'Powerbanks', 'de': 'Powerbanks'}, query: 'powerbank'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Komputery i laptopy', 'en': 'Computers & Laptops', 'de': 'Computer & Laptops'},
          items: [
            SubcategoryItem(name: {'pl': 'Laptopy', 'en': 'Laptops', 'de': 'Laptops'}, query: 'laptop'),
            SubcategoryItem(name: {'pl': 'Komputery stacjonarne', 'en': 'Desktop PCs', 'de': 'Desktop PCs'}, query: 'komputer'),
            SubcategoryItem(name: {'pl': 'Podzespoły komputerowe', 'en': 'PC Components', 'de': 'PC-Komponenten'}, query: 'karta graficzna'),
            SubcategoryItem(name: {'pl': 'Monitory', 'en': 'Monitors', 'de': 'Monitore'}, query: 'monitor'),
            SubcategoryItem(name: {'pl': 'Drukarki i skanery', 'en': 'Printers & Scanners', 'de': 'Drucker & Scanner'}, query: 'drukarka'),
            SubcategoryItem(name: {'pl': 'Dyski i pamięci', 'en': 'Storage & Drives', 'de': 'Festplatten & Speicher'}, query: 'dysk'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Telewizory i audio', 'en': 'TV & Audio', 'de': 'Fernseher & Audio'},
          items: [
            SubcategoryItem(name: {'pl': 'Telewizory Smart TV', 'en': 'Smart TVs', 'de': 'Smart TVs'}, query: 'telewizor'),
            SubcategoryItem(name: {'pl': 'Słuchawki bezprzewodowe', 'en': 'Headphones', 'de': 'Kopfhörer'}, query: 'słuchawki'),
            SubcategoryItem(name: {'pl': 'Głośniki i Soundbary', 'en': 'Speakers & Soundbars', 'de': 'Lautsprecher & Soundbars'}, query: 'głośnik'),
            SubcategoryItem(name: {'pl': 'Projektory i rzutniki', 'en': 'Projectors', 'de': 'Projektoren'}, query: 'projektor'),
            SubcategoryItem(name: {'pl': 'Kino domowe i amplitunery', 'en': 'Home Theater', 'de': 'Heimkino'}, query: 'kino domowe'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Konsole i gaming', 'en': 'Gaming & Consoles', 'de': 'Konsolen & Gaming'},
          items: [
            SubcategoryItem(name: {'pl': 'PlayStation 5 / PS4', 'en': 'PlayStation 5 / PS4', 'de': 'PlayStation 5 / PS4'}, query: 'PlayStation'),
            SubcategoryItem(name: {'pl': 'Xbox Series X/S / One', 'en': 'Xbox Series X/S', 'de': 'Xbox Series X/S'}, query: 'Xbox'),
            SubcategoryItem(name: {'pl': 'Nintendo Switch', 'en': 'Nintendo Switch', 'de': 'Nintendo Switch'}, query: 'Nintendo'),
            SubcategoryItem(name: {'pl': 'Gry na konsole i PC', 'en': 'Video Games', 'de': 'Videospiele'}, query: 'gry'),
            SubcategoryItem(name: {'pl': 'Fotele i biurka gamingowe', 'en': 'Gaming Chairs & Desks', 'de': 'Gaming-Stühle & Tische'}, query: 'gaming'),
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
            SubcategoryItem(name: {'pl': 'Auta hybrydowe i elektryczne', 'en': 'Electric & Hybrid', 'de': 'Elektro & Hybrid'}, query: 'hybryda'),
            SubcategoryItem(name: {'pl': 'Kombi i SUV', 'en': 'SUV & Estate', 'de': 'SUV & Kombi'}, query: 'SUV'),
            SubcategoryItem(name: {'pl': 'Hatchback i Sedan', 'en': 'Sedan & Hatchback', 'de': 'Limousine & Schrägheck'}, query: 'sedan'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Dostawcze i ciężarowe', 'en': 'Commercial & Trucks', 'de': 'Nutzfahrzeuge & LKW'},
          items: [
            SubcategoryItem(name: {'pl': 'Samochody dostawcze do 3.5t', 'en': 'Vans up to 3.5t', 'de': 'Transporter bis 3.5t'}, query: 'dostawczy'),
            SubcategoryItem(name: {'pl': 'Ciągniki siodłowe', 'en': 'Semi-Trucks', 'de': 'Sattelzugmaschinen'}, query: 'ciągnik'),
            SubcategoryItem(name: {'pl': 'Naczepy i przyczepy', 'en': 'Trailers', 'de': 'Anhänger & Auflieger'}, query: 'przyczepa'),
            SubcategoryItem(name: {'pl': 'Autobusy i busy', 'en': 'Buses & Minibuses', 'de': 'Busse'}, query: 'bus'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Jednoślady i rekreacja', 'en': 'Motorcycles & Quads', 'de': 'Motorräder & Quads'},
          items: [
            SubcategoryItem(name: {'pl': 'Motocykle szosowe i turystyczne', 'en': 'Motorcycles', 'de': 'Motorräder'}, query: 'motocykl'),
            SubcategoryItem(name: {'pl': 'Skutery i motorowery', 'en': 'Scooters', 'de': 'Roller & Mopeds'}, query: 'skuter'),
            SubcategoryItem(name: {'pl': 'Quady i ATV', 'en': 'Quads & ATVs', 'de': 'Quads & ATVs'}, query: 'quad'),
            SubcategoryItem(name: {'pl': 'Cross i Enduro', 'en': 'Cross & Enduro', 'de': 'Cross & Enduro'}, query: 'cross'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Części i wyposażenie', 'en': 'Parts & Accessories', 'de': 'Teile & Zubehör'},
          items: [
            SubcategoryItem(name: {'pl': 'Opony i felgi', 'en': 'Tires & Rims', 'de': 'Reifen & Felgen'}, query: 'opony'),
            SubcategoryItem(name: {'pl': 'Części karoserii', 'en': 'Body Parts', 'de': 'Karosserieteile'}, query: 'zderzak'),
            SubcategoryItem(name: {'pl': 'Silniki i osprzęt', 'en': 'Engines & Parts', 'de': 'Motoren & Teile'}, query: 'silnik'),
            SubcategoryItem(name: {'pl': 'Oleje i chemia', 'en': 'Oils & Car Care', 'de': 'Öle & Pflege'}, query: 'olej'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz', 'Toyota', 'Ford', 'Skoda', 'Volvo'],
        'en': ['BMW', 'Audi', 'Mercedes-Benz', 'Toyota', 'Ford', 'Volkswagen', 'Tesla', 'Porsche'],
        'de': ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Opel', 'Ford'],
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
            SubcategoryItem(name: {'pl': 'Kawalerki i 1-pokojowe', 'en': 'Studio Apartments', 'de': '1-Zimmer-Wohnungen'}, query: 'kawalerka'),
            SubcategoryItem(name: {'pl': 'Apartamenty i lofty', 'en': 'Luxury Lofts', 'de': 'Lofts & Penthouses'}, query: 'apartament'),
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
            SubcategoryItem(name: {'pl': 'Działki rekreacyjne / ROD', 'en': 'Recreation Plots', 'de': 'Freizeitgrundstücke'}, query: 'działka rekreacyjna'),
            SubcategoryItem(name: {'pl': 'Grunty rolne i leśne', 'en': 'Agricultural Land', 'de': 'Land- & Forstwirtschaft'}, query: 'rolna'),
            SubcategoryItem(name: {'pl': 'Działki inwestycyjne', 'en': 'Commercial Plots', 'de': 'Gewerbegrundstücke'}, query: 'inwestycyjna'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Lokale i komercyjne', 'en': 'Commercial Properties', 'de': 'Gewerbeimmobilien'},
          items: [
            SubcategoryItem(name: {'pl': 'Lokale użytkowe i sklepy', 'en': 'Retail & Shops', 'de': 'Ladenflächen'}, query: 'lokal'),
            SubcategoryItem(name: {'pl': 'Biura i gabinety', 'en': 'Offices', 'de': 'Büros & Praxen'}, query: 'biuro'),
            SubcategoryItem(name: {'pl': 'Magazyny i hale', 'en': 'Warehouses', 'de': 'Lager & Hallen'}, query: 'magazyn'),
            SubcategoryItem(name: {'pl': 'Garaże i miejsca postojowe', 'en': 'Garages & Parking', 'de': 'Garagen & Stellplätze'}, query: 'garaż'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Kawalerka', 'Działka budowlana'],
        'en': ['For Rent', 'For Sale', 'Studio Flat', '2-Bedroom', 'City Center', 'Plot', 'Garage'],
        'de': ['Mietwohnung', 'Eigentumswohnung', 'Einfamilienhaus', 'Balkon', 'Garten', 'Garage'],
      },
    ),

    'home-garden': CategoryDetail(
      slug: 'home-garden',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Meble i wyposażenie', 'en': 'Furniture & Decor', 'de': 'Möbel & Wohnen'},
          items: [
            SubcategoryItem(name: {'pl': 'Sofy, narożniki i kanapy', 'en': 'Sofas & Couches', 'de': 'Sofas & Couches'}, query: 'sofa'),
            SubcategoryItem(name: {'pl': 'Stoły, krzesła i jadalnia', 'en': 'Tables & Chairs', 'de': 'Tische & Stühle'}, query: 'stół'),
            SubcategoryItem(name: {'pl': 'Szafy, komody i regały', 'en': 'Wardrobes & Chests', 'de': 'Schränke & Kommoden'}, query: 'szafa'),
            SubcategoryItem(name: {'pl': 'Łóżka i materace', 'en': 'Beds & Mattresses', 'de': 'Betten & Matratzen'}, query: 'łóżko'),
            SubcategoryItem(name: {'pl': 'Meble kuchenne', 'en': 'Kitchen Furniture', 'de': 'Küchenmöbel'}, query: 'meble kuchenne'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Ogród i rośliny', 'en': 'Garden & Plants', 'de': 'Garten & Pflanzen'},
          items: [
            SubcategoryItem(name: {'pl': 'Meble ogrodowe i grille', 'en': 'Garden Furniture & BBQs', 'de': 'Gartenmöbel & Grills'}, query: 'meble ogrodowe'),
            SubcategoryItem(name: {'pl': 'Kosiarki i traktorki', 'en': 'Lawn Mowers', 'de': 'Rasenmäher'}, query: 'kosiarka'),
            SubcategoryItem(name: {'pl': 'Rośliny, krzewy i sadzonki', 'en': 'Plants & Trees', 'de': 'Pflanzen & Sträucher'}, query: 'rośliny'),
            SubcategoryItem(name: {'pl': 'Baseny i trampoliny', 'en': 'Pools & Trampolines', 'de': 'Pools & Trampoline'}, query: 'basen'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Narzędzia i majsterkowanie', 'en': 'Tools & DIY', 'de': 'Werkzeuge & Heimwerker'},
          items: [
            SubcategoryItem(name: {'pl': 'Elektronarzędzia', 'en': 'Power Tools', 'de': 'Elektrowerkzeuge'}, query: 'wkrętarka'),
            SubcategoryItem(name: {'pl': 'Narzędzia ręczne', 'en': 'Hand Tools', 'de': 'Handwerkzeuge'}, query: 'narzędzia'),
            SubcategoryItem(name: {'pl': 'Spawarki i kompresory', 'en': 'Welders & Compressors', 'de': 'Schweißgeräte & Kompressoren'}, query: 'kompresor'),
            SubcategoryItem(name: {'pl': 'Oświetlenie i elektryka', 'en': 'Lighting & Electrical', 'de': 'Beleuchtung & Elektro'}, query: 'oświetlenie'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['IKEA', 'Kosiarka', 'Makita', 'Bosch', 'Narożnik', 'Stół dębowy', 'Grill'],
        'en': ['IKEA', 'Sofa', 'Makita', 'Lawnmower', 'Dining Table', 'Garden Set', 'Drill'],
        'de': ['IKEA', 'Sofa', 'Bosch', 'Makita', 'Rasenmäher', 'Esstisch', 'Bett'],
      },
    ),

    'fashion-apparel': CategoryDetail(
      slug: 'fashion-apparel',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Odzież damska', 'en': 'Women\'s Clothing', 'de': 'Damenmode'},
          items: [
            SubcategoryItem(name: {'pl': 'Sukienki i spódnice', 'en': 'Dresses & Skirts', 'de': 'Kleider & Röcke'}, query: 'sukienka'),
            SubcategoryItem(name: {'pl': 'Kurtki i płaszcze', 'en': 'Jackets & Coats', 'de': 'Jacken & Mäntel'}, query: 'kurtka'),
            SubcategoryItem(name: {'pl': 'Swetry i bluzy', 'en': 'Sweaters & Hoodies', 'de': 'Pullover & Hoodies'}, query: 'sweter'),
            SubcategoryItem(name: {'pl': 'Spodnie i jeansy', 'en': 'Jeans & Trousers', 'de': 'Hosen & Jeans'}, query: 'jeansy'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Odzież męska', 'en': 'Men\'s Clothing', 'de': 'Herrenmode'},
          items: [
            SubcategoryItem(name: {'pl': 'Kurtki męskie', 'en': 'Men\'s Jackets', 'de': 'Herrenjacken'}, query: 'kurtka męska'),
            SubcategoryItem(name: {'pl': 'Garnitury i marynarki', 'en': 'Suits & Blazers', 'de': 'Anzüge & Sakkos'}, query: 'garnitur'),
            SubcategoryItem(name: {'pl': 'Koszule i polo', 'en': 'Shirts & Polos', 'de': 'Hemden & Polos'}, query: 'koszula'),
            SubcategoryItem(name: {'pl': 'Bluzy i dresy', 'en': 'Hoodies & Tracksuits', 'de': 'Hoodies & Jogginghosen'}, query: 'bluza'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Obuwie i dodatki', 'en': 'Shoes & Accessories', 'de': 'Schuhe & Accessoires'},
          items: [
            SubcategoryItem(name: {'pl': 'Sneakersy i buty sportowe', 'en': 'Sneakers & Trainers', 'de': 'Sneaker & Sportschuhe'}, query: 'sneakers'),
            SubcategoryItem(name: {'pl': 'Buty eleganckie', 'en': 'Dress Shoes & Heels', 'de': 'Elegante Schuhe'}, query: 'szpilki'),
            SubcategoryItem(name: {'pl': 'Torebki i plecaki', 'en': 'Handbags & Backpacks', 'de': 'Handtaschen & Rucksäcke'}, query: 'torebka'),
            SubcategoryItem(name: {'pl': 'Zegarki i biżuteria', 'en': 'Watches & Jewelry', 'de': 'Uhren & Schmuck'}, query: 'zegarek'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Zara', 'Nike', 'Adidas', 'Tommy Hilfiger', 'Calvin Klein', 'Jordan', 'Gucci'],
        'en': ['Nike', 'Adidas', 'Zara', 'Gucci', 'Sneakers', 'Leather Jacket', 'Watch'],
        'de': ['Nike', 'Adidas', 'Zara', 'Hugo Boss', 'Sneaker', 'Lederjacke', 'Uhr'],
      },
    ),

    'jobs-careers': CategoryDetail(
      slug: 'jobs-careers',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Branże techniczne i IT', 'en': 'Tech & Engineering', 'de': 'IT & Technik'},
          items: [
            SubcategoryItem(name: {'pl': 'Programowanie i IT', 'en': 'Software & IT', 'de': 'Software & IT'}, query: 'programista'),
            SubcategoryItem(name: {'pl': 'Budownictwo i instalacje', 'en': 'Construction', 'de': 'Bau & Handwerk'}, query: 'budownictwo'),
            SubcategoryItem(name: {'pl': 'Inżynieria i produkcja', 'en': 'Engineering & Production', 'de': 'Ingenieurwesen & Produktion'}, query: 'inżynier'),
            SubcategoryItem(name: {'pl': 'Mechanika i serwis', 'en': 'Mechanics', 'de': 'Mechanik & Werkstatt'}, query: 'mechanik'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Logistyka, handel i biuro', 'en': 'Logistics & Office', 'de': 'Logistik & Büro'},
          items: [
            SubcategoryItem(name: {'pl': 'Kierowcy i kurierzy', 'en': 'Drivers & Couriers', 'de': 'Fahrer & Kuriere'}, query: 'kierowca'),
            SubcategoryItem(name: {'pl': 'Magazynierzy i operatorzy', 'en': 'Warehouse Workers', 'de': 'Lagerarbeiter'}, query: 'magazynier'),
            SubcategoryItem(name: {'pl': 'Sprzedaż i obsługa klienta', 'en': 'Sales & Retail', 'de': 'Verkauf & Kundenservice'}, query: 'sprzedawca'),
            SubcategoryItem(name: {'pl': 'Księgowość i finanse', 'en': 'Accounting & Finance', 'de': 'Buchhaltung & Finanzen'}, query: 'księgowa'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Kierowca C+E', 'Praca zdalna', 'Magazynier', 'Spawacz', 'Operator CNC', 'Od zaraz'],
        'en': ['Driver', 'Remote Work', 'Developer', 'Warehouse', 'Part-Time', 'Immediate Start'],
        'de': ['Fahrer C+E', 'Homeoffice', 'Lagerarbeiter', 'Schweißer', 'Sofortiger Beginn'],
      },
    ),

    'construction-renovation': CategoryDetail(
      slug: 'construction-renovation',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Materiały i wykończenie', 'en': 'Materials & Finishing', 'de': 'Material & Ausbau'},
          items: [
            SubcategoryItem(name: {'pl': 'Stal, pustaki i cegły', 'en': 'Bricks & Steel', 'de': 'Steine & Stahl'}, query: 'pustak'),
            SubcategoryItem(name: {'pl': 'Ocieplenie i styropian', 'en': 'Insulation', 'de': 'Dämmung & Styropor'}, query: 'styropian'),
            SubcategoryItem(name: {'pl': 'Płytki i podłogi', 'en': 'Tiles & Flooring', 'de': 'Fliesen & Böden'}, query: 'płytki'),
            SubcategoryItem(name: {'pl': 'Drzwi i okna', 'en': 'Doors & Windows', 'de': 'Türen & Fenster'}, query: 'drzwi'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Instalacje i maszyny', 'en': 'Installations & Machines', 'de': 'Installationen & Maschinen'},
          items: [
            SubcategoryItem(name: {'pl': 'Pompy ciepła i klimatyzacja', 'en': 'Heat Pumps & AC', 'de': 'Wärmepumpen & Klima'}, query: 'pompa ciepła'),
            SubcategoryItem(name: {'pl': 'Fotowoltaika i inwertery', 'en': 'Solar & Inverters', 'de': 'Photovoltaik & Solar'}, query: 'fotowoltaika'),
            SubcategoryItem(name: {'pl': 'Rusztowania i drabiny', 'en': 'Scaffolding & Ladders', 'de': 'Gerüste & Leitern'}, query: 'rusztowanie'),
            SubcategoryItem(name: {'pl': 'Betoniarki i agregaty', 'en': 'Mixers & Generators', 'de': 'Betonmischer & Generatoren'}, query: 'betoniarka'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Styropian', 'Pompa ciepła', 'Kostka brukowa', 'Gres', 'Fotowoltaika', 'Rusztowanie'],
        'en': ['Heat Pump', 'Scaffolding', 'Tiles', 'Solar Panels', 'Insulation', 'Cement'],
        'de': ['Wärmepumpe', 'Gerüst', 'Fliesen', 'Photovoltaik', 'Dämmung'],
      },
    ),

    'business-industry': CategoryDetail(
      slug: 'business-industry',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Maszyny i wyposażenie firm', 'en': 'Machinery & Equipment', 'de': 'Maschinen & Ausstattung'},
          items: [
            SubcategoryItem(name: {'pl': 'Tokarki, frezarki i CNC', 'en': 'Lathes & CNC', 'de': 'Drehmaschinen & CNC'}, query: 'tokarka'),
            SubcategoryItem(name: {'pl': 'Regały magazynowe', 'en': 'Storage Racks', 'de': 'Lagerregale'}, query: 'regały magazynowe'),
            SubcategoryItem(name: {'pl': 'Wyposażenie gastronomii', 'en': 'Restaurant Equipment', 'de': 'Gastronomieausstattung'}, query: 'gastronomia'),
            SubcategoryItem(name: {'pl': 'Wózki widłowe i paletowe', 'en': 'Forklifts & Jacks', 'de': 'Gabelstapler & Hubwagen'}, query: 'wózek widłowy'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Wózek widłowy', 'Regały magazynowe', 'CNC', 'Lada chłodnicza', 'Palety EPAL', 'Tokarka'],
        'en': ['Forklift', 'CNC Machine', 'Storage Racking', 'Commercial Kitchen', 'Pallets'],
        'de': ['Gabelstapler', 'Lagerregal', 'CNC', 'Kühltheke', 'Europaletten'],
      },
    ),

    'agriculture-farming': CategoryDetail(
      slug: 'agriculture-farming',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Ciągniki i maszyny', 'en': 'Tractors & Machinery', 'de': 'Traktoren & Maschinen'},
          items: [
            SubcategoryItem(name: {'pl': 'Ciągniki rolnicze', 'en': 'Tractors', 'de': 'Traktoren'}, query: 'ciągnik rolniczy'),
            SubcategoryItem(name: {'pl': 'Kombajny i prasy', 'en': 'Combines & Balers', 'de': 'Mähdrescher & Ballenpressen'}, query: 'kombajn'),
            SubcategoryItem(name: {'pl': 'Pługi i agregaty', 'en': 'Ploughs & Harrows', 'de': 'Pflüge & Eggen'}, query: 'pług'),
            SubcategoryItem(name: {'pl': 'Przyczepy rolnicze', 'en': 'Farm Trailers', 'de': 'Landwirtschafts-Anhänger'}, query: 'przyczepa rolnicza'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Płody rolne i zwierzęta', 'en': 'Crops & Livestock', 'de': 'Ernte & Nutztiere'},
          items: [
            SubcategoryItem(name: {'pl': 'Zboża i pasze', 'en': 'Grain & Feed', 'de': 'Getreide & Futtermittel'}, query: 'zboże'),
            SubcategoryItem(name: {'pl': 'Siano i słoma', 'en': 'Hay & Straw', 'de': 'Heu & Stroh'}, query: 'siano'),
            SubcategoryItem(name: {'pl': 'Bydło i trzoda', 'en': 'Cattle & Pigs', 'de': 'Rinder & Schweine'}, query: 'bydło'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Ursus C-360', 'Zetor', 'John Deere', 'Prasa zwijająca', 'Siano w balotach', 'Pług'],
        'en': ['John Deere', 'Tractor', 'Harvester', 'Hay Bales', 'Farm Trailer'],
        'de': ['John Deere', 'Fendt', 'Traktor', 'Mähdrescher', 'Heuballen'],
      },
    ),

    'pets-animals': CategoryDetail(
      slug: 'pets-animals',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Psy i koty', 'en': 'Dogs & Cats', 'de': 'Hunde & Katzen'},
          items: [
            SubcategoryItem(name: {'pl': 'Psy rasowe i szczenięta', 'en': 'Dogs & Puppies', 'de': 'Rassehunde & Welpen'}, query: 'pies'),
            SubcategoryItem(name: {'pl': 'Koty rasowe i kocięta', 'en': 'Cats & Kittens', 'de': 'Rassekatzen & Kätzchen'}, query: 'kot'),
            SubcategoryItem(name: {'pl': 'Akcesoria i karmy', 'en': 'Pet Food & Accessories', 'de': 'Tierfutter & Zubehör'}, query: 'drapak'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Akwarystyka i małe zwierzęta', 'en': 'Aquarium & Small Pets', 'de': 'Aquaristik & Kleintiere'},
          items: [
            SubcategoryItem(name: {'pl': 'Akwaria i rybki', 'en': 'Aquariums & Fish', 'de': 'Aquarien & Fische'}, query: 'akwarium'),
            SubcategoryItem(name: {'pl': 'Króliki, gryzonie i ptaki', 'en': 'Rabbits & Small Pets', 'de': 'Kaninchen & Nager'}, query: 'królik'),
            SubcategoryItem(name: {'pl': 'Terrarystyka i gady', 'en': 'Reptiles & Terrariums', 'de': 'Reptilien & Terrarien'}, query: 'terrarium'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Owczarek niemiecki', 'Maltańczyk', 'Kot brytyjski', 'Ragdoll', 'Akwarium', 'Drapak'],
        'en': ['Puppy', 'French Bulldog', 'British Shorthair', 'Aquarium', 'Dog Bed'],
        'de': ['Welpe', 'Französische Bulldogge', 'Britisch Kurzhaar', 'Aquarium', 'Hundebett'],
      },
    ),

    'baby-kids': CategoryDetail(
      slug: 'baby-kids',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Dla najmłodszych', 'en': 'Baby & Toddler', 'de': 'Babys & Kleinkinder'},
          items: [
            SubcategoryItem(name: {'pl': 'Wózki i foteliki', 'en': 'Strollers & Car Seats', 'de': 'Kinderwagen & Autositze'}, query: 'wózek'),
            SubcategoryItem(name: {'pl': 'Łóżeczka i meble', 'en': 'Cribs & Furniture', 'de': 'Babybetten & Möbel'}, query: 'łóżeczko'),
            SubcategoryItem(name: {'pl': 'Ubranka i buciki', 'en': 'Baby Clothes', 'de': 'Babykleidung'}, query: 'ubranka'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Zabawki i gry', 'en': 'Toys & Games', 'de': 'Spielzeug & Spiele'},
          items: [
            SubcategoryItem(name: {'pl': 'Klocki LEGO', 'en': 'LEGO Sets', 'de': 'LEGO Sets'}, query: 'LEGO'),
            SubcategoryItem(name: {'pl': 'Lalki i maskotki', 'en': 'Dolls & Plush', 'de': 'Puppen & Plüschtiere'}, query: 'lalka'),
            SubcategoryItem(name: {'pl': 'Pojazdy na akumulator', 'en': 'Ride-on Cars', 'de': 'Kinder-Elektroautos'}, query: 'na akumulator'),
            SubcategoryItem(name: {'pl': 'Gry planszowe', 'en': 'Board Games', 'de': 'Brettspiele'}, query: 'planszówka'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['LEGO', 'Wózek 3w1', 'Cybex', 'Fotelik Isofix', 'Łóżeczko', 'Auto na akumulator'],
        'en': ['LEGO', 'Stroller', 'Cybex', 'Car Seat', 'Crib', 'Kids Bike'],
        'de': ['LEGO', 'Kinderwagen', 'Cybex', 'Kindersitz', 'Kinderbett'],
      },
    ),

    'sports-hobbies': CategoryDetail(
      slug: 'sports-hobbies',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Rowery i siłownia', 'en': 'Bikes & Fitness', 'de': 'Fahrräder & Fitness'},
          items: [
            SubcategoryItem(name: {'pl': 'Rowery górskie i gravel', 'en': 'Mountain & Gravel Bikes', 'de': 'Mountainbikes & Gravel'}, query: 'rower MTB'),
            SubcategoryItem(name: {'pl': 'Rowery i hulajnogi elektryczne', 'en': 'E-Bikes & E-Scooters', 'de': 'E-Bikes & E-Scooter'}, query: 'rower elektryczny'),
            SubcategoryItem(name: {'pl': 'Hantle, gryfy i obciążenia', 'en': 'Dumbbells & Weights', 'de': 'Hanteln & Gewichte'}, query: 'hantle'),
            SubcategoryItem(name: {'pl': 'Bieżnie i trenażery', 'en': 'Treadmills & Trainers', 'de': 'Laufbänder & Ergometer'}, query: 'bieżnia'),
          ],
        ),
        SubcategoryGroup(
          title: {'pl': 'Turystyka i wędkarstwo', 'en': 'Outdoor & Fishing', 'de': 'Outdoor & Angeln'},
          items: [
            SubcategoryItem(name: {'pl': 'Wędki i kołowrotki', 'en': 'Fishing Rods & Reels', 'de': 'Angelruten & Rollen'}, query: 'wędka'),
            SubcategoryItem(name: {'pl': 'Deski SUP i kajaki', 'en': 'SUP Boards & Kayaks', 'de': 'SUP Boards & Kajaks'}, query: 'deska SUP'),
            SubcategoryItem(name: {'pl': 'Namioty i śpiwory', 'en': 'Tents & Sleeping Bags', 'de': 'Zelte & Schlafsäcke'}, query: 'namiot'),
            SubcategoryItem(name: {'pl': 'Narty i snowboard', 'en': 'Skis & Snowboards', 'de': 'Ski & Snowboards'}, query: 'narty'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Rower elektryczny', 'Gravel', 'Hantle', 'Deska SUP', 'Bieżnia', 'Wędka', 'KROSS'],
        'en': ['E-Bike', 'Gravel Bike', 'SUP Board', 'Treadmill', 'Dumbbells', 'Trek'],
        'de': ['E-Bike', 'Gravelbike', 'SUP Board', 'Laufband', 'Hanteln', 'Cube'],
      },
    ),

    'services': CategoryDetail(
      slug: 'services',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Remonty, transport i usługi', 'en': 'Renovation, Moving & Services', 'de': 'Handwerk, Umzug & Services'},
          items: [
            SubcategoryItem(name: {'pl': 'Wykończenia wnętrz i malowanie', 'en': 'Renovation & Painting', 'de': 'Renovierung & Maler'}, query: 'remont'),
            SubcategoryItem(name: {'pl': 'Instalacje elektryczne i hydraulika', 'en': 'Electrical & Plumbing', 'de': 'Elektrik & Sanitär'}, query: 'elektryk'),
            SubcategoryItem(name: {'pl': 'Przeprowadzki i transport busem', 'en': 'Moving & Transport', 'de': 'Umzüge & Transport'}, query: 'przeprowadzki'),
            SubcategoryItem(name: {'pl': 'Mechanika samochodowa i laweta', 'en': 'Auto Repair & Towing', 'de': 'Autoreparatur & Abschleppdienst'}, query: 'mechanik'),
            SubcategoryItem(name: {'pl': 'Sprzątanie i ogrody', 'en': 'Cleaning & Gardening', 'de': 'Reinigung & Gartenpflege'}, query: 'sprzątanie'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Remonty mieszkań', 'Przeprowadzki', 'Laweta 24h', 'Elektryk', 'Hydraulik', 'Sprzątanie'],
        'en': ['Moving Service', 'Plumber', 'Electrician', 'Car Towing', 'Cleaning', 'Painting'],
        'de': ['Umzugsservice', 'Klempner', 'Elektriker', 'Abschleppdienst', 'Malerarbeiten'],
      },
    ),

    'antiques-collectibles': CategoryDetail(
      slug: 'antiques-collectibles',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Numizmatyka, militaria i antyki', 'en': 'Coins, Militaria & Antiques', 'de': 'Münzen, Militaria & Antiquitäten'},
          items: [
            SubcategoryItem(name: {'pl': 'Monety srebrne i złote', 'en': 'Silver & Gold Coins', 'de': 'Silber- & Goldmünzen'}, query: 'monety'),
            SubcategoryItem(name: {'pl': 'Banknoty kolekcjonerskie', 'en': 'Banknotes', 'de': 'Banknoten'}, query: 'banknoty'),
            SubcategoryItem(name: {'pl': 'Militaria i odznaczenia', 'en': 'Militaria & Medals', 'de': 'Militaria & Orden'}, query: 'szabla'),
            SubcategoryItem(name: {'pl': 'Meble i zegary antyczne', 'en': 'Antique Furniture & Clocks', 'de': 'Antike Möbel & Uhren'}, query: 'meble antyczne'),
            SubcategoryItem(name: {'pl': 'Porcelana i pamiątki PRL', 'en': 'Porcelain & Vintage', 'de': 'Porzellan & Vintage'}, query: 'porcelana'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Monety srebrne', 'PRL', 'Zegar wiszący', 'Porcelana Ćmielów', 'Szabla', 'Obraz olejny'],
        'en': ['Silver Coins', 'Vintage', 'Antique Clock', 'Porcelain', 'Oil Painting', 'Medals'],
        'de': ['Silbermünzen', 'Vintage', 'Standuhr', 'Porzellan', 'Ölgemälde', 'Medaillen'],
      },
    ),

    'health-beauty': CategoryDetail(
      slug: 'health-beauty',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Perfumy, kosmetyki i pielęgnacja', 'en': 'Perfumes, Cosmetics & Care', 'de': 'Parfüm, Kosmetik & Pflege'},
          items: [
            SubcategoryItem(name: {'pl': 'Perfumy damskie i męskie', 'en': 'Perfumes & Fragrances', 'de': 'Damen- & Herrendüfte'}, query: 'perfumy'),
            SubcategoryItem(name: {'pl': 'Pielęgnacja i makijaż', 'en': 'Skincare & Makeup', 'de': 'Hautpflege & Make-up'}, query: 'krem'),
            SubcategoryItem(name: {'pl': 'Sprzęt kosmetyczny i fryzjerski', 'en': 'Beauty & Hair Devices', 'de': 'Styling & Beauty-Geräte'}, query: 'suszarka'),
            SubcategoryItem(name: {'pl': 'Zdrowie i masażery', 'en': 'Health & Massage', 'de': 'Massage & Gesundheit'}, query: 'masażer'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Dior', 'Chanel', 'Dyson Airwrap', 'Pistolet do masażu', 'Depilator IPL', 'Perfumy'],
        'en': ['Chanel', 'Dior', 'Dyson', 'Massage Gun', 'IPL', 'Perfume'],
        'de': ['Chanel', 'Dior', 'Dyson', 'Massagepistole', 'IPL', 'Parfüm'],
      },
    ),

    'music-education': CategoryDetail(
      slug: 'music-education',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Instrumenty i studio', 'en': 'Instruments & Audio Studio', 'de': 'Musikinstrumente & Studio'},
          items: [
            SubcategoryItem(name: {'pl': 'Gitary akustyczne i elektryczne', 'en': 'Guitars', 'de': 'Gitarren'}, query: 'gitara'),
            SubcategoryItem(name: {'pl': 'Pianina cyfrowe i keyboardy', 'en': 'Digital Pianos & Keyboards', 'de': 'E-Pianos & Keyboards'}, query: 'pianino'),
            SubcategoryItem(name: {'pl': 'Mikrofony i sprzęt studyjny', 'en': 'Microphones & Studio Gear', 'de': 'Mikrofone & Studio-Equipment'}, query: 'mikrofon'),
            SubcategoryItem(name: {'pl': 'Płyty winylowe i CD', 'en': 'Vinyl & CDs', 'de': 'Schallplatten & CDs'}, query: 'winyl'),
            SubcategoryItem(name: {'pl': 'Korepetycje i lekcje', 'en': 'Lessons & Tutoring', 'de': 'Unterricht & Nachhilfe'}, query: 'korepetycje'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Gitara klasyczna', 'Pianino cyfrowe', 'Yamaha', 'Fender', 'Płyty winylowe', 'Shure'],
        'en': ['Fender Guitar', 'Yamaha Piano', 'Vinyl Records', 'DJ Controller', 'Microphone'],
        'de': ['Fender Gitarre', 'Yamaha Klavier', 'Schallplatten', 'DJ Controller', 'Mikrofon'],
      },
    ),

    'accommodations-stays': CategoryDetail(
      slug: 'accommodations-stays',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Noclegi i wypoczynek', 'en': 'Accommodations & Holidays', 'de': 'Unterkünfte & Urlaub'},
          items: [
            SubcategoryItem(name: {'pl': 'Domki całoroczne i letniskowe', 'en': 'Holiday Cottages', 'de': 'Ferienhäuser'}, query: 'domek'),
            SubcategoryItem(name: {'pl': 'Apartamenty wakacyjne', 'en': 'Holiday Apartments', 'de': 'Ferienwohnungen'}, query: 'apartament wakacyjny'),
            SubcategoryItem(name: {'pl': 'Pokoje gościnne i agroturystyka', 'en': 'Guest Rooms & Farm Stays', 'de': 'Gästezimmer & Bauernhof'}, query: 'agroturystyka'),
            SubcategoryItem(name: {'pl': 'Glamping i kempingi', 'en': 'Glamping & Camping', 'de': 'Glamping & Camping'}, query: 'glamping'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Domek z bali', 'Zakopane', 'Apartament nad morzem', 'Mazury', 'Bieszczady', 'Glamping'],
        'en': ['Cabin with Jacuzzi', 'Sea View Apartment', 'Mountain Chalet', 'Glamping', 'Lake Cottage'],
        'de': ['Chalet mit Whirlpool', 'Ferienwohnung Meerblick', 'Berghütte', 'Glamping'],
      },
    ),

    'rentals-hire': CategoryDetail(
      slug: 'rentals-hire',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Wypożyczalnia sprzętu i aut', 'en': 'Equipment & Vehicle Rental', 'de': 'Geräte- & Fahrzeugverleih'},
          items: [
            SubcategoryItem(name: {'pl': 'Minikoparki i zagęszczarki', 'en': 'Mini Excavators & Compactors', 'de': 'Minibagger & Verdichter'}, query: 'wynajem minikoparki'),
            SubcategoryItem(name: {'pl': 'Busy, auta i lawety', 'en': 'Vans, Cars & Trailers', 'de': 'Transporter, Autos & Anhänger'}, query: 'wynajem aut'),
            SubcategoryItem(name: {'pl': 'Namioty imprezowe i dmuchańce', 'en': 'Party Tents & Bouncy Castles', 'de': 'Partyzelte & Hüpfburgen'}, query: 'dmuchańce'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Wynajem minikoparki', 'Wypożyczalnia busów', 'Dmuchańce', 'Wynajem lawety', 'Podnośnik'],
        'en': ['Mini Excavator Hire', 'Van Rental', 'Bouncy Castle Hire', 'Trailer Rental'],
        'de': ['Minibagger mieten', 'Transporter mieten', 'Hüpfburg mieten', 'Anhängerverleih'],
      },
    ),

    'free-stuff': CategoryDetail(
      slug: 'free-stuff',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Oddam za darmo', 'en': 'Free Giveaways', 'de': 'Zu verschenken'},
          items: [
            SubcategoryItem(name: {'pl': 'Meble i wyposażenie za darmo', 'en': 'Free Furniture', 'de': 'Möbel zu verschenken'}, query: 'oddam meble'),
            SubcategoryItem(name: {'pl': 'AGD i elektronika za darmo', 'en': 'Free Appliances', 'de': 'Elektrogeräte zu verschenken'}, query: 'oddam AGD'),
            SubcategoryItem(name: {'pl': 'Ubrania i artykuły dziecięce', 'en': 'Free Clothes & Baby Items', 'de': 'Kleidung & Kindersachen'}, query: 'oddam ubrania'),
            SubcategoryItem(name: {'pl': 'Zwierzęta do adopcji', 'en': 'Pets for Adoption', 'de': 'Tiere zur Adoption'}, query: 'oddam psa'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Oddam meble', 'Oddam za darmo', 'Do odebrania', 'Sofa za darmo', 'Adopcja psa'],
        'en': ['Free Furniture', 'Free Pickup', 'Free Dog', 'Free Clothes', 'Giveaway'],
        'de': ['Möbel zu verschenken', 'Selbstabholung', 'Kostenlos', 'Zu verschenken'],
      },
    ),

    'delivery-deals': CategoryDetail(
      slug: 'delivery-deals',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Oferty z szybką wysyłką', 'en': 'Fast Shipping Deals', 'de': 'Schneller Versand'},
          items: [
            SubcategoryItem(name: {'pl': 'Elektronika z wysyłką paczkomatem', 'en': 'Electronics with Locker Delivery', 'de': 'Elektronik mit Paketstation'}, query: 'wysyłka paczkomat'),
            SubcategoryItem(name: {'pl': 'Moda i obuwie z dostawą', 'en': 'Fashion with Delivery', 'de': 'Mode mit Versand'}, query: 'z dostawą'),
            SubcategoryItem(name: {'pl': 'Książki i media kurierem', 'en': 'Books & Media with Delivery', 'de': 'Bücher mit Kurierversand'}, query: 'wysyłka'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Paczkomat', 'Wysyłka InPost', 'Darmowa dostawa', 'Kurier DPD', 'Wysyłka w 24h'],
        'en': ['Parcel Locker', 'Free Delivery', 'Express Shipping', 'Same-Day Dispatch'],
        'de': ['Packstation', 'Kostenloser Versand', 'Expressversand', 'Sofortversand'],
      },
    ),

    'books-textbooks': CategoryDetail(
      slug: 'books-textbooks',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Podręczniki, literatura i komiksy', 'en': 'Textbooks, Fiction & Comics', 'de': 'Schulbücher, Romane & Comics'},
          items: [
            SubcategoryItem(name: {'pl': 'Podręczniki do liceum i podstawówki', 'en': 'School Textbooks', 'de': 'Schulbücher'}, query: 'podręczniki'),
            SubcategoryItem(name: {'pl': 'Książki akademickie i językowe', 'en': 'University & Language Books', 'de': 'Fachbücher & Sprachkurse'}, query: 'język angielski'),
            SubcategoryItem(name: {'pl': 'Kryminały, thrillery i Sci-Fi', 'en': 'Thrillers & Sci-Fi', 'de': 'Krimis & Sci-Fi'}, query: 'kryminał'),
            SubcategoryItem(name: {'pl': 'Manga, komiksy i powieści', 'en': 'Manga & Comics', 'de': 'Manga & Comics'}, query: 'manga'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Nowa Era', 'Manga', 'Stephen King', 'Remigiusz Mróz', 'Wiedźmin', 'Język niemiecki'],
        'en': ['Manga', 'Stephen King', 'Textbooks', 'Harry Potter', 'Fantasy Books'],
        'de': ['Manga', 'Stephen King', 'Schulbücher', 'Harry Potter', 'Thriller'],
      },
    ),

    'auto-parts': CategoryDetail(
      slug: 'auto-parts',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Części samochodowe i koła', 'en': 'Car Parts & Wheels', 'de': 'Autoteile & Räder'},
          items: [
            SubcategoryItem(name: {'pl': 'Opony zimowe, letnie i alufelgi', 'en': 'Tires & Alloy Rims', 'de': 'Reifen & Alufelgen'}, query: 'alufelgi'),
            SubcategoryItem(name: {'pl': 'Reflektory LED i oświetlenie', 'en': 'Headlights & Lamps', 'de': 'Scheinwerfer & LED'}, query: 'reflektor'),
            SubcategoryItem(name: {'pl': 'Zderzaki, maski i elementy blacharskie', 'en': 'Bumpers & Bodywork', 'de': 'Stoßstangen & Karosserie'}, query: 'zderzak'),
            SubcategoryItem(name: {'pl': 'Silniki, skrzynie biegów i turbiny', 'en': 'Engines & Gearboxes', 'de': 'Motoren & Getriebe'}, query: 'silnik'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Alufelgi 17 18 19', 'Opony 205/55R16', 'Lampy LED', 'Zderzak M Pakiet', 'Turbina', 'DSG'],
        'en': ['Alloy Rims', 'Tires', 'LED Headlights', 'Bumper', 'Turbocharger', 'Brakes'],
        'de': ['Alufelgen', 'Winterreifen', 'LED-Scheinwerfer', 'Stoßstange', 'Turbolader'],
      },
    ),

    'machinery-parts': CategoryDetail(
      slug: 'machinery-parts',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Części do maszyn rolniczych i budowlanych', 'en': 'Agri & Construction Spares', 'de': 'Ersatzteile für Bau & Landwirtschaft'},
          items: [
            SubcategoryItem(name: {'pl': 'Części do ciągników Ursus, Zetor, John Deere', 'en': 'Tractor Spares', 'de': 'Traktor-Ersatzteile'}, query: 'części ursus'),
            SubcategoryItem(name: {'pl': 'Gąsienice i łyżki do koparek', 'en': 'Rubber Tracks & Buckets', 'de': 'Baggerketten & Schaufeln'}, query: 'łyżka do koparki'),
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
          title: {'pl': 'Profile i oferty pracodawców', 'en': 'Employer Profiles & Offers', 'de': 'Arbeitgeberprofile & Stellen'},
          items: [
            SubcategoryItem(name: {'pl': 'Duże przedsiębiorstwa i korporacje', 'en': 'Top Enterprises', 'de': 'Großunternehmen & Konzerne'}, query: 'pracodawca'),
            SubcategoryItem(name: {'pl': 'Agencje pracy i rekrutacji', 'en': 'Employment Agencies', 'de': 'Personalvermittlung'}, query: 'agencja pracy'),
            SubcategoryItem(name: {'pl': 'Firmy produkcyjne i logistyczne', 'en': 'Manufacturing & Logistics', 'de': 'Produktion & Logistik'}, query: 'produkcja'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Praca od zaraz', 'Umowa o pracę', 'Benefity', 'Stabilne zatrudnienie', 'Zakwaterowanie'],
        'en': ['Full-Time', 'Immediate Start', 'Benefits', 'Accommodation Included'],
        'de': ['Vollzeit', 'Sofortiger Beginn', 'Festanstellung', 'Unterkunft inklusive'],
      },
    ),

    'auto-expo-events': CategoryDetail(
      slug: 'auto-expo-events',
      groups: [
        SubcategoryGroup(
          title: {'pl': 'Wydarzenia motoryzacyjne', 'en': 'Automotive Events', 'de': 'Motorsport & Events'},
          items: [
            SubcategoryItem(name: {'pl': 'Targi i wystawy samochodowe', 'en': 'Car Shows & Expos', 'de': 'Automessen & Ausstellungen'}, query: 'targi motoryzacyjne'),
            SubcategoryItem(name: {'pl': 'Zloty aut klasycznych i zabytkowych', 'en': 'Classic Car Meets', 'de': 'Oldtimer-Treffen'}, query: 'zlot klasyków'),
            SubcategoryItem(name: {'pl': 'Zawody driftingowe i rajdy', 'en': 'Drift & Rally Events', 'de': 'Drift & Rallye'}, query: 'rajd'),
            SubcategoryItem(name: {'pl': 'Track day i imprezy torowe', 'en': 'Track Days', 'de': 'Track Days & Renntraining'}, query: 'track day'),
          ],
        ),
      ],
      popularTags: {
        'pl': ['Targi Poznań', 'Zlot Youngtimer', 'Drift Masters', 'Bilety na targi', 'Classic Auto'],
        'en': ['Car Expo', 'Track Day', 'Classic Car Meet', 'Drift Event'],
        'de': ['Automesse', 'Trackday', 'Oldtimertreffen', 'Drift Masters'],
      },
    ),
  };

  static CategoryDetail? getDetails(String slug) {
    return categoryDetails[slug];
  }
}
