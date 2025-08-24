"use client";
import React, { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks"; // Assuming you have a useAuth hook

const PlanPage = () => {
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { planId } = useParams();
  const router = useRouter();
  const { user } = useAuth(); // Get user from your auth hook

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        const data = await res.json();
        if (data.success) {
          setAllPlans(data.data);
          console.log("API Response Data:", data);
          console.log("planId from useParams (before find):", planId);
          console.log("Plans data (before find):");
          data.data.forEach((p) =>
            console.log(`  Plan ID: ${p.planId}, _id: ${p._id}`)
          );

          const selected = data.data.find(
            (p) => p.planId.toLowerCase() === planId.toLowerCase()
          );
          console.log("Selected Plan (after find):", selected);
          setPlan(selected);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      }
      setLoading(false);
    };

    fetchPlans();
  }, [planId]);

  const createOrder = async () => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.planId }),
    });
    const data = await res.json();

    // Return PayPal order ID
    return data.id;
  };

  const onApprove = async (data) => {
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: data.orderID,
          userId: user.id, // Assuming user.id is available from useAuth()
          planId: plan._id, // Assuming plan._id is available from fetched plan
        }),
      });

      if (res.ok) {
        router.push("/"); // Redirect to homepage
      } else {
        const errorData = await res.json();
        console.error("Failed to capture order:", errorData.message);
        // Handle error, e.g., show a message to the user
      }
    } catch (error) {
      console.error("Error capturing order:", error);
    }
  };

  if (!plan) {
    return <div>Plan not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Selected Plan: {plan.name}
      </h1>
      <div className="max-w-md mx-auto mb-8">
        <div className="bg-gray-800 border-2 border-blue-500 shadow-lg rounded-lg p-6">
          <p className="text-4xl font-bold mb-4">
            ${plan.price}
            <span className="text-lg">/mo</span>
          </p>
          <ul className="space-y-2 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-green-500">✔</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <PayPalScriptProvider
            options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}
          >
            <PayPalButtons createOrder={createOrder} onApprove={onApprove} />
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  );
};

export default PlanPage;
