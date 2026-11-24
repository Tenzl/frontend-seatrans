"use client";
import { Eye } from "lucide-react";
import { ImageWithFallback } from "@/shared/components/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  galleryImageUrl,
  type PublicGalleryImage,
} from "../../services/publicGalleryService";
export function PublicGalleryGrid({
  images,
}: {
  images: PublicGalleryImage[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <Dialog key={image.id}>
          <article className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
            <DialogTrigger asChild>
              <button
                type="button"
                className="group relative block aspect-[4/3] w-full overflow-hidden bg-muted text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`View ${image.commodityName} at ${image.portName || "port"}`}
              >
                <ImageWithFallback
                  src={galleryImageUrl(image.imageUrl)}
                  alt={[image.commodityName, image.portName]
                    .filter(Boolean)
                    .join(" at ")}
                  width={800}
                  height={600}
                  sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw"
                  className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground">
                  <Eye className="h-3.5 w-3.5" aria-hidden />
                  View
                </span>
              </button>
            </DialogTrigger>
            <div className="space-y-1 p-4">
              <h3
                className="truncate text-base font-semibold"
                title={image.commodityName}
              >
                {image.commodityName}
              </h3>
              <p
                className="truncate text-sm text-muted-foreground"
                title={[image.portName, image.provinceName]
                  .filter(Boolean)
                  .join(", ")}
              >
                {[image.portName, image.provinceName]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </article>
          <DialogContent className="max-w-5xl">
            <DialogTitle>{image.commodityName}</DialogTitle>
            <DialogDescription>
              {[image.portName, image.provinceName, image.commodityTypeName]
                .filter(Boolean)
                .join(", ")}
            </DialogDescription>
            <ImageWithFallback
              src={galleryImageUrl(image.imageUrl, "full")}
              alt={image.commodityName}
              width={1600}
              height={1100}
              sizes="100vw"
              className="max-h-[75vh] h-auto w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
