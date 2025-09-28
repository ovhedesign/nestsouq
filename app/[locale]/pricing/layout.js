export const metadata = {
  title: "Netsouq Pricing - Affordable Plans for Everyone",
  description:
    "Explore Netsouq's flexible pricing plans. From our free trial to premium features, find the perfect fit for your needs and budget. Get started today!",
  keywords:
    "Netsouq, pricing, plans, subscription, cost, affordable, premium, free trial",
  openGraph: {
    title: "Netsouq Pricing - Affordable Plans for Everyone",
    description:
      "Explore Netsouq's flexible pricing plans and find the perfect fit for your needs.",
    url: "https://netsouq.com/pricing",
    type: "website",
    images: [
      {
        url: "https://netsouq.com/social-image.png",
        width: 800,
        height: 600,
        alt: "Netsouq Pricing Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Netsouq Pricing - Affordable Plans for Everyone",
    description:
      "Explore Netsouq's flexible pricing plans and find the perfect fit for your needs.",
    image: "https://netsouq.com/social-image.png",
  },
};

export default function PricingLayout({ children }) {
  return children;
}
