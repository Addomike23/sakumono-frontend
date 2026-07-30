import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiCalendar, FiClock,  FiCheckCircle } from 'react-icons/fi'
import { appointmentsApi } from '../../api/appointments.api'
import toast from 'react-hot-toast'

const RescheduleAppointment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => {
    fetchAppointment()
  }, [id])

  useEffect(() => {
    if (appointment && selectedDate) {
      fetchAvailableSlots()
    }
  }, [appointment, selectedDate])

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

  const fetchAvailableSlots = async () => {
    try {
      const response = await appointmentsApi.getAvailability(
        appointment?.doctor?._id || appointment?.doctor,
        selectedDate
      )
      setAvailableSlots(response.data.availableSlots || [])
      setSelectedTime('')
    } catch (error) {
      toast.error('Failed to load available slots')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) {
      toast.error('Please select a date and time')
      return
    }

    setSubmitting(true)
    try {
      await appointmentsApi.reschedule(id, { date: selectedDate, timeSlot: selectedTime })
      toast.success('Appointment rescheduled successfully')
      navigate('/patient/appointments')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/patient/appointments/${id}`} className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Reschedule Appointment</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {appointment && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p className="text-gray-500">Current Appointment</p>
              <p className="font-medium text-gray-900">
                {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
              </p>
              <p className="text-gray-600">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                required
              />
            </div>

            {selectedDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Time Slots</label>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No available slots for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                          selectedTime === slot
                            ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedTime}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <FiSpinner className="animate-spin" /> : <FiCheckCircle />}
              Confirm Reschedule
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RescheduleAppointment