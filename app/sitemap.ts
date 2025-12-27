import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tcap-app.vercel.app"; // Replace with actual domain when deployed

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/income-details`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/liabilities`,
      lastModified: new Date(),
      changeFrequency: "weekly", // Debt can change often
      priority: 0.9,
    },
    {
      url: `${baseUrl}/simulator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
