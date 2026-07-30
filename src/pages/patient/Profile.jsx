import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiMail, FiPhone, FiMapPin, FiCalendar,
  FiEdit2, FiCamera, FiDroplet, FiUsers,
  FiFileText, FiClock, FiArrowRight, FiUser,
  FiStar, FiHeart, FiCheckCircle, FiAward,
  FiCalendar as FiCalendarIcon, FiClock as FiClockIcon
} from 'react-icons/fi'
import { patientsApi } from '../../api/patients.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

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
    className="w-full h-[34px] text-[#B8863E]"
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

const PatientProfile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await patientsApi.getProfile()
      
      setProfile(response.data.patient)
      setPatientData(response.data.user)
      setStats(response.data.patient?.stats || {})
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'P'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-emerald-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const userData = patientData || user || {}
  const patient = profile || {}

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your personal and medical information</p>
          </div>
          <Link
            to="/patient/profile/edit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <FiEdit2 size={14} /> Edit Profile
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Cover & Avatar Section */}
              <div className="relative">
                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
                
                {/* Avatar */}
                <div className="absolute -bottom-12 left-6 md:left-8">
                  {userData.profileImage ? (
                    <img 
                      src={userData.profileImage} 
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-emerald-600">
                      {getInitials(userData.firstName, userData.lastName)}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
                    <FiCheckCircle className="text-emerald-600" size={14} />
                    Active
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 pb-6 px-6 md:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <FiUser size={14} /> Patient
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <FiCalendarIcon size={14} /> {formatDate(patient.dateOfBirth)}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <FiDroplet size={14} /> Blood Type: {patient.bloodType || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Link
                      to="/patient/appointments/new"
                      className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors text-center"
                    >
                      <FiCalendarIcon className="inline mr-1.5" size={12} /> Book Appointment
                    </Link>
                    <Link
                      to="/patient/medical-records"
                      className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-center"
                    >
                      <FiFileText className="inline mr-1.5" size={12} /> Records
                    </Link>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="border-t border-gray-100 px-6 md:px-8 py-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column - Personal & Contact */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiUser className="text-emerald-600" size={14} /> Personal Information
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <FiMail size={14} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Email</p>
                            <p className="font-medium text-gray-800">{userData.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <FiPhone size={14} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Phone</p>
                            <p className="font-medium text-gray-800">{userData.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                            <FiMapPin size={14} />
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Gender</p>
                            <p className="font-medium text-gray-800">{patient.gender || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {patient.address && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FiMapPin className="text-emerald-600" size={14} /> Address
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {patient.address.street}<br />
                          {patient.address.city}, {patient.address.state}<br />
                          {patient.address.country}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Medical Info */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiHeart className="text-emerald-600" size={14} /> Medical Information
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Blood Type</span>
                          <span className="font-medium text-gray-800">{patient.bloodType || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Date of Birth</span>
                          <span className="font-medium text-gray-800">{formatDate(patient.dateOfBirth)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                          <span className="text-gray-500">Gender</span>
                          <span className="font-medium text-gray-800">{patient.gender || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Member Since</span>
                          <span className="font-medium text-gray-800">{formatDate(patient.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {patient.emergencyContact && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <FiUsers className="text-emerald-600" size={14} /> Emergency Contact
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium text-gray-800">{patient.emergencyContact.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Relationship</span>
                            <span className="font-medium text-gray-800">{patient.emergencyContact.relationship}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-800">{patient.emergencyContact.phone}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="border-t border-gray-100 bg-gray-50 px-6 md:px-8 py-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Total Appointments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{stats.completedAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{stats.upcomingAppointments || 0}</p>
                    <p className="text-xs text-gray-500">Upcoming</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.medicalRecords || 0}</p>
                    <p className="text-xs text-gray-500">Medical Records</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Quick Actions & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-5 text-white"
            >
              <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Total Appointments</span>
                  <span className="font-bold">{stats.totalAppointments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Completed</span>
                  <span className="font-bold text-emerald-200">{stats.completedAppointments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Upcoming</span>
                  <span className="font-bold text-yellow-200">{stats.upcomingAppointments || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Medical Records</span>
                  <span className="font-bold">{stats.medicalRecords || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
            >
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/patient/appointments/new"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  <FiCalendarIcon size={14} /> Book Appointment
                </Link>
                <Link
                  to="/patient/medical-records"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FiFileText size={14} /> View Records
                </Link>
                <Link
                  to="/patient/appointments"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FiClockIcon size={14} /> My Appointments
                </Link>
                <Link
                  to="/patient/profile/edit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FiEdit2 size={14} /> Edit Profile
                </Link>
              </div>
            </motion.div>

            {/* Emergency Contact Card */}
            {patient.emergencyContact && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FiUsers className="text-emerald-600" size={14} /> Emergency Contact
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-800">{patient.emergencyContact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Relationship</span>
                    <span className="font-medium text-gray-800">{patient.emergencyContact.relationship}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-800">{patient.emergencyContact.phone}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientProfile