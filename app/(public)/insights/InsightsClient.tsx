"use client";

import { PostsPage } from "@/modules/posts/components/public/Insights/PostPage";

export default function InsightsClient({
  initialCategory = "",
}: {
  initialCategory?: string;
}) {
  return (
    <main>
      <PostsPage initialCategory={initialCategory} />
    </main>
  );
}
