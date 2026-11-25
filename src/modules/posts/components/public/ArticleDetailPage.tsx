"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Eye, Tag } from "lucide-react";
import DOMPurify from "dompurify";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { postService, Post } from "@/modules/posts/services/postService";

interface ArticleDetailPageProps {
  articleId: number;
  onNavigateBack: () => void;
}

type ContentBlock = HTMLElement;

const MEDIA_SELECTOR = "img, picture, video, iframe, svg, table, pre, code";

function decorateContent(html: string): string {
  // Tag blocks so we can style spacing/width without relying on CSS :has()
  if (typeof window === "undefined") return html;

  try {
    const doc = new DOMParser().parseFromString(html, "text/html");

    const blocks = Array.from(
      doc.querySelectorAll("p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote"),
    ) as ContentBlock[];

    for (const el of blocks) {
      const hasMedia = el.querySelector(MEDIA_SELECTOR) !== null;

      // Tag paragraphs separately for spacing rules
      if (el.tagName.toLowerCase() === "p") {
        if (hasMedia) el.classList.add("content-media-p");
        else el.classList.add("content-text-p");
      }
    }

    // Remove empty paragraphs like <p>&nbsp;</p>
    const paragraphs = Array.from(
      doc.querySelectorAll("p"),
    ) as HTMLParagraphElement[];
    for (const p of paragraphs) {
      const hasMedia = p.querySelector(MEDIA_SELECTOR) !== null;
      const text = (p.textContent || "").replace(/\u00a0/g, " ").trim();
      if (!hasMedia && text.length === 0) p.remove();
    }

    // Force all images to be full-width via inline styles
    const images = Array.from(
      doc.querySelectorAll("img"),
    ) as HTMLImageElement[];
    for (const img of images) {
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.maxWidth = "100%";
      img.style.display = "block";
    }

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

function formatDate(value?: string | Date | null) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function ArticleDetailPage({
  articleId,
  onNavigateBack,
}: ArticleDetailPageProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setRelatedPosts([]);

    if (!Number.isInteger(articleId) || articleId < 1) {
      setError("Article not found");
      setLoading(false);
      return () => controller.abort();
    }

    postService
      .getPublicPostById(articleId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setPost(data);
        const relatedRequest = data.categories?.[0]?.slug
          ? postService
              .getPublishedPostsPage(
                { page: 0, size: 4, category: data.categories[0].slug },
                controller.signal,
              )
              .then((result) => result.content)
          : postService.getLatestPosts(4);
        void relatedRequest
          .then((posts) => {
            if (!controller.signal.aborted) {
              setRelatedPosts(
                posts.filter((item) => item.id !== articleId).slice(0, 3),
              );
            }
          })
          .catch(() => {
            if (!controller.signal.aborted) setRelatedPosts([]);
          });
        void postService
          .recordPostViewOnce(articleId)
          .then((viewCount) => {
            if (!controller.signal.aborted)
              setPost((current) =>
                current?.id === articleId ? { ...current, viewCount } : current,
              );
          })
          .catch(() => undefined);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError("Failed to load the article");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [articleId]);

  const decoratedHtml = useMemo(
    () => decorateContent(post?.content || ""),
    [post?.content],
  );

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(decoratedHtml, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "span",
        "div",
        "b",
        "i",
        "u",
        "strong",
        "em",
        "mark",
        "small",
        "del",
        "ins",
        "sub",
        "sup",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "img",
        "picture",
        "figure",
        "figcaption",
        "table",
        "thead",
        "tbody",
        "tfoot",
        "tr",
        "th",
        "td",
        "caption",
        "pre",
        "code",
        "kbd",
        "samp",
        "blockquote",
        "cite",
        "q",
        "hr",
      ],
      ALLOWED_ATTR: [
        "href",
        "title",
        "target",
        "rel",
        "src",
        "alt",
        "width",
        "height",
        "loading",
        "srcset",
        "sizes",
        "class",
        "id",
        "colspan",
        "rowspan",
        "style",
      ],
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  }, [decoratedHtml]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-[420px] animate-pulse rounded-2xl bg-muted" />
        <div className="mt-8 space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-destructive">{error || "Article not found"}</p>
        <Button variant="ghost" className="mt-6" onClick={onNavigateBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const authorName = post.author?.fullName || post.authorName || "Seatrans";
  const initials = authorName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  const publishedDate = post.publishedAt || post.createdAt;
  const publishedLabel = formatDate(publishedDate);

  return (
    <div className="container py-12 md:py-16">
      <Button variant="ghost" className="mb-8 -ml-3" onClick={onNavigateBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to insights
      </Button>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
        <article className="min-w-0">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {post.categories?.map((c) => (
                <Link
                  key={c.id}
                  href={`/insights?category=${encodeURIComponent(c.slug)}`}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs hover:bg-primary/10"
                  >
                    {c.name}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 className="text-3xl font-semibold leading-[1.2] tracking-[-0.025em] sm:text-4xl">
              {post.title}
            </h1>

            {post.summary && (
              <p className="mt-4 text-justify text-lg leading-8 text-muted-foreground">
                {post.summary}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {publishedLabel && (
                <time dateTime={publishedDate}>{publishedLabel}</time>
              )}
              {publishedLabel && post.readingTime && (
                <span aria-hidden="true">·</span>
              )}
              {post.readingTime && <span>{post.readingTime} min read</span>}
              {(publishedLabel || post.readingTime) && (
                <span aria-hidden="true">·</span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" aria-hidden="true" /> {post.viewCount}{" "}
                views
              </span>
            </div>
          </header>

          {post.thumbnailUrl && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
              <Image
                src={post.thumbnailUrl}
                alt=""
                fill
                unoptimized
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <section className="mt-10">
            <div
              className={[
                "article-content prose prose-lg max-w-none",

                // IMPORTANT: prevent "margin collapse" by controlling ONLY bottom margins.
                // Also neutralize prose default p margins so our rules always win.
                "prose-p:m-0",

                // Text paragraph rhythm.
                "[&_.content-text-p]:mt-0 [&_.content-text-p]:mb-5 [&_.content-text-p]:leading-8",

                // Separate media from surrounding text.
                "[&_.content-media-p]:mt-[30px] [&_.content-media-p]:mb-[30px]",

                // Headings / links / strong
                "prose-headings:tracking-tight prose-headings:font-semibold",
                "prose-a:underline prose-a:underline-offset-4",
                "prose-strong:font-semibold",

                // Lists
                "prose-ul:list-disc prose-ol:list-decimal",
                "prose-ul:pl-6 prose-ol:pl-6",
                "prose-ul:my-4 prose-ol:my-4",
                "prose-li:my-1",
                "prose-li:marker:text-muted-foreground",

                // Images inside content - always fit container width (force override inline styles)
                "prose-img:rounded-xl prose-img:!w-full prose-img:!h-auto prose-img:!max-w-full",
                "prose-img:block",

                // Blockquotes
                "prose-blockquote:border-l-border prose-blockquote:text-muted-foreground",
              ].join(" ")}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        </article>

        <aside
          className="min-w-0 space-y-8 lg:sticky lg:top-32 lg:self-start"
          aria-label="Article information"
        >
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground"
                aria-hidden="true"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {authorName}
                </p>
                <p className="text-xs text-muted-foreground">Author</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Explore more perspectives from the Seatrans team.
            </p>
            <Link
              href="/insights"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              All insights <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                More insights
              </h2>
              <ul className="mt-4 space-y-4">
                {relatedPosts.map((related) => (
                  <li
                    key={related.id}
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <Link
                      href={`/insights/${related.id}`}
                      className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="block text-sm font-medium leading-6 text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary">
                        {related.title}
                      </span>
                      {related.readingTime && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {related.readingTime} min read
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
