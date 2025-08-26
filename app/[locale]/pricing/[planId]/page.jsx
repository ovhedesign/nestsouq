"use client";
import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FaCheck } from "react-icons/fa";

const PlanPage = () => {
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const { planId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const tPricing = useTranslations("Pricing");
  const tCard = useTranslations("PricingCard");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [user, authLoading, router]);

  // Fetch plans
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        const data = await res.json();
        if (data.success) {
          setAllPlans(data.data);
          const selected = data.data.find(
            (p) => p.planId.toLowerCase() === planId.toLowerCase()
          );
          setPlan(selected);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      }
      setLoading(false);
    };

    fetchPlans();
  }, [planId, user, authLoading]);

  const createOrder = async () => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.planId }),
    });
    const data = await res.json();
    return data.orderID;
  };

  const onApprove = async (data) => {
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: data.orderID,
          uid: user.id,
          planId: plan.planId,
          planPrice: plan.price,
          planDurationDays: plan.durationDays,
        }),
      });

      if (res.ok) router.push("/");
      else {
        const errorData = await res.json();
        console.error("Failed to capture order:", errorData.message);
      }
    } catch (error) {
      console.error("Error capturing order:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 to-gray-800 p-6">
        <div className="space-y-4 w-full max-w-md animate-pulse">
          <div className="h-10 bg-gray-700 rounded-md"></div>
          <div className="h-6 bg-gray-700 rounded-md"></div>
          <div className="h-64 bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 to-gray-800 text-white">
        <h1 className="text-2xl">
          {tCard("planNotFound") || "Plan not found"}
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-950 to-gray-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl font-extrabold mb-4">
          {tPricing("ourPricingPlans")}
        </h1>
        <p className="text-gray-300 text-lg">
          {tPricing("pricingDescription")}
        </p>
      </motion.div>

      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white text-black rounded-2xl shadow-2xl p-8 relative overflow-hidden"
        >
          {/* Ribbon / Highlight */}
          {plan.planId === "Standard" && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold text-sm animate-pulse">
              {tCard("popular")}
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-5xl font-bold mb-2">
              ${plan.price}
              <span className="text-lg">/{plan.period || "mo"}</span>
            </p>
            <p className="text-gray-700 text-sm">{plan.description}</p>
          </div>

          <ul className="grid grid-cols-1 gap-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <FaCheck className="text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {plan.planId === "Free Trial" ? (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-gray-700 text-gray-300 cursor-not-allowed font-semibold text-lg hover:scale-105 transition-transform"
            >
              {tCard("startFreeTrialButton")}
            </button>
          ) : (
            <PayPalScriptProvider
              options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                currency: "USD",
              }}
            >
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "paypal",
                  height: 50,
                }}
              />
            </PayPalScriptProvider>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PlanPage;
