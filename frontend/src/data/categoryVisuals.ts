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
    image: "/categories/antiques-collectibles.png",
    fallbackIcon: "Landmark"
  },
  "construction-renovation": {
    slug: "construction-renovation",
    bgColor: "#3a77ff",
    image: "/categories/construction-renovation.png",
    fallbackIcon: "Hammer"
  },
  "business-industry": {
    slug: "business-industry",
    bgColor: "#23e5db",
    image: "/categories/business-industry.png",
    fallbackIcon: "Factory"
  },
  "automotive-vehicles": {
    slug: "automotive-vehicles",
    bgColor: "#ff5636",
    image: "/categories/automotive-vehicles.png",
    fallbackIcon: "Car"
  },
  "real-estate": {
    slug: "real-estate",
    bgColor: "#fff6d9",
    image: "/categories/real-estate.png",
    fallbackIcon: "Home"
  },
  "jobs-careers": {
    slug: "jobs-careers",
    bgColor: "#ceddff",
    image: "/categories/jobs-careers.png",
    fallbackIcon: "Briefcase"
  },
  "home-garden": {
    slug: "home-garden",
    bgColor: "#c8f8f6",
    image: "/categories/home-garden.png",
    fallbackIcon: "Armchair"
  },
  "electronics": {
    slug: "electronics",
    bgColor: "#ffd6c9",
    image: "/categories/electronics.png",
    fallbackIcon: "Smartphone"
  },
  "fashion-apparel": {
    slug: "fashion-apparel",
    bgColor: "#ffce32",
    image: "/categories/fashion-apparel.png",
    fallbackIcon: "Shirt"
  },
  "agriculture-farming": {
    slug: "agriculture-farming",
    bgColor: "#ceddff",
    image: "/categories/agriculture-farming.png",
    fallbackIcon: "Tractor"
  },
  "pets-animals": {
    slug: "pets-animals",
    bgColor: "#c8f8f6",
    image: "/categories/pets-animals.png",
    fallbackIcon: "Dog"
  },
  "baby-kids": {
    slug: "baby-kids",
    bgColor: "#ffd6c9",
    image: "/categories/baby-kids.png",
    fallbackIcon: "Baby"
  },
  "sports-hobbies": {
    slug: "sports-hobbies",
    bgColor: "#fff6d9",
    image: "/categories/sports-hobbies.png",
    fallbackIcon: "Trophy"
  },
  "music-education": {
    slug: "music-education",
    bgColor: "#3a77ff",
    image: "/categories/music-education.png",
    fallbackIcon: "Music"
  },
  "health-beauty": {
    slug: "health-beauty",
    bgColor: "#23e5db",
    image: "/categories/health-beauty.png",
    fallbackIcon: "Sparkles"
  },
  "services": {
    slug: "services",
    bgColor: "#ff5636",
    image: "/categories/services.png",
    fallbackIcon: "Wrench"
  },
  "accommodations-stays": {
    slug: "accommodations-stays",
    bgColor: "#fff6d9",
    image: "/categories/accommodations-stays.png",
    fallbackIcon: "Bed"
  },
  "rentals-hire": {
    slug: "rentals-hire",
    bgColor: "#ceddff",
    image: "/categories/rentals-hire.png",
    fallbackIcon: "CalendarCheck"
  },
  "free-stuff": {
    slug: "free-stuff",
    bgColor: "#23e5db",
    image: "/categories/free-stuff.png",
    fallbackIcon: "Gift"
  },
  "delivery-deals": {
    slug: "delivery-deals",
    bgColor: "#ffd6c9",
    image: "/categories/delivery-deals.png",
    fallbackIcon: "PackageCheck"
  },
  "books-textbooks": {
    slug: "books-textbooks",
    bgColor: "#ffce32",
    image: "/categories/books-textbooks.png",
    fallbackIcon: "BookOpen"
  },
  "machinery-parts": {
    slug: "machinery-parts",
    bgColor: "#3a77ff",
    image: "/categories/machinery-parts.png",
    fallbackIcon: "Settings"
  },
  "auto-parts": {
    slug: "auto-parts",
    bgColor: "#c8f8f6",
    image: "/categories/auto-parts.png",
    fallbackIcon: "Cog"
  },
  "featured-employers": {
    slug: "featured-employers",
    bgColor: "#ffd6c9",
    image: "/categories/featured-employers.png",
    fallbackIcon: "Users"
  },
  "auto-expo-events": {
    slug: "auto-expo-events",
    bgColor: "#ffce32",
    image: "/categories/auto-expo-events.jpeg",
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
    image: `/categories/${slug}.png`,
    fallbackIcon: "Sparkles"
  };
}
