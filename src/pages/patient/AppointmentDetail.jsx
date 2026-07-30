import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaArrowLeft, FaSpinner, FaCalendarAlt, FaClock,
  FaUser, FaPhone, FaEnvelope, FaVideo, FaMapMarkerAlt,
  FaCheckCircle, FaTimesCircle, FaClock as FaClockIcon,
  FaFileAlt, FaStethoscope, FaClipboardList,
  FaEdit, FaSave, FaTimes, FaUserMd,
  FaPrescription, FaNotesMedical, FaCheck, FaBan
} from 'react-icons/fa'
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

const AppointmentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [status, setStatus] = useState('')
  const [prescription, setPrescription] = useState({
    medication: '',
    dosage: '',
    instructions: ''
  })
  const [prescriptions, setPrescriptions] = useState([])

  useEffect(() => {
    fetchAppointment()
  }, [id])

  const fetchAppointment = async () => {
    setLoading(true)
    try {
      const response = await appointmentsApi.getById(id)
      setAppointment(response.data.appointment)
      setStatus(response.data.appointment.status)
      setDoctorNotes(response.data.appointment.doctorNotes || '')
      setPrescriptions(response.data.appointment.prescription || [])
    } catch (error) {
      console.error('Fetch appointment error:', error)
      toast.error('Failed to load appointment')
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return

    setUpdating(true)
    try {
      // Make sure we're sending the status in the correct format
      const data = { status: newStatus }
      console.log('Updating status with data:', data)

      const response = await appointmentsApi.update(id, data)
      console.log('Update response:', response.data)

      toast.success(`Appointment ${newStatus}`)
      setStatus(newStatus)
      fetchAppointment() // Refresh the data
    } catch (error) {
      console.error('Status update error:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveNotes = async () => {
    setUpdating(true)
    try {
      await appointmentsApi.update(id, { doctorNotes })
      toast.success('Notes saved successfully')
      setIsEditing(false)
      fetchAppointment()
    } catch (error) {
      console.error('Save notes error:', error)
      toast.error('Failed to save notes')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddPrescription = async () => {
    if (!prescription.medication) {
      toast.error('Please enter medication name')
      return
    }

    const newPrescriptions = [...prescriptions, {
      medication: prescription.medication,
      dosage: prescription.dosage || '',
      instructions: prescription.instructions || '',
      prescribedDate: new Date().toISOString()
    }]

    setUpdating(true)
    try {
      await appointmentsApi.update(id, { prescription: newPrescriptions })
      toast.success('Prescription added successfully')
      setPrescriptions(newPrescriptions)
      setPrescription({ medication: '', dosage: '', instructions: '' })
      fetchAppointment()
    } catch (error) {
      console.error('Add prescription error:', error)
      toast.error('Failed to add prescription')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemovePrescription = async (index) => {
    if (!confirm('Remove this prescription?')) return

    const newPrescriptions = prescriptions.filter((_, i) => i !== index)
    setUpdating(true)
    try {
      await appointmentsApi.update(id, { prescription: newPrescriptions })
      toast.success('Prescription removed')
      setPrescriptions(newPrescriptions)
      fetchAppointment()
    } catch (error) {
      console.error('Remove prescription error:', error)
      toast.error('Failed to remove prescription')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-purple-100 text-purple-700',
      'cancelled': 'bg-red-100 text-red-700',
      'no-show': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status) => {
    if (status === 'confirmed') return <FaCheckCircle className="text-green-600" />
    if (status === 'cancelled') return <FaTimesCircle className="text-red-600" />
    if (status === 'in-progress') return <FaClockIcon className="text-blue-600" />
    if (status === 'completed') return <FaCheck className="text-purple-600" />
    return <FaClockIcon className="text-yellow-600" />
  }

  const getTypeIcon = (type) => {
    if (type === 'video') return <FaVideo className="text-blue-500" />
    if (type === 'phone') return <FaPhone className="text-green-500" />
    return <FaMapMarkerAlt className="text-purple-500" />
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isPatient = user?.role === 'patient'
  const isDoctor = user?.role === 'doctor'
  const isAdmin = user?.role === 'admin'

  const canEdit = isDoctor || isAdmin
  const canUpdateStatus = isDoctor || isAdmin
  const canAddPrescription = isDoctor || isAdmin

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Appointment not found</p>
        <Link to={isPatient ? '/patient/appointments' : isDoctor ? '/doctor/appointments' : '/admin/appointments'}
          className="text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
          Back to Appointments
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to={isPatient ? '/patient/appointments' : isDoctor ? '/doctor/appointments' : '/admin/appointments'}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Appointment Details</h1>
              <p className="text-sm text-gray-500">ID: #{appointment._id?.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {getStatusIcon(status)} {status}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ============================================================ */}
          {/* Main Content */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient & Doctor Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-emerald-600" /> Patient Information
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xl">
                  {appointment.patient?.firstName?.[0] || 'P'}{appointment.patient?.lastName?.[0] || ''}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-lg">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><FaEnvelope size={12} /> {appointment.patient?.email}</span>
                    <span className="flex items-center gap-1"><FaPhone size={12} /> {appointment.patient?.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FaUserMd className="text-emerald-600" /> Doctor
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                    {appointment.doctor?.firstName?.[0] || 'D'}{appointment.doctor?.lastName?.[0] || ''}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{appointment.doctor?.specialization}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Appointment Details */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-emerald-600" /> Appointment Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(appointment.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{appointment.timeSlot}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    {getTypeIcon(appointment.type)} {appointment.type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium text-gray-900">{appointment.duration || 30} mins</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-500 text-sm">Reason</p>
                <p className="text-gray-900">{appointment.reason}</p>
              </div>

              {appointment.symptoms && appointment.symptoms.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-500 text-sm">Symptoms</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {appointment.symptoms.map((symptom, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Prescriptions */}
            {(canAddPrescription || prescriptions.length > 0) && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaPrescription className="text-emerald-600" /> Prescriptions
                </h2>

                {prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.map((presc, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{presc.medication}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            {presc.dosage && <span>Dosage: {presc.dosage}</span>}
                            {presc.instructions && <span>Instructions: {presc.instructions}</span>}
                            {presc.prescribedDate && (
                              <span className="text-gray-400 text-xs">
                                Prescribed: {new Date(presc.prescribedDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        {canAddPrescription && (
                          <button
                            onClick={() => handleRemovePrescription(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No prescriptions yet</p>
                )}

                {canAddPrescription && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Add Prescription</p>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Medication name *"
                        value={prescription.medication}
                        onChange={(e) => setPrescription(prev => ({ ...prev, medication: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={prescription.dosage}
                          onChange={(e) => setPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                        <input
                          type="text"
                          placeholder="Instructions"
                          value={prescription.instructions}
                          onChange={(e) => setPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <button
                        onClick={handleAddPrescription}
                        disabled={updating}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {updating ? <FaSpinner className="animate-spin" /> : 'Add Prescription'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* ============================================================ */}
          {/* Sidebar - Actions */}
          {/* ============================================================ */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Update */}
            {canUpdateStatus && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
                <div className="space-y-2">
                  {['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(s)}
                      disabled={updating || status === s}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50`}
                    >
                      {status === s && <FaCheck className="inline mr-2 text-green-600" />}
                      Set to {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Doctor Notes */}
            {canEdit && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaNotesMedical className="text-emerald-600" /> Doctor Notes
                </h2>
                {isEditing ? (
                  <div>
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      rows="4"
                      placeholder="Add notes about the appointment..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveNotes}
                        disabled={updating}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updating ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setDoctorNotes(appointment.doctorNotes || '')
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {doctorNotes ? (
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{doctorNotes}</p>
                    ) : (
                      <p className="text-gray-400 text-sm">No notes yet</p>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                    >
                      <FaEdit size={12} /> {doctorNotes ? 'Edit Notes' : 'Add Notes'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {isPatient && status === 'pending' && (
                  <Link
                    to={`/patient/appointments/${appointment._id}/cancel`}
                    className="w-full inline-flex justify-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Cancel Appointment
                  </Link>
                )}
                {isPatient && status !== 'cancelled' && status !== 'completed' && (
                  <Link
                    to={`/patient/appointments/${appointment._id}/reschedule`}
                    className="w-full inline-flex justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Reschedule Appointment
                  </Link>
                )}
                {isDoctor && status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate('in-progress')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Consultation
                  </button>
                )}
                {isDoctor && status === 'in-progress' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Complete Appointment
                  </button>
                )}
              </div>
            </motion.div>

            {/* Back Button */}
            <Link
              to={isPatient ? '/patient/appointments' : isDoctor ? '/doctor/appointments' : '/admin/appointments'}
              className="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Appointments
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentDetail