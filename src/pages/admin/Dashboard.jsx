import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUsers, FaUserMd, FaCalendarCheck, FaShoppingCart,
  FaEnvelope, FaStar, FaSpinner, FaBox, FaBlog,
  FaArrowRight, FaDollarSign, FaClock, FaRegCalendarAlt,
  FaChartLine, FaUserPlus, FaFileAlt
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

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' },
  }),
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    users: { total: 0, patients: 0, doctors: 0, admins: 0, active: 0 },
    appointments: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, today: 0 },
    shop: { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, totalProducts: 0 },
    contacts: { total: 0, pending: 0, resolved: 0 },
    reviews: { total: 0, averageRating: 0, fiveStar: 0, fourStar: 0 },
    blogs: { total: 0, published: 0, drafts: 0 },
    subscriptions: { total: 0, active: 0 }
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [
        usersRes,
        appointmentsStatsRes,
        ordersRes,
        productsRes,
        contactsRes,
        reviewsRes,
        blogsRes,
        subsRes
      ] = await Promise.allSettled([
        usersApi.getAll({ limit: 100 }),
        appointmentsApi.getStats(),
        shopApi.getAllOrdersAdmin({ limit: 1 }),
        shopApi.getProductStats(),
        contactApi.getStats(),
        reviewsApi.getStats(),
        blogsApi.getStats(),
        subscriptionApi.getStats()
      ])

      // Process Users
      if (usersRes.status === 'fulfilled') {
        const users = usersRes.value.data.users || []
        const userStats = usersRes.value.data.stats || {}
        setStats(prev => ({
          ...prev,
          users: {
            total: userStats.totalPatients + userStats.totalDoctors + (userStats.totalAdmins || 0) || users.length,
            patients: userStats.totalPatients || users.filter(u => u.role === 'patient').length,
            doctors: userStats.totalDoctors || users.filter(u => u.role === 'doctor').length,
            admins: userStats.totalAdmins || users.filter(u => u.role === 'admin').length,
            active: users.filter(u => u.isActive !== false).length
          }
        }))
      }

      // Process Appointments Stats
      if (appointmentsStatsRes.status === 'fulfilled') {
        const aptStats = appointmentsStatsRes.value.data.stats || {}
        setStats(prev => ({
          ...prev,
          appointments: {
            total: aptStats.total || 0,
            pending: aptStats.pending || 0,
            confirmed: aptStats.confirmed || 0,
            completed: aptStats.completed || 0,
            cancelled: aptStats.cancelled || 0,
            today: aptStats.today || 0
          }
        }))
      }

      // Process Shop Orders
      if (ordersRes.status === 'fulfilled') {
        const orderData = ordersRes.value.data || {}
        const orderStats = orderData.stats || {}
        setStats(prev => ({
          ...prev,
          shop: {
            ...prev.shop,
            totalOrders: orderStats.total || 0,
            totalRevenue: orderStats.revenue || 0,
            pendingOrders: orderStats.pending || 0
          }
        }))
      }

      // Process Products
      if (productsRes.status === 'fulfilled') {
        const productStats = productsRes.value.data.stats || {}
        setStats(prev => ({
          ...prev,
          shop: {
            ...prev.shop,
            totalProducts: productStats.total || 0
          }
        }))
      }

      // Process Contacts
      if (contactsRes.status === 'fulfilled') {
        const contactStats = contactsRes.value.data.stats || {}
        setStats(prev => ({
          ...prev,
          contacts: {
            total: contactStats.total || 0,
            pending: contactStats.pending || 0,
            resolved: contactStats.resolved || 0
          }
        }))
      }

      // Process Reviews
      if (reviewsRes.status === 'fulfilled') {
        const reviewStats = reviewsRes.value.data.stats || {}
        const distribution = reviewStats.ratingDistribution || {}
        setStats(prev => ({
          ...prev,
          reviews: {
            total: reviewStats.total || 0,
            averageRating: reviewStats.averageRating || 0,
            fiveStar: distribution[5] || 0,
            fourStar: distribution[4] || 0
          }
        }))
      }

      // Process Blogs
      if (blogsRes.status === 'fulfilled') {
        const blogStats = blogsRes.value.data.stats || {}
        setStats(prev => ({
          ...prev,
          blogs: {
            total: blogStats.total || 0,
            published: blogStats.published || 0,
            drafts: blogStats.drafts || 0
          }
        }))
      }

      // Process Subscriptions
      if (subsRes.status === 'fulfilled') {
        const subStats = subsRes.value.data.stats || {}
        setStats(prev => ({
          ...prev,
          subscriptions: {
            total: subStats.total || 0,
            active: subStats.active || 0
          }
        }))
      }

      const failed = [
        { name: 'Users', result: usersRes },
        { name: 'Appointments', result: appointmentsStatsRes },
        { name: 'Orders', result: ordersRes },
        { name: 'Products', result: productsRes },
        { name: 'Contacts', result: contactsRes },
        { name: 'Reviews', result: reviewsRes },
        { name: 'Blogs', result: blogsRes },
        { name: 'Subscriptions', result: subsRes }
      ].filter(r => r.result.status === 'rejected')

      

    } catch (error) {

      setError('Failed to load dashboard data. Please refresh the page.')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: FaUsers,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/users',
      sub: `${stats.users.active} active`
    },
    {
      title: 'Appointments',
      value: stats.appointments.total,
      icon: FaCalendarCheck,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/appointments',
      sub: `${stats.appointments.today} today`
    },
    {
      title: 'Orders',
      value: stats.shop.totalOrders,
      icon: FaShoppingCart,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/orders',
      sub: `GHS ${stats.shop.totalRevenue.toFixed(2)}`
    },
    {
      title: 'Revenue',
      value: `GH₵${stats.shop.totalRevenue.toFixed(0)}`,
      icon: FaDollarSign,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/orders',
      sub: `${stats.shop.pendingOrders} pending orders`
    },
    {
      title: 'Reviews',
      value: stats.reviews.total,
      icon: FaStar,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/reviews',
      sub: `⭐ ${stats.reviews.averageRating.toFixed(1)} avg`
    },
    {
      title: 'Blog Posts',
      value: stats.blogs.total,
      icon: FaBlog,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/blogs',
      sub: `${stats.blogs.published} published`
    },
    {
      title: 'Messages',
      value: stats.contacts.total,
      icon: FaEnvelope,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/contacts',
      sub: `${stats.contacts.pending} unread`
    },
    {
      title: 'Subscribers',
      value: stats.subscriptions.total,
      icon: FaUsers,
      color: '#0D7D72',
      bgColor: '#E8F5F3',
      link: '/admin/subscribers',
      sub: `${stats.subscriptions.active} active`
    }
  ]

  const quickActions = [
    { label: '📅 View Appointments', to: '/admin/appointments' },
    { label: '➕ Add New Product', to: '/admin/products/new' },
    { label: '✍️ Write Blog Post', to: '/admin/blogs/new' },
    { label: '👨‍⚕️ Add Doctor', to: '/admin/doctors/add' },
    { label: '👤 Add Patient', to: '/admin/patients/add' },
    { label: '📊 View All Orders', to: '/admin/orders' },
  ]

  const appointmentStatus = [
    { label: 'Pending', value: stats.appointments.pending, color: '#B45309', bgColor: '#FEF3C7' },
    { label: 'Confirmed', value: stats.appointments.confirmed, color: '#0D7D72', bgColor: '#E8F5F3' },
    { label: 'Completed', value: stats.appointments.completed, color: '#0D7D72', bgColor: '#D1FAE5' },
    { label: 'Cancelled', value: stats.appointments.cancelled, color: '#DC2626', bgColor: '#FEE2E2' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#0D7D72] mx-auto" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2.5 bg-[#0D7D72] text-white rounded-lg font-medium hover:bg-[#0A635A] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Admin'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening across Sakumono Community Hospital today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={fadeUp}
              >
                <Link
                  to={stat.link}
                  className="group block bg-white rounded-xl border border-[#E8F0EC] p-4 hover:shadow-[0_8px_30px_rgba(13,125,114,0.12)] transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl bg-[#E8F5F3] flex items-center justify-center`}>
                      <Icon className="text-lg text-[#0D7D72]" />
                    </div>
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
                  <p className="text-xs text-[#0D7D72] mt-1 font-medium">{stat.sub}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#E8F0EC] shadow-[0_4px_20px_rgba(13,125,114,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8F0EC]">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaClock className="text-[#0D7D72]" size={14} />
                Quick Actions
              </h3>
            </div>
            <div className="p-2">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[#E8F5F3] transition-colors group"
                >
                  <span>{action.label}</span>
                  <FaArrowRight className="text-xs text-gray-400 group-hover:text-[#0D7D72] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Appointment Status */}
          <div className="bg-white rounded-xl border border-[#E8F0EC] shadow-[0_4px_20px_rgba(13,125,114,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8F0EC]">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaRegCalendarAlt className="text-[#0D7D72]" size={14} />
                Appointment Status
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {appointmentStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`text-sm font-semibold text-[${item.color}]`}>{item.value}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-[#E8F0EC] flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-sm font-bold text-gray-900">{stats.appointments.total}</span>
              </div>
            </div>
          </div>

          {/* Quick Overview */}
          <div className="bg-white rounded-xl border border-[#E8F0EC] shadow-[0_4px_20px_rgba(13,125,114,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8F0EC]">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FaChartLine className="text-[#0D7D72]" size={14} />
                Quick Overview
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Patients</span>
                <span className="text-sm font-semibold text-gray-900">{stats.users.patients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doctors</span>
                <span className="text-sm font-semibold text-gray-900">{stats.users.doctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Products</span>
                <span className="text-sm font-semibold text-gray-900">{stats.shop.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reviews</span>
                <span className="text-sm font-semibold text-gray-900">{stats.reviews.total}</span>
              </div>
              <div className="pt-3 border-t border-[#E8F0EC] flex items-center justify-between">
                <span className="text-sm text-gray-600">Rating</span>
                <span className="text-sm font-semibold text-[#0D7D72]">⭐ {stats.reviews.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard