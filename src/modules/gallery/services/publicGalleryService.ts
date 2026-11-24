import { apiClient } from "@/shared/utils/apiClient";
import type { ApiResponse, PageResponse } from "@/shared/types/api.types";
import { API_CONFIG } from "@/shared/config/api.config";

export interface PublicGalleryImage {
  id: number;
  imageUrl: string;
  serviceTypeId: number;
  commodityId: number;
  commodityName: string;
  commodityTypeId?: number | null;
  commodityTypeName?: string | null;
  portId?: number | null;
  portName?: string | null;
  provinceId?: number | null;
  provinceName?: string | null;
  uploadedAt?: string;
}
export interface PublicGalleryQuery {
  serviceTypeId: number;
  commodityId?: number;
  page?: number;
  size?: number;
}
export interface GalleryCommodity {
  id: number;
  name: string;
  displayName: string;
  serviceTypeId: number;
}
export const publicGalleryService = {
  async listPublicImages(
    query: PublicGalleryQuery,
    signal?: AbortSignal,
  ): Promise<PageResponse<PublicGalleryImage>> {
    const params = new URLSearchParams({
      serviceTypeId: String(query.serviceTypeId),
      page: String(query.page ?? 0),
      size: String(query.size ?? 6),
    });
    if (query.commodityId) params.set("commodityId", String(query.commodityId));
    const response = await apiClient.get<
      ApiResponse<PageResponse<PublicGalleryImage>>
    >(`${API_CONFIG.GALLERY.IMAGES}?${params}`, {
      skipAuth: true,
      cache: "no-store",
      signal,
    });
    const result = await response.json();
    if (
      !response.ok ||
      result.success === false ||
      !Array.isArray(result.data?.content) ||
      !Number.isFinite(result.data.totalElements) ||
      !Number.isFinite(result.data.totalPages)
    )
      throw new Error("Could not load photos. Please try again.");
    return result.data;
  },
  async listCommodities(
    serviceTypeId: number,
    signal?: AbortSignal,
  ): Promise<GalleryCommodity[]> {
    const params = new URLSearchParams({
      serviceTypeId: String(serviceTypeId),
      limit: "100",
    });
    const response = await apiClient.get<ApiResponse<GalleryCommodity[]>>(
      `/commodities?${params}`,
      { skipAuth: true, signal },
    );
    const result = await response.json();
    if (!response.ok || result.success === false || !Array.isArray(result.data))
      throw new Error("Could not load commodities.");
    return result.data;
  },
};
export function galleryImageUrl(
  url: string,
  variant: "card" | "full" = "card",
) {
  if (!url) return "/placeholder.svg";
  const normalized = url.replace(/\\/g, "/");
  const resolved = /^https?:\/\//i.test(normalized)
    ? normalized
    : `${API_CONFIG.ASSET_BASE_URL}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
  if (
    !/^https:\/\/res\.cloudinary\.com\//i.test(resolved) ||
    !resolved.includes("/image/upload/")
  )
    return resolved;
  const [prefix, ...parts] = resolved.split("/image/upload/"),
    tail = parts.join("/image/upload/");
  const first = tail.split("/")[0];
  const source =
    /^(?:[a-z]+_[^,/\s]+(?:,[a-z]+_[^,/\s]+)*)$/i.test(first) &&
    !first.startsWith("v")
      ? tail.slice(first.length + 1)
      : tail;
  return `${prefix}/image/upload/f_auto,q_auto,${variant === "card" ? "w_800," : ""}c_limit/${source}`;
}
