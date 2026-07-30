import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHeart, FiActivity, FiUsers, FiThermometer,
  FiClock, FiDroplet, FiArrowRight,
  FiShield, FiAward, FiBriefcase, FiCalendar,
  FiMapPin, FiMail, FiPhone
} from 'react-icons/fi'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
}

// Service categories with detailed information
const SERVICES = [
  {
    id: 1,
    title: "Cardiology",
    description: "Comprehensive heart care with advanced diagnostic tools and treatment options for cardiovascular conditions.",
    icon: FiHeart,
    image: "https://themewagon.github.io/Clinic/assets/img/health/cardiology-1.webp",
    tags: ["ECG Testing", "Heart Surgery"],
    color: "red"
  },
  {
    id: 2,
    title: "Neurology",
    description: "Expert neurological care for brain and nervous system disorders with state-of-the-art imaging technology.",
    icon: FiActivity,
    image: "https://themewagon.github.io/Clinic/assets/img/health/neurology-4.webp",
    tags: ["MRI Scans", "Stroke Care"],
    color: "blue"
  },
  {
    id: 3,
    title: "Orthopedics",
    description: "Specialized bone and joint treatment including sports medicine and reconstructive surgery procedures.",
    icon: FiUsers,
    image: "https://themewagon.github.io/Clinic/assets/img/health/facilities-6.webp",
    tags: ["Joint Replacement", "Sports Medicine"],
    color: "purple"
  },
  {
    id: 4,
    title: "Pediatrics",
    description: "Dedicated healthcare for children from infancy through adolescence with specialized treatment protocols.",
    icon: FiThermometer,
    image: "https://themewagon.github.io/Clinic/assets/img/health/maternal-2.webp",
    tags: ["Well-Child Visits", "Immunizations"],
    color: "green"
  },
  {
    id: 5,
    title: "Emergency Care",
    description: "24/7 emergency medical services with rapid response teams and critical care capabilities.",
    icon: FiClock,
    image: "https://themewagon.github.io/Clinic/assets/img/health/emergency-1.webp",
    tags: ["Trauma Center", "Critical Care"],
    color: "orange"
  },
  {
    id: 6,
    title: "Laboratory Testing",
    description: "Advanced diagnostic laboratory services with comprehensive testing panels and rapid result delivery.",
    icon: FiDroplet,
    image: "https://themewagon.github.io/Clinic/assets/img/health/consultation-4.webp",
    tags: ["Blood Tests", "Pathology"],
    color: "teal"
  }
]

const WHY_CHOOSE_US = [
  {
    icon: FiShield,
    title: "Trusted Care",
    description: "Over 25 years of excellence in healthcare delivery with thousands of satisfied patients."
  },
  {
    icon: FiAward,
    title: "Expert Team",
    description: "Our multidisciplinary team of specialists brings decades of combined experience to every case."
  },
  {
    icon: FiBriefcase,
    title: "Advanced Technology",
    description: "We invest in the latest medical technology for accurate diagnoses and effective treatments."
  },
  {
    icon: FiCalendar,
    title: "Convenient Appointments",
    description: "Easy online booking, flexible scheduling, and minimal wait times for all patients."
  }
]

const Services = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div aria-hidden="true" className="absolute -top-20 -right-24 w-96 h-96 rounded-full bg-green-100 blur-3xl opacity-50" />
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-green-50 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Our Services
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-5xl font-medium text-gray-900">
              Comprehensive <span className="text-green-600">Healthcare</span> Services
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Odio et unde deleniti. Deserunt numquam exercitationem. Officiis quo odio sint voluptas consequatur ut a odio voluptatem. Sit dolorum debitis veritatis natus dolores.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="text-center">
                <p className="text-3xl font-semibold text-green-700">25+</p>
                <p className="text-sm text-gray-500">Years of Excellence</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-semibold text-green-700">12K+</p>
                <p className="text-sm text-gray-500">Patients Served</p>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl font-semibold text-green-700">46+</p>
                <p className="text-sm text-gray-500">Medical Experts</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SERVICES GRID */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const Icon = service.icon
            const colorClasses = {
              red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
              blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
              purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
              green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
              orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
              teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100'
            }
            const borderColors = {
              red: 'hover:border-red-300',
              blue: 'hover:border-blue-300',
              purple: 'hover:border-purple-300',
              green: 'hover:border-green-300',
              orange: 'hover:border-orange-300',
              teal: 'hover:border-teal-300'
            }

            return (
              <motion.div
                key={service.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                custom={index}
                className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${borderColors[service.color]}`}
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${colorClasses[service.color]}`}>
                      <Icon className="text-lg" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY CHOOSE US */}
      {/* ============================================================ */}
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-medium text-gray-900">
              Excellence in Medical Care
            </h2>
            <p className="mt-3 text-gray-600">
              We combine advanced medical technology with compassionate care to provide the best healthcare experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_US.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={index}
                  className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-2xl mx-auto mb-4">
                    <Icon />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          className="rounded-2xl bg-gradient-to-r from-green-700 to-green-800 text-white px-8 py-16 md:px-16 md:py-20 text-center relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-green-500/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-green-500/30 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-medium max-w-2xl mx-auto">
              Need Medical Assistance?
            </h2>
            <p className="mt-4 text-green-50 max-w-lg mx-auto">
              Our team is ready to provide you with the care you deserve. Schedule an appointment today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/patient/appointments/new"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-green-700 font-medium hover:bg-green-50 transition-colors"
              >
                Book an Appointment <FiArrowRight />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT INFO */}
      {/* ============================================================ */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
                <FiMapPin className="text-xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Visit Us</h4>
              <p className="text-gray-500 text-sm mt-1">Sakumono-Tema, Ghana</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
                <FiPhone className="text-xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Call Us</h4>
              <p className="text-gray-500 text-sm mt-1">+233 55 500 0000</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
                <FiMail className="text-xl" />
              </div>
              <h4 className="font-semibold text-gray-900">Email Us</h4>
              <p className="text-gray-500 text-sm mt-1">info@sakumonohospital.com</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services