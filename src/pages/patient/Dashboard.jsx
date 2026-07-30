import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCalendar, FiClock, FiUser, FiFileText,
  FiShoppingBag, FiCheckCircle, FiArrowRight,
  FiAlertCircle, FiXCircle, FiClock as FiClockIcon,
  FiCheck, FiMinusCircle, FiCalendar as FiCalendarIcon
} from 'react-icons/fi'
import { patientsApi } from '../../api/patients.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

/*
  Shares the design system introduced in PatientProfile.jsx — same palette,
  type roles, and pulse-trace signature, so the two pages read as one product.
  Fonts (add once, globally): Fraunces, Inter, IBM Plex Mono — see PatientProfile.jsx.
*/

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' },
  }),
}

const PulseDivider = () => (
  <svg
    viewBox="0 0 1200 60"
    preserveAspectRatio="none"
    className="w-full h-[28px] text-[#B8863E]"
    aria-hidden="true"
  >
    <motion.path
      d="M0 30 L260 30 L285 30 L300 8 L318 52 L336 30 L360 30 L960 30 L985 30 L1000 12 L1015 48 L1030 30 L1200 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0.4 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
    />
  </svg>
)

// ============================================================
// COLORFUL STATUS STYLES
// ============================================================
const STATUS_STYLES = {
  confirmed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: FiCheckCircle,
    iconColor: 'text-emerald-600',
    label: 'Confirmed'
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: FiCheck,
    iconColor: 'text-blue-600',
    label: 'Completed'
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: FiClockIcon,
    iconColor: 'text-amber-600',
    label: 'Pending'
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: FiXCircle,
    iconColor: 'text-red-600',
    label: 'Cancelled'
  },
  'in-progress': {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: FiAlertCircle,
    iconColor: 'text-purple-600',
    label: 'In Progress'
  },
  'no-show': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: FiMinusCircle,
    iconColor: 'text-gray-600',
    label: 'No Show'
  }
}

const QUICK_LINKS = [
  { to: '/patient/appointments/new', icon: FiCalendar, label: 'Book appointment' },
  { to: '/patient/medical-records', icon: FiFileText, label: 'Medical records' },
  { to: '/patient/orders', icon: FiShoppingBag, label: 'My orders' },
  { to: '/patient/profile', icon: FiUser, label: 'My profile' },
]

const PatientDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    medicalRecords: 0,
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentRecords, setRecentRecords] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await patientsApi.getDashboard()
      setStats(response.data.stats || {})
      setUpcomingAppointments(response.data.upcomingAppointments || [])
      setRecentRecords(response.data.recentMedicalRecords || [])
    } catch (error) {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Get status style with fallback
  const getStatusStyle = (status) => {
    return STATUS_STYLES[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: FiClockIcon,
      iconColor: 'text-gray-600',
      label: status || 'Unknown'
    }
  }

  // Status badge component
  const StatusBadge = ({ status }) => {
    const style = getStatusStyle(status)
    const Icon = style.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
        <Icon size={12} className={style.iconColor} />
        {style.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#F3F5F3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#E3E7E4] border-t-[#2F5D50] mx-auto"></div>
          <p className="mt-4 text-sm text-[#62726D]">Loading your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F5F3] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Masthead */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
            <div>
              <p className="text-[12px] uppercase tracking-widest text-[#B8863E] font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="font-['Fraunces'] text-[28px] leading-tight text-[#16241F]">
                Welcome back, {user?.firstName}
              </h1>
            </div>
            <Link
              to="/patient/appointments/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2F5D50] text-white rounded-lg text-sm font-medium hover:bg-[#1F4038] transition-colors"
            >
              <FiClock size={14} /> Book appointment
            </Link>
          </div>
          <PulseDivider />
        </motion.div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 mb-6">
          {[
            ['Appointments', stats.totalAppointments, FiCalendar],
            ['Upcoming', stats.upcomingAppointments, FiClock],
            ['Completed', stats.completedAppointments, FiCheckCircle],
            ['Records', stats.medicalRecords, FiFileText],
          ].map(([label, value, Icon], i) => (
            <motion.div
              key={label}
              initial="hidden"
              animate="visible"
              custom={i + 1}
              variants={fadeUp}
              className="bg-white rounded-xl border border-[#E3E7E4] px-4 py-3.5 hover:border-[#2F5D50]/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-[#62726D]">{label}</p>
                <Icon size={13} className="text-[#B8863E]" />
              </div>
              <p className="font-['IBM_Plex_Mono'] text-2xl mt-1 text-[#16241F]">{value ?? 0}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming appointments */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={5}
            variants={fadeUp}
            className="bg-white rounded-2xl border border-[#E3E7E4] p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-medium text-[#16241F] flex items-center gap-2">
                <FiCalendarIcon size={15} className="text-[#2F5D50]" /> Upcoming appointments
              </h2>
              <Link
                to="/patient/appointments"
                className="text-[13px] text-[#2F5D50] hover:underline font-medium flex items-center gap-1"
              >
                View all <FiArrowRight size={12} />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 bg-[#F3F5F3] rounded-xl">
                <p className="text-[#62726D] text-sm">No upcoming appointments</p>
                <Link
                  to="/patient/appointments/new"
                  className="text-[#2F5D50] hover:underline text-sm font-medium inline-flex items-center gap-1 mt-1"
                >
                  Book one now <FiArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt, index) => (
                  <div
                    key={apt._id || index}
                    className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-[#F3F5F3] transition-colors"
                  >
                    <div>
                      <p className="font-medium text-[#16241F] text-sm">
                        Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                      </p>
                      <p className="text-[12px] text-[#62726D] font-['IBM_Plex_Mono'] mt-0.5">
                        {formatDate(apt.date)} · {apt.timeSlot}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent medical records */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={6}
            variants={fadeUp}
            className="bg-white rounded-2xl border border-[#E3E7E4] p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-medium text-[#16241F] flex items-center gap-2">
                <FiFileText size={15} className="text-[#2F5D50]" /> Recent medical records
              </h2>
              <Link
                to="/patient/medical-records"
                className="text-[13px] text-[#2F5D50] hover:underline font-medium flex items-center gap-1"
              >
                View all <FiArrowRight size={12} />
              </Link>
            </div>

            {recentRecords.length === 0 ? (
              <div className="text-center py-8 bg-[#F3F5F3] rounded-xl">
                <p className="text-[#62726D] text-sm">No medical records yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentRecords.slice(0, 3).map((record, index) => (
                  <div
                    key={record._id || index}
                    className="flex items-center justify-between py-3 border-b border-[#E3E7E4] last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[#16241F] text-sm">{record.diagnosis || 'N/A'}</p>
                      <p className="text-[12px] text-[#62726D] mt-0.5">
                        Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                      </p>
                    </div>
                    <span className="text-[12px] text-[#62726D] font-['IBM_Plex_Mono']">
                      {formatDate(record.date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={7}
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
        >
          {QUICK_LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-xl border border-[#E3E7E4] p-4 text-center hover:border-[#2F5D50]/40 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 bg-[#F3F5F3] rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-[#2F5D50]/10 transition-colors">
                <Icon className="text-[#2F5D50]" size={17} />
              </div>
              <p className="text-[13px] font-medium text-[#16241F]">{label}</p>
            </Link>
          ))}
        </motion.div>

        {/* Status Legend */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={8}
          variants={fadeUp}
          className="mt-6 p-4 bg-white rounded-xl border border-[#E3E7E4]"
        >
          <p className="text-[12px] text-[#62726D] mb-2">Status Legend</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATUS_STYLES).map(([key, style]) => {
              const Icon = style.icon
              return (
                <span key={key} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} border ${style.border}`}>
                  <Icon size={12} className={style.iconColor} />
                  {style.label}
                </span>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PatientDashboard