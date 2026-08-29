import { MetadataRoute } from "next";

const CATEGORY_SLUGS = [
  "automotive",
  "real-estate",
  "electronics",
  "jobs",
  "home-garden",
  "fashion",
  "agriculture",
  "animals",
  "for-kids",
  "sports-hobby",
  "music-education",
  "health-beauty",
  "services",
  "accommodation",
  "events",
  "giveaway",
  "exchange",
  "construction-materials",
  "office-furniture",
  "books-stationery",
  "medical-equipment",
  "gastronomy",
  "finance-insurance",
  "travel-tourism",
  "antiques-collectibles",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://deallyhub.com";
  const now = new Date();

  const categoryRoutes = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/?category=${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
    ...categoryRoutes,
  ];
}
