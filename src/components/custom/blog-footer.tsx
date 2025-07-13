import Link from 'next/link'
import { Heart } from 'lucide-react'

interface BlogFooterProps {
  authorName?: string
  authorEmail?: string
  siteTitle?: string
}

export const BlogFooter = ({
  authorName = 'Your Name',
  authorEmail = 'your@email.com',
  siteTitle = 'My Blog',
}: BlogFooterProps) => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 블로그 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <span className="text-sm font-bold">B</span>
              </div>
              <span className="text-xl font-bold gradient-text">
                {siteTitle}
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              개발과 일상을 기록하는 개인 블로그입니다. 새로운 기술을 배우고
              경험을 공유하며 성장하는 공간입니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              빠른 링크
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  블로그
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  연락처
                </Link>
              </li>
            </ul>
          </div>

          {/* 카테고리 */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              카테고리
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog/category/tech"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  기술
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/category/life"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  일상
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/category/review"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  리뷰
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/category/tutorial"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  튜토리얼
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} {authorName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 text-muted-foreground text-sm mt-2 sm:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>using Next.js & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
