import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, FiCalendar, FiUser, FiEye, FiHeart, 
  FiClock, FiTag, FiShare2, FiBookmark, FiMessageCircle,
  FiTwitter, FiFacebook, FiLinkedin, FiLink,
  FiChevronRight, FiChevronLeft, FiArrowUpRight,
  FiThumbsUp, FiThumbsDown
} from 'react-icons/fi'
import { blogsApi } from '../../api/blogs.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const BlogDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [blog, setBlog] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    fetchBlog()
    window.scrollTo(0, 0)
  }, [slug])

  const fetchBlog = async () => {
    setLoading(true)
    try {
      const response = await blogsApi.getBySlug(slug)
      const data = response.data
      setBlog(data.blog)
      setRelatedPosts(data.relatedPosts || [])
      setLikesCount(data.blog.likes || 0)
    } catch (error) {
      
      toast.error('Blog post not found')
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this post')
      return
    }
    try {
      const response = await blogsApi.toggleLike(blog._id)
      setLikesCount(response.data.likes)
      setLiked(!liked)
      toast.success(liked ? 'Unliked' : 'Liked!')
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const text = `Check out this article: ${blog.title}`
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
      return
    }

    window.open(shareUrls[platform], '_blank', 'width=600,height=400')
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatReadTime = (minutes) => {
    if (minutes < 1) return '< 1 min read'
    if (minutes === 1) return '1 min read'
    return `${minutes} min read`
  }

  const renderContent = (content) => {
    if (!content) return null
    
    // Simple markdown-like rendering
    const lines = content.split('\n')
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{line.slice(2)}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{line.slice(3)}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-gray-900 mt-5 mb-2">{line.slice(4)}</h3>
      }
      // Bullet points
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 text-gray-700 leading-relaxed">{line.slice(2)}</li>
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={index} className="h-4"></div>
      }
      // Paragraph
      return <p key={index} className="text-gray-700 leading-relaxed mb-4">{line}</p>
    })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-medium text-gray-800">Article not found</h2>
          <p className="text-gray-500 mt-2">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700">
            <FiArrowLeft /> Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-16 pb-8 md:pt-20">
        <div aria-hidden="true" className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-green-100 blur-3xl opacity-50" />
        
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            {/* Back button */}
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-6"
            >
              <FiArrowLeft /> Back to all articles
            </Link>

            {/* Category badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                {blog.category}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                blog.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {blog.status}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 leading-tight">
              {blog.title}
            </h1>

            {/* Author & metadata */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                  {blog.author?.firstName?.[0]}{blog.author?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {blog.author?.firstName} {blog.author?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">Author</p>
                </div>
              </div>
              <span className="hidden sm:block text-gray-300">|</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="text-green-500" />
                  {formatDate(blog.publishedAt || blog.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="text-green-500" />
                  {formatReadTime(blog.readTime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiEye className="text-green-500" />
                  {blog.views || 0} views
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURED IMAGE */}
      {/* ============================================================ */}
      {blog.featuredImage && (
        <div className="max-w-5xl mx-auto px-6 -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-xl"
          >
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONTENT */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeUp}
              className="prose prose-lg max-w-none"
            >
              {/* Excerpt */}
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-xl mb-8">
                <p className="text-gray-700 text-lg italic leading-relaxed">
                  {blog.excerpt}
                </p>
              </div>

              {/* Content */}
              <div className="blog-content">
                {renderContent(blog.content)}
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                  <span className="text-sm text-gray-500 mr-2">Tags:</span>
                  {blog.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <FiTag size={12} /> {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      liked 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiHeart className={liked ? 'fill-red-500' : ''} />
                    <span>{likesCount}</span>
                  </button>
                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      bookmarked 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiBookmark className={bookmarked ? 'fill-green-600' : ''} />
                    <span>Save</span>
                  </button>
                </div>

                {/* Share buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Share:</span>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-500 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <FiTwitter size={18} />
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <FiFacebook size={18} />
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <FiLinkedin size={18} />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-2 rounded-full bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors"
                    aria-label="Copy link"
                  >
                    <FiLink size={18} />
                  </button>
                </div>
              </div>

              {/* Author bio */}
              {blog.author && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-semibold shrink-0">
                      {blog.author.firstName?.[0]}{blog.author.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {blog.author.firstName} {blog.author.lastName}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Healthcare professional at Sakumono Community Hospital
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Passionate about sharing health insights and empowering patients with knowledge.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Navigation */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-3">In this article</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#top" className="text-green-600 hover:text-green-700 flex items-center gap-1">
                      <FiChevronRight size={14} /> Top
                    </a>
                  </li>
                  <li>
                    <a href="#content" className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                      <FiChevronRight size={14} /> Content
                    </a>
                  </li>
                  <li>
                    <a href="#tags" className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                      <FiChevronRight size={14} /> Tags
                    </a>
                  </li>
                  <li>
                    <a href="#author" className="text-gray-600 hover:text-green-600 flex items-center gap-1">
                      <FiChevronRight size={14} /> Author
                    </a>
                  </li>
                </ul>
              </div>

              {/* Related posts preview */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-3">Related articles</h4>
                  <ul className="space-y-3">
                    {relatedPosts.slice(0, 3).map((post) => (
                      <li key={post._id}>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="block hover:bg-green-50 rounded-lg p-2 transition-colors -mx-2"
                        >
                          <h5 className="text-sm font-medium text-gray-800 line-clamp-2">
                            {post.title}
                          </h5>
                          <span className="text-xs text-gray-400">
                            {formatDate(post.publishedAt || post.createdAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {relatedPosts.length > 3 && (
                    <Link
                      to={`/blog?category=${encodeURIComponent(blog.category)}`}
                      className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                    >
                      View all <FiArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* RELATED POSTS */}
      {/* ============================================================ */}
      {relatedPosts.length > 0 && (
        <section className="bg-green-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
                  You might also like
                </span>
                <h2 className="text-2xl font-medium text-gray-900">Related Articles</h2>
              </div>
              <Link
                to={`/blog?category=${encodeURIComponent(blog.category)}`}
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
              >
                View all <FiArrowUpRight />
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={index}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group h-full"
                  >
                    <div className="relative aspect-[16/10] bg-green-50 overflow-hidden">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-green-300">
                          📖
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="text-green-500" /> {formatReadTime(post.readTime)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiUser className="text-green-500" />
                          {post.author?.firstName} {post.author?.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar className="text-green-500" />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* BACK TO TOP */}
      {/* ============================================================ */}
      <div className="text-center py-8">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors"
        >
          <FiChevronLeft className="rotate-90" />
          Back to top
          <FiChevronRight className="rotate-90" />
        </button>
      </div>
    </div>
  )
}

export default BlogDetail