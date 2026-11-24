"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  publicGalleryService,
  type GalleryCommodity,
} from "../../services/publicGalleryService";
import { PublicGalleryGrid } from "./PublicGalleryGrid";
import { usePublicGallery } from "./usePublicGallery";
export interface ServiceGalleryProps {
  serviceTypeId: number;
  gallery: {
    sectionTitle: string;
    sectionDescription: string;
    enabled: boolean;
    imageTypes?: { label: string; value: number }[];
  };
}
export function ServiceGallery({
  serviceTypeId,
  gallery,
}: ServiceGalleryProps) {
  const [selection, setSelection] = useState<{
    service: number;
    commodity?: number;
  }>({ service: serviceTypeId });
  const [catalog, setCatalog] = useState<{
      service: number;
      items: GalleryCommodity[];
      error: boolean;
    }>({ service: serviceTypeId, items: [], error: false }),
    [catalogRetry, setCatalogRetry] = useState(0);
  const commodities = catalog.service === serviceTypeId ? catalog.items : [];
  const commodity =
    selection.service === serviceTypeId ? selection.commodity : undefined;
  const images = usePublicGallery(serviceTypeId, commodity);
  useEffect(() => {
    const controller = new AbortController();
    publicGalleryService
      .listCommodities(serviceTypeId, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted)
          setCatalog({ service: serviceTypeId, items, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setCatalog({ service: serviceTypeId, items: [], error: true });
      });
    return () => controller.abort();
  }, [serviceTypeId, catalogRetry]);
  if (!gallery.enabled) return null;
  return (
    <section
      id="service-gallery"
      className="scroll-mt-24 bg-background py-8 md:py-12"
      aria-label={gallery.sectionTitle}
    >
      <header className="mx-auto mb-6 max-w-2xl space-y-3 text-center md:mb-8">
        <h2 className="text-2xl font-bold md:text-4xl">
          {gallery.sectionTitle}
        </h2>
        <p className="text-muted-foreground">{gallery.sectionDescription}</p>
      </header>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <label className="flex max-w-full flex-wrap items-center gap-2 text-sm font-semibold">
          Commodity
          <select
            aria-label="Filter gallery by commodity"
            value={commodity ?? ""}
            onChange={(event) =>
              setSelection({
                service: serviceTypeId,
                commodity: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            className="h-11 max-w-full rounded-lg border border-input bg-background px-3 text-base font-normal"
          >
            <option value="">All commodities</option>
            {commodities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName || item.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted-foreground">
          {images.loading
            ? "Loading photos..."
            : images.error
              ? ""
              : `${images.total} photos`}
        </p>
      </div>
      {catalog.service === serviceTypeId && catalog.error && (
        <p role="alert" className="mb-4 text-sm text-muted-foreground">
          Could not load commodity filters.{" "}
          <Button
            variant="link"
            onClick={() => setCatalogRetry((current) => current + 1)}
          >
            Retry filters
          </Button>
        </p>
      )}
      {images.loading ? (
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
      ) : images.error ? (
        <div
          role="alert"
          className="space-y-4 rounded-xl border p-8 text-center"
        >
          <p>{images.error}</p>
          <Button variant="outline" onClick={images.retry}>
            Try again
          </Button>
        </div>
      ) : images.images.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No photos available for this selection.
        </p>
      ) : (
        <PublicGalleryGrid images={images.images} />
      )}
      {!images.loading && !images.error && images.pages > 1 && (
        <nav
          aria-label="Gallery pages"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous gallery page"
            disabled={images.page === 0}
            onClick={() => images.setPage(images.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {images.page + 1} of {images.pages}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next gallery page"
            disabled={images.page + 1 >= images.pages}
            onClick={() => images.setPage(images.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </section>
  );
}
