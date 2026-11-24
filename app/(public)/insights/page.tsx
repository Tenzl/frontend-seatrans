import type { Metadata } from "next";
import InsightsClient from "./InsightsClient";

export const metadata: Metadata = {
  title: "Insights",
  description: "Industry insights and maritime updates from Seatrans.",
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    type: "website",
    url: "/insights",
    title: "Insights | Seatrans",
    description: "Industry insights and maritime updates from Seatrans.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights | Seatrans",
    description: "Industry insights and maritime updates from Seatrans.",
  },
};

export default async function Insights({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return <InsightsClient initialCategory={category ?? ""} />;
}
