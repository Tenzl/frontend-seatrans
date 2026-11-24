'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const ArticleDetailPage = dynamic(
  () => import('@/modules/posts/components/public/ArticleDetailPage').then((module) => module.ArticleDetailPage),
  { ssr: false }
)

type ArticleDetailClientProps = {
  id: string
}

export default function ArticleDetailClient({ id }: ArticleDetailClientProps) {
  const router = useRouter()

  return (
    <main>
      <ArticleDetailPage
        articleId={parseInt(id || '0')}
        onNavigateBack={() => router.push('/insights')}
      />
    </main>
  )
}
