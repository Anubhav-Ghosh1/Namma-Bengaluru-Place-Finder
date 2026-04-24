import mongoose from "mongoose";
import { Place } from "../models/Place";

const MONGODB_URI = process.env.MONGODB_URI!;

const SEED_PLACES = [
  {
    name: "Cubbon Park",
    lat: 12.9763,
    lng: 77.5929,
    category: "nature",
    tips: [
      "Morning walks are magical here",
      "Visit the Bangalore Aquarium inside the park",
      "Great spot for reading under century-old trees",
      "The bandstand area hosts weekend events",
    ],
    upvotes: 42,
    downvotes: 3,
    addedBy: "system",
  },
  {
    name: "VV Puram Food Street",
    lat: 12.9489,
    lng: 77.5712,
    category: "food",
    tips: [
      "Try the dosa varieties at every stall",
      "Go after 6pm for the full street food experience",
      "Don't miss the fresh sugarcane juice",
      "The Congress Pani Puri stall is legendary",
    ],
    upvotes: 67,
    downvotes: 5,
    addedBy: "system",
  },
  {
    name: "Lalbagh Botanical Garden",
    lat: 12.9507,
    lng: 77.5848,
    category: "nature",
    tips: [
      "The glass house flower shows are incredible",
      "Climb to the top of the rocky hill for panoramic views",
      "Early mornings are perfect for bird watching",
      "Visit during Republic Day or Independence Day for flower shows",
    ],
    upvotes: 55,
    downvotes: 2,
    addedBy: "system",
  },
  {
    name: "Commercial Street",
    lat: 12.9833,
    lng: 77.6074,
    category: "shopping",
    tips: [
      "Bargain hard — start at 50% of the quoted price",
      "Best destination for ethnic wear and accessories",
      "Visit on weekdays to avoid the massive weekend crowds",
      "Side lanes have hidden gem stores with better prices",
    ],
    upvotes: 38,
    downvotes: 8,
    addedBy: "system",
  },
  {
    name: "Bangalore Palace",
    lat: 12.9988,
    lng: 77.592,
    category: "culture",
    tips: [
      "Tudor-style architecture inspired by Windsor Castle",
      "The audio guide is absolutely worth the extra cost",
      "Beautiful palace grounds are perfect for photos",
      "Open-air concerts happen in the grounds — check the schedule",
    ],
    upvotes: 29,
    downvotes: 4,
    addedBy: "system",
  },
  {
    name: "Nandi Hills",
    lat: 13.3702,
    lng: 77.6835,
    category: "adventure",
    tips: [
      "Leave by 4am to catch the sunrise — it's unforgettable",
      "Cycling up from the base is a popular challenge",
      "Paragliding is available on weekends near the hilltop",
      "Carry warm clothing even in summer — it gets chilly at the top",
    ],
    upvotes: 73,
    downvotes: 6,
    addedBy: "system",
  },
  {
    name: "Church Street",
    lat: 12.9756,
    lng: 77.6066,
    category: "nightlife",
    tips: [
      "Perfect starting point for a pub crawl",
      "Several venues host great live music nights",
      "Try craft beer at the microbreweries",
      "Street food stalls pop up late at night on weekends",
    ],
    upvotes: 45,
    downvotes: 7,
    addedBy: "system",
  },
  {
    name: "ISKCON Temple",
    lat: 13.0098,
    lng: 77.5511,
    category: "culture",
    tips: [
      "Evening aarti ceremony is a must-see experience",
      "The vegetarian canteen serves incredible thali meals",
      "Go on weekdays for a peaceful, uncrowded visit",
      "The temple complex has a great bookstore and gift shop",
    ],
    upvotes: 51,
    downvotes: 3,
    addedBy: "system",
  },
  {
    name: "Toit Brewpub",
    lat: 12.9784,
    lng: 77.6408,
    category: "nightlife",
    tips: [
      "Their Tintin Toit Belgian Wit is the crowd favourite",
      "Weekends get packed — arrive before 7pm for a table",
      "The pizza and beer combo is hard to beat",
      "They rotate seasonal craft beers — ask the bartender",
    ],
    upvotes: 58,
    downvotes: 9,
    addedBy: "system",
  },
  {
    name: "Bannerghatta Biological Park",
    lat: 12.8006,
    lng: 77.5771,
    category: "adventure",
    tips: [
      "The safari ride through the lion and tiger enclosures is thrilling",
      "Butterfly park is a hidden gem — don't skip it",
      "Go early to avoid afternoon heat and crowds",
      "Carry water and snacks — options inside are limited",
    ],
    upvotes: 34,
    downvotes: 5,
    addedBy: "system",
  },
  {
    name: "MTR — Mavalli Tiffin Rooms",
    lat: 12.9557,
    lng: 77.5786,
    category: "food",
    tips: [
      "The masala dosa here is iconic — a Bangalore institution since 1924",
      "Expect a queue on weekends but it moves fast",
      "Rava idli was invented here — you must try it",
      "Their filter coffee is among the best in the city",
    ],
    upvotes: 81,
    downvotes: 2,
    addedBy: "system",
  },
  {
    name: "Ulsoor Lake",
    lat: 12.9832,
    lng: 77.6195,
    category: "nature",
    tips: [
      "Boating in the evening is very relaxing",
      "Morning joggers love the path around the lake",
      "Great spot for sunset photography",
      "The nearby Ulsoor market is worth exploring after",
    ],
    upvotes: 27,
    downvotes: 4,
    addedBy: "system",
  },
  {
    name: "Chickpet Market",
    lat: 12.9666,
    lng: 77.5766,
    category: "shopping",
    tips: [
      "Wholesale silk sarees at unbeatable prices",
      "The old Bangalore charm is alive in these lanes",
      "Visit the century-old Dodda Ganapathi Temple nearby",
      "Go in the morning for the best selection",
    ],
    upvotes: 22,
    downvotes: 3,
    addedBy: "system",
  },
  {
    name: "Sankey Tank",
    lat: 13.0071,
    lng: 77.5721,
    category: "wellness",
    tips: [
      "One of the best sunset spots in Bangalore",
      "The walking trail around the tank is 1.5km — perfect for light exercise",
      "Early morning yoga groups welcome newcomers",
      "Bird watching is rewarding during winter months",
    ],
    upvotes: 31,
    downvotes: 2,
    addedBy: "system",
  },
  {
    name: "Vidhana Soudha",
    lat: 12.9793,
    lng: 77.5913,
    category: "culture",
    tips: [
      "The Neo-Dravidian architecture is stunning at night when illuminated",
      "Cannot enter — but the exterior and gardens are very photogenic",
      "Best viewed from the Cubbon Park side",
      "Sunday illumination is a Bangalore tradition",
    ],
    upvotes: 36,
    downvotes: 5,
    addedBy: "system",
  },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error("Set MONGODB_URI in your .env file first");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing places
    await Place.deleteMany({});
    console.log("Cleared existing places");

    // Insert seed data
    const result = await Place.insertMany(SEED_PLACES);
    console.log(`Seeded ${result.length} places successfully!`);

    result.forEach((p) => {
      console.log(`  ✓ ${p.name} (${p.category})`);
    });

    await mongoose.disconnect();
    console.log("\nDone! Database seeded.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
