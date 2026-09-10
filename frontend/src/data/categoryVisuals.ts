export interface CategoryVisualConfig {
  slug: string;
  bgColor: string;
  image: string;
  fallbackIcon: string;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisualConfig> = {
  "antiques-collectibles": {
    slug: "antiques-collectibles",
    bgColor: "#ffce32",
    image: "/categories/antiques-collectibles.svg",
    fallbackIcon: "Landmark"
  },
  "construction-renovation": {
    slug: "construction-renovation",
    bgColor: "#3a77ff",
    image: "/categories/construction-renovation.svg",
    fallbackIcon: "Hammer"
  },
  "business-industry": {
    slug: "business-industry",
    bgColor: "#23e5db",
    image: "/categories/business-industry.svg",
    fallbackIcon: "Factory"
  },
  "automotive-vehicles": {
    slug: "automotive-vehicles",
    bgColor: "#ff5636",
    image: "/categories/automotive-vehicles.svg",
    fallbackIcon: "Car"
  },
  "real-estate": {
    slug: "real-estate",
    bgColor: "#fff6d9",
    image: "/categories/real-estate.svg",
    fallbackIcon: "Home"
  },
  "jobs-careers": {
    slug: "jobs-careers",
    bgColor: "#ceddff",
    image: "/categories/jobs-careers.svg",
    fallbackIcon: "Briefcase"
  },
  "home-garden": {
    slug: "home-garden",
    bgColor: "#c8f8f6",
    image: "/categories/home-garden.svg",
    fallbackIcon: "Armchair"
  },
  "electronics": {
    slug: "electronics",
    bgColor: "#ffd6c9",
    image: "/categories/electronics.svg",
    fallbackIcon: "Smartphone"
  },
  "fashion-apparel": {
    slug: "fashion-apparel",
    bgColor: "#ffce32",
    image: "/categories/fashion-apparel.svg",
    fallbackIcon: "Shirt"
  },
  "agriculture-farming": {
    slug: "agriculture-farming",
    bgColor: "#ceddff",
    image: "/categories/agriculture-farming.svg",
    fallbackIcon: "Tractor"
  },
  "pets-animals": {
    slug: "pets-animals",
    bgColor: "#c8f8f6",
    image: "/categories/pets-animals.svg",
    fallbackIcon: "Dog"
  },
  "baby-kids": {
    slug: "baby-kids",
    bgColor: "#ffd6c9",
    image: "/categories/baby-kids.svg",
    fallbackIcon: "Baby"
  },
  "sports-hobbies": {
    slug: "sports-hobbies",
    bgColor: "#fff6d9",
    image: "/categories/sports-hobbies.svg",
    fallbackIcon: "Trophy"
  },
  "music-education": {
    slug: "music-education",
    bgColor: "#3a77ff",
    image: "/categories/music-education.svg",
    fallbackIcon: "Music"
  },
  "health-beauty": {
    slug: "health-beauty",
    bgColor: "#23e5db",
    image: "/categories/health-beauty.svg",
    fallbackIcon: "Sparkles"
  },
  "services": {
    slug: "services",
    bgColor: "#ff5636",
    image: "/categories/services.svg",
    fallbackIcon: "Wrench"
  },
  "accommodations-stays": {
    slug: "accommodations-stays",
    bgColor: "#fff6d9",
    image: "/categories/accommodations-stays.svg",
    fallbackIcon: "Bed"
  },
  "rentals-hire": {
    slug: "rentals-hire",
    bgColor: "#ceddff",
    image: "/categories/rentals-hire.svg",
    fallbackIcon: "CalendarCheck"
  },
  "free-stuff": {
    slug: "free-stuff",
    bgColor: "#23e5db",
    image: "/categories/free-stuff.svg",
    fallbackIcon: "Gift"
  },
  "delivery-deals": {
    slug: "delivery-deals",
    bgColor: "#ffd6c9",
    image: "/categories/delivery-deals.svg",
    fallbackIcon: "PackageCheck"
  },
  "books-textbooks": {
    slug: "books-textbooks",
    bgColor: "#ffce32",
    image: "/categories/books-textbooks.svg",
    fallbackIcon: "BookOpen"
  },
  "machinery-parts": {
    slug: "machinery-parts",
    bgColor: "#3a77ff",
    image: "/categories/machinery-parts.svg",
    fallbackIcon: "Settings"
  },
  "auto-parts": {
    slug: "auto-parts",
    bgColor: "#c8f8f6",
    image: "/categories/auto-parts.svg",
    fallbackIcon: "Cog"
  },
  "featured-employers": {
    slug: "featured-employers",
    bgColor: "#ffd6c9",
    image: "/categories/featured-employers.svg",
    fallbackIcon: "Users"
  },
  "auto-expo-events": {
    slug: "auto-expo-events",
    bgColor: "#ffce32",
    image: "/categories/auto-expo-events.svg",
    fallbackIcon: "Compass"
  }
};

const DEFAULT_FALLBACK_COLORS = [
  "#ffce32",
  "#3a77ff",
  "#23e5db",
  "#ff5636",
  "#fff6d9",
  "#ceddff",
  "#c8f8f6",
  "#ffd6c9"
];

export function getCategoryVisual(slug: string, index = 0): CategoryVisualConfig {
  if (CATEGORY_VISUALS[slug]) {
    return CATEGORY_VISUALS[slug];
  }
  return {
    slug,
    bgColor: DEFAULT_FALLBACK_COLORS[index % DEFAULT_FALLBACK_COLORS.length],
    image: `/categories/${slug}.svg`,
    fallbackIcon: "Sparkles"
  };
}
