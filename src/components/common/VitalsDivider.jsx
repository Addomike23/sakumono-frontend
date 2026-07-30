import { motion } from "framer-motion";

/**
 * The page's signature element: an ECG-style line that draws itself
 * as it scrolls into view. Used to separate major sections instead of
 * a plain hairline, echoing the hospital's monitoring equipment.
 */
const VitalsDivider = ({ className = "" }) => {
  return (
    <div className={`w-full flex justify-center py-2 ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 600 60"
        className="w-full max-w-3xl h-10 md:h-14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M0 30 H180 L205 8 L228 52 L250 20 L266 30 H340 L360 4 L382 56 L402 30 H600"
          stroke="#16716A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

export default VitalsDivider;
