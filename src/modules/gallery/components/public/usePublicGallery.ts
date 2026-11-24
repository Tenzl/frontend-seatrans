import { useEffect, useState } from "react";
import {
  publicGalleryService,
  type PublicGalleryImage,
} from "../../services/publicGalleryService";
export function usePublicGallery(serviceTypeId: number, commodityId?: number) {
  const scope = `${serviceTypeId}:${commodityId ?? "all"}`;
  const [location, setLocation] = useState({ scope, page: 0 }),
    [retryKey, setRetryKey] = useState(0);
  const page = location.scope === scope ? location.page : 0;
  const [result, setResult] = useState<{
    key: string;
    images: PublicGalleryImage[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
  }>({ key: "", images: [], total: 0, pages: 0, loading: true, error: null });
  const key = `${scope}:${page}:${retryKey}`;
  useEffect(() => {
    const controller = new AbortController();
    setResult({
      key,
      images: [],
      total: 0,
      pages: 0,
      loading: true,
      error: null,
    });
    publicGalleryService
      .listPublicImages(
        { serviceTypeId, commodityId, page, size: 6 },
        controller.signal,
      )
      .then((data) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            images: data.content,
            total: data.totalElements,
            pages: data.totalPages,
            loading: false,
            error: null,
          });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            images: [],
            total: 0,
            pages: 0,
            loading: false,
            error:
              error instanceof Error ? error.message : "Could not load photos.",
          });
      });
    return () => controller.abort();
  }, [serviceTypeId, commodityId, page, key]);
  const active =
    result.key === key
      ? result
      : { images: [], total: 0, pages: 0, loading: true, error: null };
  return {
    ...active,
    page,
    setPage: (next: number) => setLocation({ scope, page: next }),
    retry: () => setRetryKey((current) => current + 1),
  };
}
