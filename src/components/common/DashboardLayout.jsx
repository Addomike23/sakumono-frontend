import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { HiMenu, HiX, HiOutlineLogout } from "react-icons/hi";
import { 
  FiHome, FiCalendar, FiPlus, FiFileText, 
  FiShoppingBag, FiUser, FiClock, FiUsers,
  FiStar, FiMessageCircle, FiMail, FiBell,
  FiBookOpen, FiPackage, FiShoppingCart, FiCheckSquare,
  FiChevronDown, FiChevronRight, FiClipboard,
  FiUserCheck, FiUserPlus, FiBarChart2, FiSettings
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

// ============================================================
// NAVIGATION CONFIG - ALL ROLES
// ============================================================
const NAV_CONFIG = {
  patient: [
    { to: "/patient/dashboard", label: "Overview", icon: FiHome },
    { to: "/patient/appointments", label: "Appointments", icon: FiCalendar },
    { to: "/patient/appointments/new", label: "Book Appointment", icon: FiPlus },
    { to: "/patient/medical-records", label: "Medical Records", icon: FiFileText },
    { to: "/patient/orders", label: "Orders", icon: FiShoppingBag },
    { to: "/patient/reviews", label: "My Reviews", icon: FiStar },
    { to: "/patient/notifications", label: "Notifications", icon: FiBell },
    { to: "/patient/profile", label: "Profile", icon: FiUser },
  ],
  doctor: [
    { to: "/doctor/dashboard", label: "Overview", icon: FiHome },
    { to: "/doctor/appointments", label: "Appointments", icon: FiCalendar },
    { to: "/doctor/availability", label: "Availability", icon: FiClock },
    { to: "/doctor/profile", label: "Profile", icon: FiUser },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview", icon: FiHome },
    { to: "/admin/users", label: "Users", icon: FiUsers },
    { to: "/admin/doctors", label: "Doctors", icon: FiUserCheck },
    { to: "/admin/patients", label: "Patients", icon: FiUserPlus },
    { to: "/admin/appointments", label: "Appointments", icon: FiCalendar },
    { to: "/admin/blogs", label: "Blog", icon: FiBookOpen },
    { to: "/admin/products", label: "Products", icon: FiPackage },
    { to: "/admin/orders", label: "Orders", icon: FiShoppingCart },
    { to: "/admin/reviews", label: "Reviews", icon: FiStar },
    { to: "/admin/contacts", label: "Messages", icon: FiMessageCircle },
    { to: "/admin/subscribers", label: "Subscribers", icon: FiMail },
    { to: "/admin/notifications", label: "Notifications", icon: FiBell },
  ],
};

const DashboardLayout = ({ portal }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const links = NAV_CONFIG[portal] || [];

  // If no portal is specified or invalid, show nothing
  if (!portal || !links.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Invalid portal configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ============================================================ */}
      {/* SIDEBAR */}
      {/* ============================================================ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#17211D] text-[#FAF8F3] transform transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
          <Link to="/" className="font-display text-xl text-white hover:text-green-300 transition-colors">
            🏥 Sakumono
          </Link>
          <p className="text-xs text-white/40 capitalize mt-1">{portal} portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === `/${portal}/dashboard`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#145C52] text-white shadow-lg shadow-[#145C52]/20"
                        : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-0.5"
                    }`
                  }
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="truncate">{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/5 hover:text-red-400 transition-all duration-200 group"
          >
            <HiOutlineLogout size={18} className="group-hover:text-red-400" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MOBILE OVERLAY */}
      {/* ============================================================ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 lg:justify-end sticky top-0 z-10 shadow-sm">
          <button
            className="lg:hidden text-2xl text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <HiX /> : <HiMenu />}
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 hidden sm:inline">Signed in as</span>
            <span className="font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="w-8 h-8 rounded-full bg-[#145C52] text-white flex items-center justify-center text-sm font-semibold shadow-md">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;