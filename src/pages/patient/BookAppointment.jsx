import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  FiArrowLeft, FiUser, FiCalendar, FiClock, 
  FiMapPin, FiVideo, FiPhone, FiSearch,
  FiCheckCircle, FiStar, FiMail,
  FiPhone as FiPhoneIcon
} from 'react-icons/fi'
import { appointmentsApi } from '../../api/appointments.api'
import { doctorsApi } from '../../api/doctors.api'
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

const BookAppointment = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const doctorIdParam = searchParams.get('doctor')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(doctorIdParam || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    type: 'in-person',
    reason: '',
    symptoms: ''
  })

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors()
  }, [])

  // Fetch available slots when doctor and date change
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedTime('')
    }
  }, [selectedDoctor, selectedDate])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const response = await doctorsApi.getAll({ isAvailable: true })
      
      setDoctors(response.data.doctors || [])
      
      // If doctorId from URL, verify and select
      if (doctorIdParam) {
        const exists = response.data.doctors?.some(d => 
          (d.user?._id || d._id) === doctorIdParam
        )
        if (exists) {
          setSelectedDoctor(doctorIdParam)
        } else {
          setSelectedDoctor('')
        }
      }
    } catch (error) {
     
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true)
    setAvailableSlots([])
    setSelectedTime('')
    
    try {
      
      const response = await appointmentsApi.getAvailability(selectedDoctor, selectedDate)
     
      
      const slots = response.data.slots || []
      setAvailableSlots(slots)
      
      if (slots.length === 0) {
        toast.error('No available slots for this date')
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load available slots'
      toast.error(message)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctor(doctorId)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableSlots([])
    setStep(2)
  }

  const handleDateSelect = (date) => {
   
    setSelectedDate(date)
    setSelectedTime('')
    setAvailableSlots([])
  }

  const handleTimeSelect = (time) => {
    
    setSelectedTime(time)
  }

  const handleNext = () => {
  
    if (step === 2) {
      if (!selectedDate) {
        toast.error('Please select a date')
        return
      }
      if (!selectedTime) {
        toast.error('Please select a time slot')
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the appointment')
      return
    }

    // Prepare symptoms as array
    let symptomsArray = [];
    if (formData.symptoms) {
      symptomsArray = formData.symptoms.split(',').map(s => s.trim()).filter(Boolean);
    }

    const data = {
      doctorId: selectedDoctor,
      date: selectedDate,
      timeSlot: selectedTime,
      type: formData.type,
      reason: formData.reason,
      symptoms: symptomsArray
    }



    // Validate before sending
    if (!data.timeSlot) {
      toast.error('Please select a time slot')
      return
    }

    setSubmitting(true)
    try {
      const response = await appointmentsApi.create(data)
      toast.success('Appointment booked successfully!')
      navigate(`/patient/appointments/${response.data.data._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredDoctors = doctors.filter(doc => {
    const name = `${doc.user?.firstName || ''} ${doc.user?.lastName || ''}`.toLowerCase()
    const spec = (doc.specialization || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    return name.includes(term) || spec.includes(term)
  })

  const getTypeIcon = (type) => {
    if (type === 'video') return <FiVideo className="text-blue-500" />
    if (type === 'phone') return <FiPhone className="text-green-500" />
    return <FiMapPin className="text-purple-500" />
  }

  const getTypeLabel = (type) => {
    if (type === 'video') return 'Video Call'
    if (type === 'phone') return 'Phone Call'
    return 'In-Person'
  }

  // Get selected doctor details
  const selectedDoctorDetails = doctors.find(d => (d.user?._id || d._id) === selectedDoctor)

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/patient/appointments" className="text-gray-600 hover:text-gray-800 transition-colors">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Book Appointment</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${s <= step ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s < step ? 'bg-green-600 text-white' :
                  s === step ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {s < step ? <FiCheckCircle /> : s}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {s === 1 ? 'Doctor' : s === 2 ? 'Date & Time' : 'Confirm'}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Doctor</h2>
            
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FiStar className="animate-spin text-2xl text-green-600" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">👨‍⚕️</div>
                <p className="text-gray-500">No doctors available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {filteredDoctors.map((doctor, index) => {
                  const doctorId = doctor.user?._id || doctor._id
                  const isSelected = selectedDoctor === doctorId
                  return (
                    <motion.div
                      key={doctorId}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      onClick={() => handleDoctorSelect(doctorId)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-lg">
                          {doctor.user?.firstName?.[0] || 'D'}{doctor.user?.lastName?.[0] || ''}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiStar className="text-yellow-400" /> {doctor.rating?.toFixed(1) || '0.0'}
                            </span>
                            <span>•</span>
                            <span>{doctor.yearsOfExperience || 0} yrs exp.</span>
                          </div>
                        </div>
                        {isSelected && (
                          <FiCheckCircle className="text-green-600" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="space-y-4"
          >
            {/* Doctor Summary */}
            {selectedDoctorDetails && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                  {selectedDoctorDetails.user?.firstName?.[0] || 'D'}{selectedDoctorDetails.user?.lastName?.[0] || ''}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Dr. {selectedDoctorDetails.user?.firstName} {selectedDoctorDetails.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedDoctorDetails.specialization}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="ml-auto text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Change
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Date & Time</h2>

              {/* Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  min={today}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
                {selectedDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>

              {/* Appointment Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Appointment Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['in-person', 'video', 'phone'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`flex items-center justify-center gap-2 px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                        formData.type === type
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {getTypeIcon(type)} {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Available Time Slots *
                  </label>
                  
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <FiStar className="animate-spin text-2xl text-green-600" />
                      <span className="ml-2 text-gray-500">Loading slots...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">No available slots for this date</p>
                      <button
                        onClick={() => setSelectedDate('')}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Select another date
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeSelect(slot)}
                            className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                              selectedTime === slot
                                ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                                : 'border-gray-200 hover:border-green-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      {selectedTime && (
                        <p className="mt-2 text-sm text-green-600 font-medium">
                          ✓ Selected: {selectedTime}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedDate || !selectedTime || loadingSlots}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm Details */}
        {step === 3 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
          >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Confirm Appointment</h2>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Doctor</span>
                <span className="font-medium text-gray-900">
                  Dr. {selectedDoctorDetails?.user?.firstName} {selectedDoctorDetails?.user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900 flex items-center gap-1">
                  {getTypeIcon(formData.type)} {getTypeLabel(formData.type)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason for Appointment *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows="3"
                  placeholder="Briefly describe your reason for the appointment..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Symptoms (optional)
                </label>
                <input
                  type="text"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="e.g., headache, fever, cough (comma separated)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              </div>

              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? <FiStar className="animate-spin" /> : <FiCheckCircle />}
                  Confirm Booking
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default BookAppointment