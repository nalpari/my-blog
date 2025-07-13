import { AboutMe } from './about-me'
import { PopularPosts } from './popular-posts'
import { ExplorePosts } from './explore-posts'
import { TagClouds } from './tag-clouds'

export const MainSidebar = () => {
  return (
    <div className="space-y-6">
      <AboutMe />
      <PopularPosts />
      <ExplorePosts />
      <TagClouds />
    </div>
  )
}
