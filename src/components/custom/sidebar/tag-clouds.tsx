import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'
import { blogApi } from '@/lib/prisma'

interface TagItem {
  name: string
  count: number
  size: 'sm' | 'md' | 'lg'
}

export const TagClouds = async () => {
  const { data, error } = await blogApi.getTags()
  
  let tags: TagItem[] = []
  if (data && !error) {
    // 태그 개수에 따라 크기 결정
    tags = data.map((tag) => ({
      ...tag,
      size: tag.count >= 3 ? 'lg' : tag.count >= 2 ? 'md' : 'sm' as 'sm' | 'md' | 'lg'
    }))
  }
  const getTagSize = (size: string) => {
    switch (size) {
      case 'lg':
        return 'text-sm px-3 py-1.5'
      case 'md':
        return 'text-xs px-2.5 py-1'
      case 'sm':
      default:
        return 'text-xs px-2 py-0.5'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Tag Clouds
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error || tags.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">태그가 없습니다.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.name} href={`/blog/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Badge
                    variant="secondary"
                    className={`
                      ${getTagSize(tag.size)}
                      hover:bg-primary/20 
                      transition-colors 
                      cursor-pointer
                      ${tag.size === 'lg' ? 'font-semibold' : ''}
                    `}
                  >
                    {tag.name}
                    <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                  </Badge>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-muted-foreground text-center">
                총 {tags.reduce((sum, tag) => sum + tag.count, 0)}개의 태그가 있습니다
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
