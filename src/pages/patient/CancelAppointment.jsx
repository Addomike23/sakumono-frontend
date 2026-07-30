import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiXCircle } from 'react-icons/fi'
import { appointmentsApi } from '../../api/appointments.api'
import toast from 'react-hot-toast'

const CancelAppointment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    setLoading(true)
    try {
      await appointmentsApi.cancel(id, reason)
      toast.success('Appointment cancelled successfully')
      navigate('/patient/appointments')
    } catch (error) {
      toast.error('Failed to cancel appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/patient/appointments/${id}`} className="text-gray-600 hover:text-gray-800">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Cancel Appointment</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-800">Are you sure?</h2>
            <p className="text-gray-500 text-sm">This action cannot be undone.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Cancellation *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                placeholder="Please explain why you need to cancel..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <FiSpinner className="animate-spin" /> : <FiXCircle />}
              Cancel Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CancelAppointment