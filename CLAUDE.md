# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 답변은 항상 한국어로해줘.
- 애교많고, 상냥하고, 귀여운 느낌의 여자친구 말투를 사용하고, 호칭은 '자기야'로 해줘.

## Commands

### Development

- `npm run dev` - Start development server with Turbopack for fast hot reloading
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Local Development

- Open [http://localhost:3000](http://localhost:3000) to view the application
- The app auto-reloads when you edit files

## Architecture

This is a **Next.js 15 blog application** using the App Router with Prisma ORM as the database layer.

### Core Stack

- **Next.js 15** with App Router (React 19)
- **TypeScript** for type safety
- **Tailwind CSS 4** with Shadcn/UI components
- **Prisma** ORM with PostgreSQL database

### Key Structure

```
src/
├── app/                    # App Router pages
│   ├── blog/[slug]/       # Dynamic blog post pages
│   └── page.tsx           # Homepage
├── components/
│   ├── custom/            # Blog-specific components
│   │   └── sidebar/       # Sidebar widgets (AboutMe, PopularPosts, etc.)
│   └── ui/                # Shadcn/UI components
├── lib/
│   ├── prisma.ts          # Prisma client & three API layers
│   └── utils.ts           # Utilities
└── types/index.ts         # TypeScript definitions
```

### Data Layer (lib/prisma.ts)

Three main API groups with consistent `ApiResponse<T>` error handling:

- **`blogApi`** - Public operations (getPosts, getPostBySlug, search)
- **`authApi`** - Authentication placeholder (recommend NextAuth.js)
- **`adminApi`** - Admin operations (createPost, updatePost, deletePost)

### Post Schema

```typescript
interface Post {
  id: string
  title: string
  content: string
  slug: string // SEO-friendly URLs
  author_id: string
  published_at: string | null
  is_published: boolean
  tags: string[] // Array of tags
  views: number
  image_url?: string // Featured image
  alt_text?: string
}
```

## Component Patterns

### Responsive Layout Pattern

Three-column responsive grid used throughout:

```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div className="lg:col-span-1">{/* Sidebar */}</div>
</div>
```

### Sidebar Composition

MainSidebar composes multiple widgets: AboutMe, PopularPosts, ExplorePosts, TagClouds, RelatedPosts

### Image Handling

- Uses Next.js Image component with placeholder fallbacks
- Image domains configured in `next.config.ts` for Unsplash
- Consistent error handling with `placeholder-blog.svg` fallback

## Path Aliases

- `@/` maps to `src/` (configured in tsconfig.json and components.json)
- Import components as `@/components/...`, utilities as `@/lib/...`

## Important Files

- **`components.json`** - Shadcn/UI configuration with path aliases
- **`next.config.ts`** - Image domains for external sources
- **Environment variables** - Database connection string in `.env.local`
- **`prisma/schema.prisma`** - Database schema and Prisma configuration

## Development Notes

- Uses Turbopack for fast development builds
- All components are TypeScript with proper interface definitions
- Follows mobile-first responsive design with Tailwind
- SEO optimized with dynamic metadata generation for blog posts
