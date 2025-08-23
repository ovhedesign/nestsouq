"use client";
import React from "react";
import { motion } from "framer-motion";

// Pricing data array for easy content management
const pricingPlans = [
  {
    title: "Free",
    price: "0",
    currency: "Tk",
    period: "",
    description: "Limited features to get started",
    features: [
      { text: "15 Credits Lifetime Limit", included: true },
      { text: "Basic Image to Prompt Features", included: true },
      { text: "Limited Access to Metadata Customization", included: true },
      { text: "More Fast Processing", included: false },
      { text: "Fully Custom Support", included: false },
      { text: "All Future Features", included: false },
    ],
    buttonText: "Current Plan",
    isPopular: false,
  },
  {
    title: "Premium",
    price: "700",
    currency: "Tk",
    period: "/Yearly",
    description: "All features, unlimited access",
    features: [
      { text: "Unlimited Metadata Generation", included: true },
      { text: "Full Image to Prompt Features", included: true },
      { text: "Full Access to Metadata Customization", included: true },
      { text: "More Fast Processing", included: true },
      { text: "Fully Custom Support", included: true },
      { text: "All Future Features", included: true },
    ],
    buttonText: "Upgrade to Premium",
    isPopular: true,
  },
  {
    title: "Basic",
    price: "200",
    currency: "Tk",
    period: "/Month",
    description: "All features, monthly access",
    features: [
      { text: "Unlimited Metadata Generation", included: true },
      { text: "Full Image to Prompt Features", included: true },
      { text: "Full Access to Metadata Customization", included: true },
      { text: "More Fast Processing", included: false },
      { text: "Fully Custom Support", included: false },
      { text: "All Future Features", included: false },
    ],
    buttonText: "Upgrade to Basic",
    isPopular: false,
  },
];

// Helper component for a single pricing card
const PricingCard = ({ plan }) => {
  const {
    title,
    price,
    currency,
    period,
    description,
    features,
    buttonText,
    isPopular,
  } = plan;

  return (
    <motion.div
      className={`relative w-full max-w-sm rounded-2xl p-6 shadow-xl transition-all duration-300 ${
        isPopular ? "bg-slate-700" : "bg-gray-800"
      } hover:scale-105 hover:shadow-2xl`}
      whileHover={{ y: -8 }}
    >
      {/* "Popular" badge for the premium card */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-yellow-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
          Popular
        </div>
      )}

      {/* Plan title and price */}
      <h3 className="mb-2 text-center text-2xl font-bold tracking-tight text-white">
        {title}
      </h3>
      <div className="flex items-center justify-center">
        <span className="text-4xl font-extrabold text-white">{price}</span>
        <span className="ml-2 text-xl font-medium text-gray-400">
          {currency}
        </span>
        <span className="ml-1 text-sm text-gray-400">{period}</span>
      </div>
      <p className="mt-2 text-center text-sm font-medium text-red-400">
        {description}
      </p>

      <div className="my-6 border-b border-gray-600"></div>

      {/* Feature list */}
      <ul className="mb-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {feature.included ? (
              <svg
                className="h-5 w-5 flex-shrink-0 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`ml-3 text-sm font-medium ${
                feature.included ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* Button with conditional styling */}
      <button
        className={`w-full rounded-lg py-3 px-6 text-sm font-semibold transition-all duration-300 ${
          isPopular
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:scale-105"
            : "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:scale-105"
        }`}
      >
        {buttonText}
      </button>
    </motion.div>
  );
};

// Main component for the pricing page
export default function PricingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4 font-sans antialiased">
      <div className="container max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose Your Plan
          </h1>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:gap-12">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}
