'use client'

import { Post } from '@/types'
import { AboutMe } from './sidebar/about-me'
import { PopularPosts } from './sidebar/popular-posts'
import { RelatedPosts } from './sidebar/related-posts'

interface PostDetailSidebarProps {
  post: Post
}

export function PostDetailSidebar({ post }: PostDetailSidebarProps) {
  return (
    <div className="space-y-6">
      <RelatedPosts currentPost={post} />
      <AboutMe />
      <PopularPosts />
    </div>
  )
} 