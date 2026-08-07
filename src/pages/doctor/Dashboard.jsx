import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FaCalendarAlt, FaClock, FaUser, FaFileMedical, 
  FaShoppingBag, FaBell, FaHeartbeat, FaChartLine,
  FaArrowRight, FaCheckCircle, FaSpinner,
  FaCalendarCheck, FaUsers, FaStar,
  FaPlus, FaEye, FaPrescription, FaAmbulance,
  FaUserMd, FaStethoscope, FaClipboardList,
  FaSyringe, FaPrescriptionBottle, FaHospitalAlt,
  FaNotesMedical, FaHistory, FaSearch, FaFilter,
  FaChevronRight, FaTimesCircle
} from 'react-icons/fa'
import { doctorsApi } from '../../api/doctors.api'
import { appointmentsApi } from '../../api/appointments.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
}

const DoctorDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,  // ✅ Keep as number
    rating: 0,
    totalReviews: 0
  })
  const [todayAppointments, setTodayAppointments] = useState([])
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch doctor stats
      const statsRes = await doctorsApi.getMyStats()
      const statsData = statsRes.data.stats || {}
      
      // ✅ FIX: Extract the count properly
      let todayCount = 0
      if (statsData.todayAppointments) {
        if (typeof statsData.todayAppointments === 'number') {
          todayCount = statsData.todayAppointments
        } else if (typeof statsData.todayAppointments === 'object' && statsData.todayAppointments !== null) {
          // If it's an object with count property
          todayCount = statsData.todayAppointments.count || statsData.todayAppointments.length || 0
        }
      }

      setStats({
        totalAppointments: statsData.totalAppointments || 0,
        pendingAppointments: statsData.pendingAppointments || 0,
        confirmedAppointments: statsData.confirmedAppointments || 0,
        completedAppointments: statsData.completedAppointments || 0,
        cancelledAppointments: statsData.cancelledAppointments || 0,
        todayAppointments: todayCount,  // ✅ Always a number
        rating: statsData.rating || 0,
        totalReviews: statsData.totalReviews || 0
      })

      // Fetch doctor profile
      const profileRes = await doctorsApi.getMyProfile()
      setProfile(profileRes.data.doctor)

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0]
      const appointmentsRes = await appointmentsApi.getForDoctor({ 
        date: today,
        limit: 10
      })
      
      // ✅ Make sure we're setting an array
      const todayApts = appointmentsRes.data.appointments || []
      setTodayAppointments(todayApts)

      // Fetch upcoming appointments (next 7 days)
      const upcomingRes = await appointmentsApi.getForDoctor({
        status: 'pending,confirmed',
        limit: 10
      })
      
      // ✅ Make sure we're setting an array
      const upcomingApts = upcomingRes.data.appointments || []
      setUpcomingAppointments(upcomingApts)

    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'bg-emerald-100 text-emerald-700',
      'completed': 'bg-blue-100 text-blue-700',
      'pending': 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-purple-100 text-purple-700',
      'cancelled': 'bg-red-100 text-red-700',
      'no-show': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status) => {
    if (status === 'confirmed') return <FaCheckCircle className="text-emerald-600" size={12} />
    if (status === 'completed') return <FaCheckCircle className="text-blue-600" size={12} />
    if (status === 'pending') return <FaClock className="text-amber-600" size={12} />
    if (status === 'cancelled') return <FaTimesCircle className="text-red-600" size={12} />
    return <FaClock className="text-gray-600" size={12} />
  }

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl p-6 md:p-8 text-white mb-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                  👨‍⚕️
                </div>
                <div>
                  <h1 className="text-2xl text-white md:text-3xl font-semibold">
                    Welcome back, Dr. {user?.firstName || 'Doctor'}!
                  </h1>
                  <p className="text-emerald-100 mt-0.5 text-sm">
                    Here's your practice overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                profile?.isAvailableForConsultation 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${profile?.isAvailableForConsultation ? 'bg-white' : 'bg-red-300'}`} />
                {profile?.isAvailableForConsultation ? 'Available' : 'Unavailable'}
              </span>
              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <FaClipboardList /> View All
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {[
            { 
              icon: FaCalendarAlt, 
              value: stats.totalAppointments || 0, 
              label: 'Total Patients',
              color: 'blue'
            },
            { 
              icon: FaClock, 
              value: stats.pendingAppointments || 0, 
              label: 'Pending',
              color: 'amber'
            },
            { 
              icon: FaCheckCircle, 
              value: stats.confirmedAppointments || 0, 
              label: 'Confirmed',
              color: 'emerald'
            },
            { 
              icon: FaHistory, 
              value: stats.completedAppointments || 0, 
              label: 'Completed',
              color: 'purple'
            },
            { 
              icon: FaCalendarCheck, 
              value: stats.todayAppointments || 0,  // ✅ Now always a number
              label: "Today's",
              color: 'indigo'
            },
            { 
              icon: FaStar, 
              value: stats.rating?.toFixed(1) || '0.0', 
              label: 'Rating',
              color: 'orange'
            }
          ].map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
              amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
              emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
              purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
              indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
              orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
            }
            return (
              <motion.div
                key={index}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={fadeUp}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 ${colorClasses[stat.color]} rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors`}>
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Appointments */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={5}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-emerald-600" /> Today's Appointments
              </h2>
              <span className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                {todayAppointments?.length || 0} patients
              </span>
            </div>

            {!todayAppointments || todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📅</div>
                <p className="text-gray-500 text-sm">No appointments today</p>
                <p className="text-gray-400 text-xs mt-1">Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {todayAppointments.map((apt, index) => (
                  <div key={apt._id || index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                        <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                          {apt.patient?.firstName?.[0] || 'U'}{apt.patient?.lastName?.[0] || ''}
                        </span>
                        {apt.patient?.firstName || 'Unknown'} {apt.patient?.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <FaClock size={10} className="text-gray-400" />
                        {apt.timeSlot || 'N/A'}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)} {getStatusLabel(apt.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={6}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaClock className="text-purple-600" /> Upcoming
              </h2>
              <Link to="/doctor/appointments" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                View All <FaChevronRight size={12} />
              </Link>
            </div>

            {!upcomingAppointments || upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500 text-sm">No upcoming appointments</p>
                <p className="text-gray-400 text-xs mt-1">Check back later for new bookings</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {upcomingAppointments.map((apt, index) => (
                  <div key={apt._id || index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 hover:bg-gray-50 rounded-lg px-2 py-2 transition-colors">
                    <div>
                      <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                        <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                          {apt.patient?.firstName?.[0] || 'U'}{apt.patient?.lastName?.[0] || ''}
                        </span>
                        {apt.patient?.firstName || 'Unknown'} {apt.patient?.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <FaCalendarAlt size={10} className="text-gray-400" />
                        {formatDate(apt.date)} at {apt.timeSlot || 'N/A'}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusIcon(apt.status)} {getStatusLabel(apt.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={7}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
        >
          {[
            { to: '/doctor/appointments', icon: FaClipboardList, label: 'Appointments', color: 'blue' },
            { to: '/doctor/availability', icon: FaClock, label: 'Availability', color: 'purple' },
            { to: '/doctor/profile', icon: FaUserMd, label: 'My Profile', color: 'emerald' },
            { to: '/doctor/patients', icon: FaUsers, label: 'Patients', color: 'orange' }
          ].map((action, index) => {
            const Icon = action.icon
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
              purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
              emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
              orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100'
            }
            return (
              <Link
                key={index}
                to={action.to}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 ${colorClasses[action.color]} rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm font-medium text-gray-700">{action.label}</p>
              </Link>
            )
          })}
        </motion.div>

        {/* Rating Summary */}
        {stats.totalReviews > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={8}
            className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gray-800">{stats.rating?.toFixed(1)}</div>
              <div>
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.round(stats.rating || 0) ? 'text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <p className="text-sm text-gray-500">{stats.totalReviews} patient reviews</p>
              </div>
            </div>
            <Link to="/reviews" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              View Reviews <FaChevronRight size={12} />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DoctorDashboard