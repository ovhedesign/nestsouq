import dotenv from 'dotenv'; dotenv.config();
import { getDb } from '../lib/mongodb-admin.js';

const pricingPlans = [
  {
    title: "Free Trial",
    price: "0",
    currency: "$",
    period: "",
    description: "7 days access",
    features: [
      { text: "5 images/day", included: true },
      { text: "Limited access", included: true },
      { text: "Watermarked outputs (optional)", included: true },
    ],
    buttonText: "Start Free Trial",
    isPopular: false,
  },
  {
    title: "Basic",
    price: "5",
    currency: "$",
    period: "/month",
    description: "1,000 images / 1 month",
    features: [
      { text: "Full access", included: true },
      { text: "Standard API speed", included: true },
    ],
    buttonText: "Choose Basic",
    isPopular: false,
  },
  {
    title: "Standard",
    price: "9",
    currency: "$",
    period: "/month (recurring)",
    description: "2,500 images",
    features: [
      { text: "Full access", included: true },
      { text: "Faster API processing", included: true },
    ],
    buttonText: "Choose Standard",
    isPopular: true, // Highlight Standard as "Popular"
  },
  {
    title: "Premium",
    price: "15",
    currency: "$",
    period: "/month (recurring)",
    description: "5,000 images",
    features: [
      { text: "Full access", included: true },
      { text: "Fast API & higher concurrency", included: true },
    ],
    buttonText: "Choose Premium",
    isPopular: false,
  },
];

async function seedPlans() {
  try {
    const db = await getDb();
    const collection = db.collection('plans');

    // Optional: Clear existing plans before inserting
    await collection.deleteMany({});
    console.log('Cleared existing plans.');

    const result = await collection.insertMany(pricingPlans);
    console.log(`${result.insertedCount} plans inserted successfully.`);
  } catch (error) {
    console.error('Error seeding plans:', error);
  } finally {
    // It's good practice to close the connection if it's not managed by Next.js
    // However, getDb() might return a cached connection, so direct close might not be needed.
    // For a script, it's safer to ensure the process exits.
    process.exit(0);
  }
}

seedPlans();
