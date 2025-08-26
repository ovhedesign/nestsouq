"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { FaWhatsapp, FaHome } from "react-icons/fa";

// Define your pricing plans
const getPricingPlans = (tCard) => [
  {
    planId: "Free Trial",
    title: tCard("freeTrialTitle"),
    price: "0",
    currency: "$",
    period: tCard("freeTrialPeriod"),
    description: tCard("freeTrialDescription"),
    features: [
      { text: tCard("freeTrialFeature1"), included: true },
      { text: tCard("freeTrialFeature2"), included: true },
    ],
    buttonText: tCard("startFreeTrialButton"),
    isPopular: false,
  },
  {
    planId: "Basic",
    title: tCard("basicTitle"),
    price: "5",
    currency: "$",
    period: tCard("basicPeriod"),
    description: tCard("basicDescription"),
    features: [
      { text: tCard("basicFeature1"), included: true },
      { text: tCard("basicFeature2"), included: true },
    ],
    buttonText: tCard("chooseBasicButton"),
    isPopular: false,
  },
  {
    planId: "Standard",
    title: tCard("standardTitle"),
    price: "9",
    currency: "$",
    period: tCard("standardPeriod"),
    description: tCard("standardDescription"),
    features: [
      { text: tCard("standardFeature1"), included: true },
      { text: tCard("standardFeature2"), included: true },
    ],
    buttonText: tCard("chooseStandardButton"),
    isPopular: true,
  },
  {
    planId: "Premium",
    title: tCard("premiumTitle"),
    price: "15",
    currency: "$",
    period: tCard("premiumPeriod"),
    description: tCard("premiumDescription"),
    features: [
      { text: tCard("premiumFeature1"), included: true },
      { text: tCard("premiumFeature2"), included: true },
    ],
    buttonText: tCard("choosePremiumButton"),
    isPopular: false,
  },
];

// Pricing card component
const PricingCard = ({ plan, currentUserPlanId, tCard }) => {
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
        ${
          isCurrentPlan
            ? "border-blue-500 bg-blue-950/50"
            : "border-gray-700 bg-gray-950"
        }
        ${
          isFreeTrial
            ? "opacity-70 cursor-not-allowed"
            : "hover:scale-105 hover:shadow-lg"
        }`}
      whileHover={isFreeTrial ? {} : { y: -5 }}
    >
      {isPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-black shadow">
          {tCard("popular")}
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
          {tCard("currentPlan")}
        </div>
      )}

      <h3 className="mb-4 text-center text-2xl font-semibold text-gray-100">
        {title}
      </h3>

      <div className="flex items-baseline justify-center">
        <span className="text-4xl font-bold text-gray-100">{price}</span>
        <span className="ml-1 text-xl text-gray-400">{currency}</span>
      </div>
      <span className="block mt-1 text-center text-sm text-gray-400">
        {period}
      </span>
      <p className="mt-2 mb-6 text-center text-gray-300 flex-grow">
        {description}
      </p>

      <div className="border-t border-gray-700"></div>

      <ul className="mt-6 mb-6 space-y-3 flex-grow">
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

      {isFreeTrial ? (
        <button
          disabled
          className="w-full rounded-md border border-gray-600 bg-gray-800 py-3 text-sm font-medium text-gray-500 cursor-not-allowed"
        >
          {buttonText}
        </button>
      ) : (
        <Link
          href={`/pricing/${planId}`}
          className={`w-full text-center rounded-md border py-3 text-sm font-medium transition-all duration-300
            ${
              isPopular
                ? "border-yellow-400 text-yellow-400 hover:bg-gray-900"
                : "border-gray-600 bg-gray-800 text-gray-100 hover:bg-gray-700"
            }
            ${
              isCurrentPlan
                ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                : ""
            }`}
        >
          {isCurrentPlan ? tCard("yourCurrentPlan") : buttonText}
        </Link>
      )}
    </motion.div>
  );
};

// Main Pricing Page
export default function PricingPage() {
  const { userData } = useAuth();
  const currentUserPlanId = userData?.paymentInfo?.planId;
  const tPricing = useTranslations("Pricing");
  const tCard = useTranslations("PricingCard");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-900 p-6 font-sans antialiased">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-100 sm:text-5xl">
            {tPricing("ourPricingPlans")}
          </h1>
          <p className="mt-4 text-gray-400">{tPricing("pricingDescription")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {getPricingPlans(tCard).map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              currentUserPlanId={currentUserPlanId}
              tCard={tCard}
            />
          ))}
        </div>
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        {/* WhatsApp button */}
        <a
          href="https://wa.me/+9660534115524"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp size={24} />
        </a>

        {/* Return to Homepage button */}
        <Link
          href="/"
          className="flex items-center justify-center w-14 h-14 bg-orange-400 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300"
          title="Return to Homepage"
        >
          <FaHome size={20} />
        </Link>
      </div>
    </div>
  );
}
