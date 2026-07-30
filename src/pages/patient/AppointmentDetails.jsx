import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiCalendar, FiClock, FiMapPin, FiVideo, FiPhone, FiCheckCircle, FiXCircle, FiClock as FiClockIcon, FiFileText, } from 'react-icons/fi'
import { appointmentsApi } from '../../api/appointments.api'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const AppointmentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState(null)

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const fetchAppointment = async () => {
    setLoading(true)
    try {
      const response = await appointmentsApi.getById(id)
      setAppointment(response.data.appointment)
    } catch (error) {
      toast.error('Failed to load appointment')
      navigate('/patient/appointments')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: FiClockIcon },
      'confirmed': { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
      'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: FiClockIcon },
      'completed': { label: 'Completed', color: 'bg-purple-100 text-purple-700', icon: FiCheckCircle },
      'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: FiXCircle },
      'no-show': { label: 'No Show', color: 'bg-gray-100 text-gray-700', icon: FiXCircle }
    }
    return configs[status] || configs['pending']
  }

  const getTypeLabel = (type) => {
    if (type === 'video') return 'Video Call'
    if (type === 'phone') return 'Phone Call'
    return 'In-Person'
  }

  const getTypeIcon = (type) => {
    if (type === 'video') return <FiVideo className="text-blue-500" />
    if (type === 'phone') return <FiPhone className="text-green-500" />
    return <FiMapPin className="text-purple-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading appointment...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Appointment not found</p>
        <Link to="/patient/appointments" className="text-green-600 hover:text-green-700">Go Back</Link>
      </div>
    )
  }

  const StatusConfig = getStatusConfig(appointment.status)
  const StatusIcon = StatusConfig.icon

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/patient/appointments" className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Appointment Details</h1>
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${StatusConfig.color}`}>
            <StatusIcon size={12} /> {StatusConfig.label}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Doctor Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl">
              {appointment.doctor?.firstName?.[0] || 'D'}{appointment.doctor?.lastName?.[0] || ''}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
              </h2>
              <p className="text-sm text-gray-500">{appointment.doctor?.specialization || 'General'}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <FiCalendar className="text-green-600" />
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{new Date(appointment.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiClock className="text-green-600" />
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{appointment.timeSlot}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {getTypeIcon(appointment.type)}
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{getTypeLabel(appointment.type)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiClock className="text-green-600" />
              <div>
                <p className="text-gray-500">Duration</p>
                <p className="font-medium text-gray-900">{appointment.duration || 30} mins</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">Reason</p>
            <p className="text-gray-900">{appointment.reason}</p>
          </div>

          {/* Symptoms */}
          {appointment.symptoms?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">Symptoms</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {appointment.symptoms.map((s, i) => (
                  <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Notes */}
          {appointment.doctorNotes && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">Doctor's Notes</p>
              <p className="text-gray-700">{appointment.doctorNotes}</p>
            </div>
          )}

          {/* Prescription */}
          {appointment.prescription?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500 font-medium">Prescription</p>
              <div className="space-y-2 mt-2">
                {appointment.prescription.map((med, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{med.medication}</p>
                    {med.dosage && <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>}
                    {med.instructions && <p className="text-sm text-gray-600">Instructions: {med.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetails