import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base sitemap template
const baseSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://jaautomoveisresende.com.br/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Inventory Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/inventory</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Financing Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/financing</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Consignado Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/consignado</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Consortium Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/consortium</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- About Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/about</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Contact Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/contact</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Privacy Policy Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/privacy-policy</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Terms of Service Page -->
  <url>
    <loc>https://jaautomoveisresende.com.br/terms-of-service</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

// Function to fetch vehicles from API
async function fetchVehicles() {
  try {
    const response = await fetch("http://localhost:5000/api/vehicles");
    if (!response.ok) {
      throw new Error("Failed to fetch vehicles");
    }
    const data = await response.json();
    return data.vehicles || data; // Adjust based on API response structure
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return [];
  }
}

// Function to generate vehicle URLs
function generateVehicleUrls(vehicles) {
  return vehicles
    .map(
      (vehicle) => `
  <url>
    <loc>https://jaautomoveisresende.com.br/vehicle/${vehicle._id || vehicle.id}</loc>
    <lastmod>${new Date(vehicle.updatedAt || vehicle.createdAt || Date.now())
        .toISOString()
        .split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("");
}

// Main function to generate sitemap
async function generateSitemap() {
  try {
    console.log("Fetching vehicles from API...");
    const vehicles = await fetchVehicles();

    console.log(`Found ${vehicles.length} vehicles`);

    const vehicleUrls = generateVehicleUrls(vehicles);
    const fullSitemap = baseSitemap + vehicleUrls + "\n</urlset>";

    const sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml");
    fs.writeFileSync(sitemapPath, fullSitemap, "utf8");

    console.log("Sitemap generated successfully at public/sitemap.xml");
    console.log(`Total URLs: ${8 + vehicles.length}`); // 8 static + dynamic vehicles
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export { generateSitemap, fetchVehicles, generateVehicleUrls };
