"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/hooks"; // Import useAuth

// Pricing data array (same as before)
const pricingPlans = [
  {
    planId: "Free Trial",
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
    planId: "Basic",
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
    planId: "Standard",
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
    isPopular: true,
  },
  {
    planId: "Premium",
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

// Pricing card
const PricingCard = ({ plan, currentUserPlanId }) => {
  const {
    planId,
    title,
    price,
    currency,
    period,
    description,
    features,
    buttonText,
    isPopular,
  } = plan;

  const isCurrentPlan = currentUserPlanId === planId;
  const isFreeTrial = planId === "Free Trial";

  return (
    <motion.div
      className={`relative flex flex-col w-full max-w-sm rounded-xl border p-8 shadow-md transition-all duration-300
        ${isCurrentPlan ? "border-blue-500 bg-blue-950/50" : "border-gray-700 bg-gray-950"}
        ${isFreeTrial ? "opacity-70 cursor-not-allowed" : "hover:scale-105 hover:shadow-lg"}`}
      whileHover={isFreeTrial ? {} : { y: -5 }}
    >
      {/* Popular badge */}
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-200 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-900 shadow">
          Popular
        </div>
      )}

      {/* Current Plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
          Current Plan
        </div>
      )}

      {/* Title */}
      <h3 className="mb-4 text-center text-2xl font-semibold text-gray-100">
        {title}
      </h3>

      {/* Price */}
      <div className="flex items-baseline justify-center">
        <span className="text-4xl font-bold text-gray-100">{price}</span>
        <span className="ml-1 text-xl text-gray-400">{currency}</span>
      </div>
      <span className="block mt-1 text-center text-sm text-gray-400">
        {period}
      </span>
      <p className="mt-2 mb-6 text-center text-gray-300 flex-grow">{description}</p> {/* flex-grow for consistent height */}

      <div className="border-t border-gray-700"></div>

      {/* Features */}
      <ul className="mt-6 mb-6 space-y-3 flex-grow"> {/* flex-grow for consistent height */}
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
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
            <span className="ml-3 text-sm text-gray-300">{feature.text}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      {isFreeTrial ? (
        <button
          disabled
          className={`w-full text-center rounded-md border border-gray-600 bg-gray-800 py-3 text-sm font-medium text-gray-500 cursor-not-allowed`}
        >
          {buttonText}
        </button>
      ) : (
        <Link
          href={`/pricing/${planId}`}
          className={`w-full text-center rounded-md border py-3 text-sm font-medium transition-all duration-300
            ${isPopular ? "border-yellow-400 text-yellow-400 hover:bg-gray-900" : "border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700"}
            ${isCurrentPlan ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700" : ""}`}
        >
          {isCurrentPlan ? "Your Current Plan" : buttonText}
        </Link>
      )}
    </motion.div>
  );
};

// Main component
export default function PricingPage() {
  const { userData } = useAuth(); // Get userData from useAuth
  const currentUserPlanId = userData?.paymentInfo?.planId; // Get current user's planId

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6 font-sans antialiased">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-100 sm:text-5xl">
            Our Pricing Plans
          </h1>
          <p className="mt-4 text-gray-400">
            Choose the plan that fits your needs. Upgrade anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch"> {/* Use grid and items-stretch for consistent height */}
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} currentUserPlanId={currentUserPlanId} />
          ))}
        </div>
      </div>
    </div>
  );
}