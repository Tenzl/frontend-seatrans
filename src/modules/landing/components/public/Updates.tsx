'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Ship } from 'lucide-react'
import { postService, type Post } from '@/modules/posts/services/postService'

export function Updates() {
  const [posts, setPosts] = useState<Post[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    postService
      .getLatestPosts(3)
      .then(setPosts)
      .catch(() => setFailed(true))
  }, [])

  if (failed || posts.length === 0) return null

  return (
    <section className="bg-background py-20" aria-labelledby="latest-updates">
      <div className="container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <h2 id="latest-updates" className="text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
              Latest updates
            </h2>
            <p className="mt-2 text-muted-foreground">Stories and news from Seatrans.</p>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline"
          >
            All insights <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="group min-w-0">
              <Link
                href={`/insights/${post.id}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#123b6b]">
                  {post.thumbnailUrl && (
                    <Image
                      src={post.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                  {!post.thumbnailUrl && (
                    <div className="absolute inset-0 flex items-end justify-between p-5 text-white" aria-hidden="true">
                      <span className="text-sm font-semibold">Seatrans</span>
                      <Ship className="h-10 w-10 text-white/70" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs font-medium text-primary">{post.categories?.[0]?.name || 'Insight'}</div>
                <h3 className="mt-2 text-xl font-semibold leading-snug tracking-[-0.02em] group-hover:text-primary">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.summary}</p>
                )}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
