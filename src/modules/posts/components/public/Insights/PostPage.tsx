"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, Ship } from "lucide-react";
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
      sizes={
        priority
          ? "(min-width: 1024px) 58vw, 100vw"
          : "(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
      }
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  ) : (
    <div
      className="absolute inset-0 flex items-end justify-between bg-[#123b6b] p-5 text-white"
      aria-hidden="true"
    >
      <span className="text-sm font-semibold tracking-[-0.02em]">Seatrans</span>
      <Ship className="h-12 w-12 text-white/70" strokeWidth={1.2} />
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="group min-w-0 border-b border-border pb-7">
      <Link
        href={`/insights/${post.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#123b6b]">
          <PostVisual post={post} />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted-foreground">
          <span className="text-primary">
            {post.categories?.[0]?.name || "Insight"}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.publishedAt || post.createdAt}>
            {dateLabel(post.publishedAt || post.createdAt)}
          </time>
        </div>
        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.02em] text-foreground group-hover:text-primary">
          {post.title}
        </h3>
        {post.summary && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {post.summary}
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Read article{" "}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
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
    featured ??
    (!category && !debouncedSearch && page === 0 ? results?.content[0] : null);
  const posts = (results?.content ?? []).filter(
    (post) => category || debouncedSearch || page !== 0 || post.id !== lead?.id,
  );
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
      <header className="border-b border-border bg-[#0d3159] text-white">
        <div className="container py-16 md:py-24">
          <Link
            href="/"
            className="text-sm text-blue-100 underline-offset-4 hover:underline"
          >
            Seatrans / Home
          </Link>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.03em] md:text-7xl">
            Insights
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            News and perspectives from our work in maritime logistics.
          </p>
        </div>
      </header>

      {lead && (
        <section className="container py-12 md:py-16" aria-label="Latest story">
          <Link
            href={`/insights/${lead.id}`}
            className={`group overflow-hidden bg-[#0d3159] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 ${postImage(lead) ? "grid lg:grid-cols-[1.2fr_1fr]" : "block"}`}
          >
            {postImage(lead) && (
              <div className="relative min-h-[260px] overflow-hidden bg-[#123b6b] md:min-h-[400px]">
                <PostVisual post={lead} priority />
              </div>
            )}
            <div
              className={`flex flex-col justify-end p-7 md:p-12 ${postImage(lead) ? "" : "min-h-[280px] max-w-4xl md:min-h-[360px]"}`}
            >
              <div className="text-sm text-blue-100">
                {lead.categories?.[0]?.name || "Insight"} ·{" "}
                {dateLabel(lead.publishedAt || lead.createdAt)}
              </div>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.025em] md:text-5xl">
                {lead.title}
              </h2>
              {lead.summary && (
                <p className="mt-5 line-clamp-3 max-w-lg leading-7 text-blue-100">
                  {lead.summary}
                </p>
              )}
              <span className="mt-8 inline-flex items-center gap-2 font-semibold">
                Read the latest{" "}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section
        className="container pb-20 md:pb-28"
        aria-labelledby="all-insights"
      >
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-6 md:flex-row md:items-end">
          <div>
            <h2
              id="all-insights"
              className="text-3xl font-semibold tracking-[-0.02em]"
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
              className="w-full rounded-md border border-input bg-background py-2.5 pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </label>
        </div>
        <div
          className="flex gap-2 overflow-x-auto py-5"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => changeCategory("")}
            aria-pressed={!category}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => changeCategory(item.slug)}
              aria-pressed={category === item.slug}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${category === item.slug ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        {categoryError && (
          <p className="pb-4 text-sm text-muted-foreground">
            Categories are unavailable. <button type="button" className="font-medium text-primary underline" onClick={() => setRetryKey((value) => value + 1)}>Retry</button>
          </p>
        )}
        {loading ? (
          <div
            className="grid gap-8 pt-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading articles"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[16/10] bg-muted" />
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
          <div className="grid gap-x-8 gap-y-12 pt-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
