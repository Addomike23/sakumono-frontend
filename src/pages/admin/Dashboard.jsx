import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUsers, FaUserMd, FaCalendarCheck, FaShoppingCart,
  FaEnvelope, FaStar, FaSpinner, FaBox, FaBlog,
  FaArrowRight, FaCircle
} from 'react-icons/fa'
import { usersApi } from '../../api/users.api'
import { appointmentsApi } from '../../api/appointments.api'
import { shopApi } from '../../api/shop.api'
import { contactApi } from '../../api/contact.api'
import { reviewsApi } from '../../api/reviews.api'
import { blogsApi } from '../../api/blogs.api'
import { subscriptionApi } from '../../api/subscriptionApi'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

/*
  Fonts used below: Space Grotesk (display), Inter (body), JetBrains Mono (data).
  Add this to the <head> of index.html if not already present:

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
*/

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' },
  }),
}

const FONT_DISPLAY = "'Space Grotesk', sans-serif"
const FONT_BODY = "'Inter', sans-serif"
const FONT_MONO = "'JetBrains Mono', monospace"

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())
  const [stats, setStats] = useState({
    users: { total: 0, patients: 0, doctors: 0, admins: 0 },
    appointments: { total: 0, pending: 0, confirmed: 0, completed: 0 },
    shop: { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 },
    contacts: { total: 0, pending: 0 },
    reviews: { total: 0, averageRating: 0 },
    blogs: { total: 0, published: 0 },
    subscriptions: { total: 0 }
  })

  useEffect(() => {
    fetchDashboardData()
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [
        usersRes,
        appointmentsRes,
        ordersRes,
        contactsRes,
        reviewsRes,
        blogsRes,
        subsRes
      ] = await Promise.all([
        usersApi.getAll({ limit: 1 }),
        appointmentsApi.getStats(),
        shopApi.getOrders({ limit: 1 }),
        contactApi.getStats(),
        reviewsApi.getStats(),
        blogsApi.getStats(),
        subscriptionApi.getStats()
      ])

      const users = usersRes.data.users || []
      setStats(prev => ({
        ...prev,
        users: {
          total: usersRes.data.pagination?.total || 0,
          patients: users.filter(u => u.role === 'patient').length,
          doctors: users.filter(u => u.role === 'doctor').length,
          admins: users.filter(u => u.role === 'admin').length
        }
      }))

      const aptStats = appointmentsRes.data.stats || {}
      setStats(prev => ({
        ...prev,
        appointments: {
          total: aptStats.total || 0,
          pending: aptStats.pending || 0,
          confirmed: aptStats.confirmed || 0,
          completed: aptStats.completed || 0
        }
      }))

      const orderData = ordersRes.data || {}
      setStats(prev => ({
        ...prev,
        shop: {
          totalOrders: orderData.stats?.total || 0,
          totalRevenue: orderData.stats?.revenue || 0,
          pendingOrders: orderData.stats?.pending || 0
        }
      }))

      setStats(prev => ({
        ...prev,
        contacts: {
          total: contactsRes.data.stats?.total || 0,
          pending: contactsRes.data.stats?.pending || 0
        }
      }))

      setStats(prev => ({
        ...prev,
        reviews: {
          total: reviewsRes.data.stats?.total || 0,
          averageRating: reviewsRes.data.stats?.averageRating || 0
        }
      }))

      setStats(prev => ({
        ...prev,
        blogs: {
          total: blogsRes.data.stats?.total || 0,
          published: blogsRes.data.stats?.published || 0
        }
      }))

      setStats(prev => ({
        ...prev,
        subscriptions: {
          total: subsRes.data.stats?.total || 0
        }
      }))

    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-3 bg-[#F5F6F8]"
        style={{ fontFamily: FONT_MONO }}
      >
        <FaSpinner className="animate-spin text-3xl text-[#0D7D72]" />
        <p className="text-xs tracking-widest text-[#5B6572] uppercase">Reading system status…</p>
      </div>
    )
  }

  // Category-grouped stat cards. Grouping is real content structure
  // (who / clinical / commerce / engagement), not decoration.
  const sections = [
    {
      label: 'People',
      cards: [
        {
          title: 'Total users',
          value: stats.users.total,
          icon: FaUsers,
          accent: '#4338CA',
          tag: 'PPL',
          link: '/admin/users',
          sub: `${stats.users.patients} patients · ${stats.users.doctors} doctors`
        }
      ]
    },
    {
      label: 'Care',
      cards: [
        {
          title: 'Appointments',
          value: stats.appointments.total,
          icon: FaCalendarCheck,
          accent: '#0D7D72',
          tag: 'CARE',
          link: '/admin/appointments',
          sub: `${stats.appointments.pending} pending`
        }
      ]
    },
    {
      label: 'Commerce',
      cards: [
        {
          title: 'Orders',
          value: stats.shop.totalOrders,
          icon: FaShoppingCart,
          accent: '#B45309',
          tag: 'SHOP',
          link: '/admin/orders',
          sub: `GHS ${stats.shop.totalRevenue?.toFixed(2) || '0.00'}`
        },
        {
          title: 'Products',
          value: stats.shop.totalOrders || 0,
          icon: FaBox,
          accent: '#475569',
          tag: 'INV',
          link: '/admin/products',
          sub: 'View catalogue'
        }
      ]
    },
    {
      label: 'Engagement',
      cards: [
        {
          title: 'Messages',
          value: stats.contacts.total,
          icon: FaEnvelope,
          accent: '#BE123C',
          tag: 'MSG',
          link: '/admin/contacts',
          sub: `${stats.contacts.pending} unread`
        },
        {
          title: 'Reviews',
          value: stats.reviews.total,
          icon: FaStar,
          accent: '#A16207',
          tag: 'RVW',
          link: '/admin/reviews',
          sub: `${stats.reviews.averageRating?.toFixed(1) || '0.0'} avg rating`
        },
        {
          title: 'Blog posts',
          value: stats.blogs.total,
          icon: FaBlog,
          accent: '#6D28D9',
          tag: 'BLOG',
          link: '/admin/blogs',
          sub: `${stats.blogs.published} published`
        },
        {
          title: 'Subscribers',
          value: stats.subscriptions.total,
          icon: FaEnvelope,
          accent: '#0E7490',
          tag: 'SUB',
          link: '/admin/subscribers',
          sub: 'Newsletter list'
        }
      ]
    }
  ]

  const quickActions = [
    { label: 'View all appointments', to: '/admin/appointments' },
    { label: 'Add new product', to: '/admin/products/new' },
    { label: 'Write blog post', to: '/admin/blogs/new' },
    { label: 'Add new doctor', to: '/admin/doctors/add' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-12" style={{ fontFamily: FONT_BODY }}>
      {/* Status ribbon — instrument-panel signature element */}
      <div
        className="w-full text-[#EDEFF2]"
        style={{ backgroundColor: '#10151B', fontFamily: FONT_MONO }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-[11px] tracking-wider">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]" />
            </span>
            <span className="uppercase text-[#9CA6B2]">System nominal</span>
          </div>
          <div className="hidden sm:block text-[#9CA6B2] uppercase">
            Sakumono Community Hospital · Admin Console
          </div>
          <div className="text-[#EDEFF2]">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            {'  '}
            {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p
              className="text-[11px] tracking-[0.2em] uppercase text-[#0D7D72] mb-1"
              style={{ fontFamily: FONT_MONO }}
            >
              Dashboard
            </p>
            <h1
              className="text-3xl text-[#10151B]"
              style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              Welcome back, {user?.firstName || 'Admin'}
            </h1>
            <p className="text-sm text-[#5B6572] mt-1">Here's what's happening across the hospital today.</p>
          </div>
        </div>

        {/* Stat sections */}
        <div className="space-y-8 mb-10">
          {sections.map((section, sIdx) => (
            <div key={section.label}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-[11px] tracking-[0.2em] uppercase text-[#5B6572]"
                  style={{ fontFamily: FONT_MONO }}
                >
                  {section.label}
                </span>
                <span className="h-px flex-1 bg-[#E3E6EA]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.cards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <motion.div
                      key={card.title}
                      initial="hidden"
                      animate="visible"
                      custom={sIdx * 2 + index}
                      variants={fadeUp}
                    >
                      <Link
                        to={card.link}
                        className="group bg-white rounded-lg border border-[#E3E6EA] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all block h-full"
                        style={{ borderLeft: `3px solid ${card.accent}` }}
                      >
                        <div className="p-4 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center border"
                              style={{ borderColor: `${card.accent}33`, backgroundColor: `${card.accent}14` }}
                            >
                              <Icon style={{ color: card.accent }} className="text-sm" />
                            </div>
                            <span
                              className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded"
                              style={{ fontFamily: FONT_MONO, color: card.accent, backgroundColor: `${card.accent}14` }}
                            >
                              {card.tag}
                            </span>
                          </div>
                          <p className="text-xs text-[#5B6572] mb-0.5">{card.title}</p>
                          <p
                            className="text-2xl text-[#10151B] mb-1"
                            style={{ fontFamily: FONT_MONO, fontWeight: 500 }}
                          >
                            {card.value}
                          </p>
                          <p className="text-[11px] text-[#8B94A0] mt-auto">{card.sub}</p>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Console panels */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Quick actions */}
          <div className="bg-white rounded-lg border border-[#E3E6EA] shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-[#E3E6EA]">
              <h3
                className="text-[11px] tracking-[0.2em] uppercase text-[#5B6572]"
                style={{ fontFamily: FONT_MONO }}
              >
                Quick actions
              </h3>
            </div>
            <div>
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center justify-between px-5 py-3 text-sm text-[#10151B] hover:bg-[#F5F6F8] border-b border-[#F0F1F3] last:border-b-0 transition-colors"
                >
                  <span>{action.label}</span>
                  <FaArrowRight className="text-[10px] text-[#8B94A0] group-hover:text-[#0D7D72] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Appointment manifest */}
          <div className="bg-white rounded-lg border border-[#E3E6EA] shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-[#E3E6EA]">
              <h3
                className="text-[11px] tracking-[0.2em] uppercase text-[#5B6572]"
                style={{ fontFamily: FONT_MONO }}
              >
                Appointment status
              </h3>
            </div>
            <div className="px-5 py-1">
              {[
                { label: 'Total', value: stats.appointments.total, color: '#10151B' },
                { label: 'Pending', value: stats.appointments.pending, color: '#B45309' },
                { label: 'Confirmed', value: stats.appointments.confirmed, color: '#4338CA' },
                { label: 'Completed', value: stats.appointments.completed, color: '#0D7D72' },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-2.5 ${i !== arr.length - 1 ? 'border-b border-[#F0F1F3]' : ''}`}
                >
                  <span className="text-sm text-[#5B6572]">{row.label}</span>
                  <span style={{ fontFamily: FONT_MONO, color: row.color }} className="text-sm font-medium">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shop manifest */}
          <div className="bg-white rounded-lg border border-[#E3E6EA] shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-[#E3E6EA]">
              <h3
                className="text-[11px] tracking-[0.2em] uppercase text-[#5B6572]"
                style={{ fontFamily: FONT_MONO }}
              >
                Shop overview
              </h3>
            </div>
            <div className="px-5 py-1">
              {[
                { label: 'Total orders', value: stats.shop.totalOrders, color: '#10151B' },
                { label: 'Pending', value: stats.shop.pendingOrders, color: '#B45309' },
                { label: 'Revenue', value: `GHS ${stats.shop.totalRevenue?.toFixed(2) || '0.00'}`, color: '#0D7D72' },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-2.5 ${i !== arr.length - 1 ? 'border-b border-[#F0F1F3]' : ''}`}
                >
                  <span className="text-sm text-[#5B6572]">{row.label}</span>
                  <span style={{ fontFamily: FONT_MONO, color: row.color }} className="text-sm font-medium">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
