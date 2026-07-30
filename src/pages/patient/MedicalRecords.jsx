import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiFileText, FiSearch, FiEye, FiCalendar, 
  FiUser, FiDownload, FiPrinter,
  FiClock, FiFilter, FiChevronDown, FiX,
  FiFile, FiBookOpen, FiHeart, FiActivity
} from 'react-icons/fi'
import { medicalRecordsApi } from '../../api/medicalRecords.api'
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

const MedicalRecords = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    thisYear: 0,
    lastYear: 0
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    fetchRecords()
  }, [pagination.page])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      const response = await medicalRecordsApi.getMine(params)
      setRecords(response.data.records || [])
      setStats({
        total: response.data.pagination?.total || 0,
        thisYear: response.data.records?.filter(r => new Date(r.date).getFullYear() === new Date().getFullYear()).length || 0,
        lastYear: response.data.records?.filter(r => new Date(r.date).getFullYear() === new Date().getFullYear() - 1).length || 0
      })
      setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 })
    } catch (error) {
      toast.error('Failed to load medical records')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRecordIcon = (diagnosis) => {
    const keywords = {
      'heart': FiHeart,
      'cardio': FiHeart,
      'lung': FiActivity,
      'respiratory': FiActivity,
      'bone': FiActivity,
      'ortho': FiActivity,
      'brain': FiActivity,
      'neuro': FiActivity,
    }
    
    for (const [key, Icon] of Object.entries(keywords)) {
      if (diagnosis?.toLowerCase().includes(key)) {
        return Icon
      }
    }
    return FiFile
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading medical records...</p>
        </div>
      </div>
    )
  }

  const filteredRecords = records.filter(record => {
    if (!search) return true
    const diagnosis = record.diagnosis?.toLowerCase() || ''
    const doctorName = `${record.doctor?.firstName || ''} ${record.doctor?.lastName || ''}`.toLowerCase()
    const symptoms = record.symptoms?.join(' ').toLowerCase() || ''
    const term = search.toLowerCase()
    return diagnosis.includes(term) || doctorName.includes(term) || symptoms.includes(term)
  })

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} total record{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FiPrinter size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <FiDownload size={16} /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Records</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.thisYear}</p>
            <p className="text-xs text-gray-500">This Year</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.lastYear}</p>
            <p className="text-xs text-gray-500">Last Year</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by diagnosis, doctor, or symptoms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FiFilter /> Filters
              <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <FiX /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No medical records found</h3>
            <p className="text-gray-500 text-sm">
              {search ? 'Try adjusting your search.' : 'Your medical records will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => {
              const RecordIcon = getRecordIcon(record.diagnosis)
              
              return (
                <motion.div
                  key={record._id}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  variants={fadeUp}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    {/* Left */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                          <RecordIcon size={18} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{record.diagnosis}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FiCalendar size={14} /> {formatDate(record.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiUser size={14} /> Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {record.symptoms?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {record.symptoms.slice(0, 3).map((symptom, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {symptom}
                            </span>
                          ))}
                          {record.symptoms.length > 3 && (
                            <span className="text-xs text-gray-400">+{record.symptoms.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {record.treatment?.medications?.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                          <span>💊 {record.treatment.medications.length} medication{record.treatment.medications.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {/* Right - Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/patient/medical-records/${record._id}`}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        <FiEye size={14} /> View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalRecords