'use client'

import { Post } from '@/types'
import { BlogHeader } from './blog-header'
import { BlogFooter } from './blog-footer'
import { PostDetailHeader } from './post-detail-header'
import { PostDetailContent } from './post-detail-content'
import { PostDetailSidebar } from './post-detail-sidebar'

interface PostDetailPageProps {
  post: Post
}

export function PostDetailPage({ post }: PostDetailPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <BlogHeader siteTitle="개발 블로그" />
      <main>
        <PostDetailHeader post={post} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PostDetailContent post={post} />
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <PostDetailSidebar post={post} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <BlogFooter
        siteTitle="개발 블로그"
        authorName="개발자"
        authorEmail="developer@example.com"
      />
    </div>
  )
}
