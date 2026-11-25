"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Search, Ship } from "lucide-react";
import { categoryService } from "@/modules/categories/services/categoryService";
import {
  postService,
  type CategoryResponse,
  type Post,
  type PostsPage,
} from "@/modules/posts/services/postService";

const PAGE_SIZE = 9;

function dateLabel(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function postImage(post: Post) {
  return post.thumbnailUrl?.trim() || null;
}

function authorName(post: Post) {
  return post.authorName?.trim() || post.author?.fullName?.trim() || "Seatrans";
}

function authorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function PostByline({ post }: { post: Post }) {
  const name = authorName(post);
  const date = post.publishedAt || post.createdAt;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f0f9] text-xs font-bold text-[#20518e]"
      >
        {authorInitials(name)}
      </span>
      <div className="min-w-0 text-sm leading-5">
        <p className="truncate font-semibold text-foreground">{name}</p>
        {date && (
          <time dateTime={date} className="text-muted-foreground">
            {dateLabel(date)}
          </time>
        )}
      </div>
    </div>
  );
}

function PostVisual({
  post,
  priority = false,
}: {
  post: Post;
  priority?: boolean;
}) {
  const src = postImage(post);
  return src ? (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      unoptimized
      sizes={
        priority
          ? "(min-width: 1024px) 58vw, 100vw"
          : "(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
      }
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
    />
  ) : (
    <div
      className="absolute inset-0 flex items-end justify-between bg-[#e8f0f9] p-5 text-[#20518e]"
      aria-hidden="true"
    >
      <span className="text-sm font-semibold tracking-[-0.02em]">Seatrans</span>
      <Ship className="h-12 w-12 text-[#84a9d0]" strokeWidth={1.2} />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-200 hover:shadow-md focus-within:shadow-md">
      <Link
        href={`/insights/${post.id}`}
        className="flex h-full flex-col rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#e8f0f9]">
          <PostVisual post={post} />
          {post.readingTime && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <span className="w-fit rounded-md bg-[#e8f0f9] px-2.5 py-1 text-xs font-semibold text-[#20518e]">
            {post.categories?.[0]?.name || "Insight"}
          </span>
          <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary group-focus-within:text-primary">
            {post.title}
          </h3>
          {post.summary && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {post.summary}
            </p>
          )}
          <div className="mt-auto flex items-end justify-between gap-3 pt-7">
            <PostByline post={post} />
            <ArrowRight
              className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1 group-focus-within:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

export function PostsPage({
  initialCategory = "",
}: {
  initialCategory?: string;
}) {
  const [featured, setFeatured] = useState<Post | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoryError, setCategoryError] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<PostsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      postService.getLatestPosts(1),
      categoryService.getAllCategories(),
    ]).then(([latest, list]) => {
      if (!active) return;
      if (latest.status === "fulfilled") setFeatured(latest.value[0] ?? null);
      if (list.status === "fulfilled") {
        setCategories(list.value);
        setCategoryError(false);
      } else setCategoryError(true);
    });
    const onPopState = () =>
      setCategory(
        new URLSearchParams(window.location.search).get("category") ?? "",
      );
    window.addEventListener("popstate", onPopState);
    return () => {
      active = false;
      window.removeEventListener("popstate", onPopState);
    };
  }, [retryKey]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    postService
      .getPublishedPostsPage(
        { page, size: PAGE_SIZE, category, q: debouncedSearch },
        controller.signal,
      )
      .then(setResults)
      .catch((cause) => {
        if (cause?.name !== "AbortError") setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, category, debouncedSearch, retryKey]);

  const lead =
    !category && !debouncedSearch && page === 0
      ? (featured ?? results?.content[0] ?? null)
      : null;
  const posts = (results?.content ?? []).filter((post) => post.id !== lead?.id);
  const changeCategory = (slug: string) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("category", slug);
    else url.searchParams.delete("category");
    window.history.pushState(null, "", url);
    setCategory(slug);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container pt-12 md:pt-20">
        <header className="mb-10 max-w-3xl md:mb-12">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Insights from Seatrans
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            News and perspectives from our work in maritime logistics.
          </p>
        </header>

        {lead && (
          <section className="mb-14 md:mb-16" aria-label="Latest story">
            <Link
              href={`/insights/${lead.id}`}
              className="group grid overflow-hidden rounded-2xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 md:grid-cols-2"
            >
              <div className="relative min-h-[250px] overflow-hidden bg-[#e8f0f9] sm:min-h-[330px] md:min-h-[400px]">
                <PostVisual post={lead} priority />
                {lead.readingTime && (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {lead.readingTime} min read
                  </span>
                )}
              </div>
              <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
                <span className="w-fit rounded-md bg-[#e8f0f9] px-3 py-1.5 text-xs font-semibold text-[#20518e]">
                  {lead.categories?.[0]?.name || "Insight"}
                </span>
                <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.025em] transition-colors group-hover:text-primary group-focus-within:text-primary sm:text-3xl lg:text-4xl">
                  {lead.title}
                </h2>
                {lead.summary && (
                  <p className="mt-4 line-clamp-3 leading-7 text-muted-foreground">
                    {lead.summary}
                  </p>
                )}
                <div className="mt-7">
                  <PostByline post={lead} />
                </div>
                <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  Read article
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 group-focus-within:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          </section>
        )}

        <section className="pb-20 md:pb-28" aria-labelledby="all-insights">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h2
                id="all-insights"
                className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl"
              >
                All insights
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Explore our latest published articles.
              </p>
            </div>
            <label className="relative block w-full md:w-80">
              <span className="sr-only">Search articles</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder="Search articles"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
          </div>
          <div
            className="flex flex-wrap gap-2 pb-8 pt-6"
            aria-label="Filter by category"
          >
            <button
              type="button"
              onClick={() => changeCategory("")}
              aria-pressed={!category}
              className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"}`}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeCategory(item.slug)}
                aria-pressed={category === item.slug}
                className={`shrink-0 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${category === item.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {categoryError && (
            <p className="pb-4 text-sm text-muted-foreground">
              Categories are unavailable.{" "}
              <button
                type="button"
                className="font-medium text-primary underline"
                onClick={() => setRetryKey((value) => value + 1)}
              >
                Retry
              </button>
            </p>
          )}
          {loading ? (
            <div
              className="grid gap-8 pt-4 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading articles"
            >
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[16/10] rounded-t-2xl bg-muted" />
                  <div className="mt-5 h-4 w-24 bg-muted" />
                  <div className="mt-3 h-6 w-4/5 bg-muted" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p>Articles could not be loaded.</p>
              <button
                type="button"
                className="mt-4 text-primary underline"
                onClick={() => setRetryKey((value) => value + 1)}
              >
                Try again
              </button>
            </div>
          ) : posts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <h3 className="text-xl font-semibold">
                {lead &&
                !category &&
                !debouncedSearch &&
                (results?.totalElements ?? 0) === 1
                  ? "More stories coming soon"
                  : "No articles found"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {lead &&
                !category &&
                !debouncedSearch &&
                (results?.totalElements ?? 0) === 1
                  ? "Explore the latest story above."
                  : "Try another category or search term."}
              </p>
            </div>
          )}
          {(results?.totalPages ?? 0) > 1 && (
            <nav
              aria-label="Article pages"
              className="mt-12 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {results?.totalPages}
              </span>
              <button
                type="button"
                disabled={!results?.hasNext}
                onClick={() => setPage(page + 1)}
                className="rounded-md border px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
