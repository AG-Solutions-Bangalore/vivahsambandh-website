/**
 * @file src/module/home/components/FeaturedBlogsSection.tsx
 * Home page Featured Blogs adapter delegating to the common Blog module.
 */

import { BlogSection as CommonBlog } from '../../blog'

export default function FeaturedBlogsSection() {
  return <CommonBlog variant="featured" id="blogs-featured" tone="cream" />
}
