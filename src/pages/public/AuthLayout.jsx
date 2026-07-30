import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShield, FiClock, FiUsers } from "react-icons/fi";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const FEATURES = [
  { icon: FiHeart, text: "Same-week visits with doctors who know your history" },
  { icon: FiClock, text: "24/7 emergency line, answered by a real clinician" },
  { icon: FiShield, text: "Your records, results, and prescriptions in one place" },
];

/**
 * Shared shell for auth pages (login, register, forgot/reset password).
 * Fixed to viewport height — no page-level scroll. If form content is
 * taller than the viewport, only the form column scrolls internally.
 */
const AuthLayout = ({ eyebrow, title, subtitle, children, footer }) => {
  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-2 bg-white">
      {/* ---------- LEFT: welcome / brand content ---------- */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-green-700 text-white px-12 py-10">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-green-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-green-600/40 blur-3xl"
        />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold">
            <span className="w-9 h-9 rounded-full bg-white text-green-700 flex items-center justify-center">
              <FiHeart />
            </span>
            Sakumono Community Hospital
          </Link>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-12 max-w-md"
          >
            <h2 className="text-2xl xl:text-3xl font-medium leading-tight">
              Care that knows your name, not just your chart.
            </h2>
            <p className="mt-4 text-sm text-green-50/90 leading-relaxed">
              Book appointments, message your doctor, and keep every result in
              one calm, secure place — built for the Sakumono-Tema community.
            </p>
          </motion.div>

          <div className="mt-10 space-y-3.5 max-w-md">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="text-sm" />
                </span>
                <p className="text-sm text-green-50/90 leading-relaxed pt-1">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3.5 max-w-md">
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <FiUsers />
          </span>
          <div>
            <p className="text-sm font-semibold">12,800+ patients</p>
            <p className="text-xs text-green-50/70">trust us with their care every year</p>
          </div>
        </div>
      </div>

      {/* ---------- RIGHT: form (scrolls internally if it overflows) ---------- */}
      <div className="h-screen overflow-y-auto flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8">
        <div className="w-full max-w-sm mx-auto">
          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-2 text-base font-semibold text-gray-900 mb-6"
          >
            <span className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center">
              <FiHeart />
            </span>
            Sakumono Community Hospital
          </Link>

          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            {eyebrow && (
              <span className="text-green-700 font-semibold text-sm uppercase tracking-wider">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-medium text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-gray-500 text-sm">{subtitle}</p>}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-6"
          >
            {children}
          </motion.div>

          {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;