/**
 * @file src/module/home/components/FrontBlogsSection.tsx
 * Home page Front Blogs adapter delegating to the common Blog module.
 */

import { BlogSection as CommonBlog } from '../../blog'

export default function FrontBlogsSection() {
  return <CommonBlog variant="front" id="blogs-front" tone="paper" />
}
