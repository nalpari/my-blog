import { PrismaClient } from '@prisma/client'
import { Post, Profile, Comment, Tag, Category, ApiResponse } from '@/types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 블로그 포스팅 관련 함수들
export const blogApi = {
  // 모든 공개된 포스팅 조회
  async getPosts(
    options: { page: number; limit: number } = { page: 1, limit: 10 }
  ): Promise<ApiResponse<Post[]>> {
    try {
      const { page, limit } = options

      const posts = await prisma.posts.findMany({
        where: {
          is_published: true,
        },
        include: {
          categories: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
        category_id: post.category_id || undefined,
        category: post.categories ? {
          id: post.categories.id,
          name: post.categories.name,
          slug: post.categories.slug,
          description: post.categories.description || undefined,
          color: post.categories.color || undefined,
          created_at: post.categories.created_at.toISOString(),
        } : undefined,
      }))



      return {
        data: transformedPosts,
        error: null,
        success: true,
      }
    } catch (error) {
      console.error('getPosts 에러:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 슬러그로 특정 포스팅 조회
  async getPostBySlug(slug: string): Promise<ApiResponse<Post>> {
    try {

      const post = await prisma.posts.findUnique({
        where: {
          slug: slug,
          is_published: true,
        },
      })

      if (!post) {
        console.error('getPostBySlug 에러: 포스트를 찾을 수 없음', { slug })
        return { data: null, error: 'Post not found', success: false }
      }

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPost: Post = {
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
      }



      return { data: transformedPost, error: null, success: true }
    } catch (error) {
      console.error('getPostBySlug 에러:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 태그별 포스팅 조회
  async getPostsByTag(
    tag: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<Post[]>> {
    try {
      const posts = await prisma.posts.findMany({
        where: {
          tags: {
            has: tag,
          },
          is_published: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
      }))

      return { data: transformedPosts, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 포스팅 검색
  async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<Post[]>> {
    try {
      const posts = await prisma.posts.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
          is_published: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
      }))

      return { data: transformedPosts, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 포스팅 조회수 증가
  async incrementViews(postId: number): Promise<ApiResponse<void>> {
    try {


      if (!postId || typeof postId !== 'number' || !Number.isInteger(postId) || postId <= 0) {
        console.error('incrementViews: postId가 유효하지 않음', { postId, type: typeof postId })
        return { data: null, error: 'Invalid post ID', success: false }
      }

      // Prisma를 사용하여 원자적으로 조회수 증가
      await prisma.posts.update({
        where: {
          id: postId,
          is_published: true,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      })

      return { data: null, error: null, success: true }
    } catch (error) {
      console.error('incrementViews 예외 발생:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 인기 포스트 조회 (조회수 순)
  async getPopularPosts(limit: number = 5): Promise<ApiResponse<Post[]>> {
    try {
      const posts = await prisma.posts.findMany({
        where: {
          is_published: true,
        },
        orderBy: {
          views: 'desc',
        },
        take: limit,
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
      }))

      return { data: transformedPosts, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 태그별 포스트 개수 조회
  async getTags(): Promise<ApiResponse<{ name: string; count: number }[]>> {
    try {
      const posts = await prisma.posts.findMany({
        where: {
          is_published: true,
        },
        select: {
          tags: true,
        },
      })

      // 태그 집계
      const tagCount: Record<string, number> = {}
      posts.forEach((post) => {
        post.tags?.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })

      // 태그를 개수 순으로 정렬
      const tags = Object.entries(tagCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      return { data: tags, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 모든 카테고리 조회
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const categories = await prisma.categories.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  is_published: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc',
        },
      })

      const transformedCategories: Category[] = categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        color: category.color || undefined,
        created_at: category.created_at.toISOString(),
        post_count: category._count.posts,
      }))

      return { data: transformedCategories, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 카테고리별 포스트 조회
  async getPostsByCategory(
    categorySlug: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<Post[]>> {
    try {
      const posts = await prisma.posts.findMany({
        where: {
          categories: {
            slug: categorySlug,
          },
          is_published: true,
        },
        include: {
          categories: true,
        },
        orderBy: {
          published_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      })

      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
        category_id: post.category_id || undefined,
        category: post.categories ? {
          id: post.categories.id,
          name: post.categories.name,
          slug: post.categories.slug,
          description: post.categories.description || undefined,
          color: post.categories.color || undefined,
          created_at: post.categories.created_at.toISOString(),
        } : undefined,
      }))

      return { data: transformedPosts, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },
}

// 인증 관련 함수들 (Prisma로는 구현하지 않음 - NextAuth.js 등 사용 권장)
export const authApi = {
  // 현재 사용자 정보 조회
  async getCurrentUser() {
    // NextAuth.js나 다른 인증 라이브러리 사용 권장
    return null
  },

  // 로그인
  async signIn(email: string, password: string) {
    // NextAuth.js나 다른 인증 라이브러리 사용 권장
    throw new Error('Authentication not implemented with Prisma. Use NextAuth.js or similar.')
  },

  // 회원가입
  async signUp(email: string, password: string) {
    // NextAuth.js나 다른 인증 라이브러리 사용 권장
    throw new Error('Authentication not implemented with Prisma. Use NextAuth.js or similar.')
  },

  // 로그아웃
  async signOut() {
    // NextAuth.js나 다른 인증 라이브러리 사용 권장
    throw new Error('Authentication not implemented with Prisma. Use NextAuth.js or similar.')
  },
}

// 관리자 전용 함수들
export const adminApi = {
  // 포스팅 생성
  async createPost(
    post: Omit<Post, 'id' | 'created_at' | 'views'>,
  ): Promise<ApiResponse<Post>> {
    try {
      // is_published가 true이고 published_at이 없으면 현재 시간으로 설정
      const publishedAt = post.is_published && !post.published_at 
        ? new Date() 
        : post.published_at ? new Date(post.published_at) : null

      const createdPost = await prisma.posts.create({
        data: {
          title: post.title,
          content: post.content,
          slug: post.slug,
          author_id: post.author_id,
          category_id: post.category_id,
          published_at: publishedAt,
          is_published: post.is_published,
          tags: post.tags,
          image_url: post.image_url,
          alt_text: post.alt_text,
        },
        include: {
          categories: true,
        },
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPost: Post = {
        id: createdPost.id,
        title: createdPost.title,
        content: createdPost.content,
        slug: createdPost.slug,
        created_at: createdPost.created_at.toISOString(),
        published_at: createdPost.published_at?.toISOString() || null,
        is_published: createdPost.is_published,
        tags: createdPost.tags,
        views: createdPost.views,
        image_url: createdPost.image_url || undefined,
        alt_text: createdPost.alt_text || undefined,
        author_id: createdPost.author_id,
        category_id: createdPost.category_id || undefined,
        category: createdPost.categories ? {
          id: createdPost.categories.id,
          name: createdPost.categories.name,
          slug: createdPost.categories.slug,
          description: createdPost.categories.description || undefined,
          color: createdPost.categories.color || undefined,
          created_at: createdPost.categories.created_at.toISOString(),
        } : undefined,
      }

      return { data: transformedPost, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 포스팅 수정
  async updatePost(
    id: number,
    updates: Partial<Post>,
  ): Promise<ApiResponse<Post>> {
    try {
      // 기존 포스트 정보 조회 (published_at 상태 확인용)
      const existingPost = await prisma.posts.findUnique({
        where: { id },
        select: { is_published: true, published_at: true }
      })

      if (!existingPost) {
        return { data: null, error: 'Post not found', success: false }
      }

      // published_at 로직 처리
      let publishedAt = updates.published_at !== undefined 
        ? (updates.published_at ? new Date(updates.published_at) : null)
        : undefined

      // is_published가 false에서 true로 변경되고 published_at이 없는 경우
      if (updates.is_published === true && 
          !existingPost.is_published && 
          !existingPost.published_at && 
          publishedAt === undefined) {
        publishedAt = new Date()
      }

      // is_published가 true에서 false로 변경되는 경우 published_at을 null로 설정
      if (updates.is_published === false && existingPost.is_published) {
        publishedAt = null
      }

      const updatedPost = await prisma.posts.update({
        where: { id },
        data: {
          ...(updates.title && { title: updates.title }),
          ...(updates.content && { content: updates.content }),
          ...(updates.slug && { slug: updates.slug }),
          ...(updates.author_id && { author_id: updates.author_id }),
          ...(updates.category_id !== undefined && { category_id: updates.category_id }),
          ...(publishedAt !== undefined && { published_at: publishedAt }),
          ...(updates.is_published !== undefined && { is_published: updates.is_published }),
          ...(updates.tags && { tags: updates.tags }),
          ...(updates.image_url !== undefined && { image_url: updates.image_url }),
          ...(updates.alt_text !== undefined && { alt_text: updates.alt_text }),
        },
        include: {
          categories: true,
        },
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPost: Post = {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        slug: updatedPost.slug,
        created_at: updatedPost.created_at.toISOString(),
        published_at: updatedPost.published_at?.toISOString() || null,
        is_published: updatedPost.is_published,
        tags: updatedPost.tags,
        views: updatedPost.views,
        image_url: updatedPost.image_url || undefined,
        alt_text: updatedPost.alt_text || undefined,
        author_id: updatedPost.author_id,
        category_id: updatedPost.category_id || undefined,
        category: updatedPost.categories ? {
          id: updatedPost.categories.id,
          name: updatedPost.categories.name,
          slug: updatedPost.categories.slug,
          description: updatedPost.categories.description || undefined,
          color: updatedPost.categories.color || undefined,
          created_at: updatedPost.categories.created_at.toISOString(),
        } : undefined,
      }

      return { data: transformedPost, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 포스팅 삭제
  async deletePost(id: number): Promise<ApiResponse<void>> {
    try {
      await prisma.posts.delete({
        where: { id },
      })

      return { data: null, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // ID로 포스팅 조회 (관리자용)
  async getPostById(id: number): Promise<ApiResponse<Post>> {
    try {
      const post = await prisma.posts.findUnique({
        where: { id },
      })

      if (!post) {
        return { data: null, error: 'Post not found', success: false }
      }

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPost: Post = {
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
      }

      return { data: transformedPost, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },

  // 모든 포스팅 조회 (관리자용)
  async getAllPosts(): Promise<ApiResponse<Post[]>> {
    try {
      const posts = await prisma.posts.findMany({
        orderBy: {
          created_at: 'desc',
        },
      })

      // Prisma 데이터를 Post 타입에 맞게 변환
      const transformedPosts: Post[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        created_at: post.created_at.toISOString(),
        published_at: post.published_at?.toISOString() || null,
        is_published: post.is_published,
        tags: post.tags,
        views: post.views,
        image_url: post.image_url || undefined,
        alt_text: post.alt_text || undefined,
        author_id: post.author_id,
      }))

      return { data: transformedPosts, error: null, success: true }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  },
}