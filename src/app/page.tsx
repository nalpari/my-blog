import { BlogHeader } from '@/components/custom/blog-header'
import { BlogFooter } from '@/components/custom/blog-footer'
import { BlogPostCard } from '@/components/custom/blog-post-card'
import { MainSidebar } from '@/components/custom/sidebar/main-sidebar'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { blogApi } from '@/lib/prisma'

export default async function Home() {
  const { data: posts, error } = await blogApi.getPosts({ page: 1, limit: 6 })
  console.log('메인 페이지 포스트 목록:', posts)
  return (
    <div className="min-h-screen bg-background">
      <BlogHeader siteTitle="개발 블로그" />

      <main>
        {/* 히어로 섹션 */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2 bg-purple-100/80 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 shadow-sm shadow-purple-100 dark:shadow-purple-950/20">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    새로운 블로그 시작!
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">개발자의 여정</span>을<br />
                기록하는 공간
              </h1>

              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                새로운 기술을 배우고, 프로젝트를 진행하며, 일상의 경험들을
                공유하는 개발자 블로그입니다. 함께 성장해요! 💜
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/blog">
                    블로그 둘러보기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">소개 보기</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 메인 콘텐츠 섹션 - 3단 구성 */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 좌측 2단 - 포스트 리스트 */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">최신 포스트</h2>
                  <p className="text-muted-foreground">
                    최근에 작성한 블로그 포스트들을 확인해보세요
                  </p>
                </div>

                <div className="space-y-6">
                  {error ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">포스트가 없습니다.</p>
                    </div>
                  ) : !posts || posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">아직 포스트가 없습니다.</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <BlogPostCard
                        key={post.id}
                        post={post}
                        showAuthor={false}
                      />
                    ))
                  )}
                </div>

                <div className="mt-8 text-center">
                  <Button asChild variant="outline" size="lg">
                    <Link href="/blog">
                      더 많은 포스트 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 우측 1단 - 사이드바 */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-24">
                  <MainSidebar />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BlogFooter
        siteTitle="개발 블로그"
        authorName="개발자"
        authorEmail="developer@example.com"
      />
    </div>
  )
}
