"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PublicGalleryGrid } from "./PublicGalleryGrid";
import { usePublicGallery } from "./usePublicGallery";
const services = [
  { id: 1, label: "Shipping Agency", slug: "shipping-agency" },
  { id: 2, label: "Freight Forwarding", slug: "freight-forwarding" },
  { id: 3, label: "Chartering & Broking", slug: "chartering-broking" },
  { id: 4, label: "Total Logistics", slug: "total-logistics" },
];
export function FieldGallery() {
  const [selected, setSelected] = useState(1);
  const service = services.find((item) => item.id === selected)!;
  const gallery = usePublicGallery(selected);
  return (
    <section
      className="bg-background py-12 md:py-20"
      aria-label="Field Operations Gallery"
    >
      <div className="container">
        <header className="section-heading">
          <h2>
            Field Operations <span className="text-primary">Gallery</span>
          </h2>
          <p>Explore our operations across ports and facilities.</p>
        </header>
        <div
          className="mb-8 flex flex-wrap justify-center gap-2 md:gap-3"
          role="group"
          aria-label="Gallery service"
        >
          {services.map((item) => (
            <Button
              key={item.id}
              variant={selected === item.id ? "default" : "outline"}
              aria-pressed={selected === item.id}
              className="min-h-11 px-4"
              onClick={() => setSelected(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {gallery.loading ? (
          <div
            aria-label="Loading photos"
            aria-busy="true"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : gallery.error ? (
          <div
            role="alert"
            className="space-y-4 rounded-xl border p-8 text-center"
          >
            <p>{gallery.error}</p>
            <Button variant="outline" onClick={gallery.retry}>
              Try again
            </Button>
          </div>
        ) : gallery.images.length === 0 ? (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No photos available for {service.label} yet.
          </p>
        ) : (
          <>
            <PublicGalleryGrid images={gallery.images} />
            <div className="mt-8 flex justify-center">
              <Button asChild className="min-h-11">
                <Link href={`/services/${service.slug}#service-gallery`}>
                  View {service.label} gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
