import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import PublicLayout from "../components/common/PublicLayout";
import DashboardLayout from "../components/common/DashboardLayout";

// ============================================================
// PUBLIC PAGES
// ============================================================
import Home from "../pages/public/Home";
import Services from "../pages/public/Services";
import About from "../pages/public/About";
import Doctors from "../pages/public/Doctors";
import DoctorProfile from "../pages/public/DoctorProfile";
import Blog from "../pages/public/Blog";
import BlogPost from "../pages/public/BlogPost";
import Shop from "../pages/public/Shop";
import ProductDetail from "../pages/public/ProductDetail";
import Contact from "../pages/public/Contact";
import Reviews from "../pages/public/Reviews";
import Cart from '../pages/public/Cart'
import ChatPage from '../components/chatbot/ChatPage'

// ============================================================
// AUTH PAGES
// ============================================================
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import NotFound from "../pages/public/NotFound";

// ============================================================
// PATIENT PAGES
// ============================================================
import PatientDashboard from "../pages/patient/Dashboard";
import PatientAppointments from "../pages/patient/Appointments";
import BookAppointment from "../pages/patient/BookAppointment";
import AppointmentDetails from "../pages/patient/AppointmentDetails";
import RescheduleAppointment from "../pages/patient/RescheduleAppointment";
import CancelAppointment from "../pages/patient/CancelAppointment";
import MedicalRecords from "../pages/patient/MedicalRecords";
import PatientOrders from "../pages/patient/Orders";
import PatientProfile from "../pages/patient/Profile";
import PatientReviews from "../pages/patient/Reviews";
import WriteReview from "../pages/patient/WriteReview";
import PatientNotifications from "../pages/patient/Notifications";
import EditPatientProfile from '../pages/patient/EditPatientProfile'
import ReviewDetail from '../pages/patient/ReviewDetail'

// ============================================================
// DOCTOR PAGES
// ============================================================
import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorAppointments from "../pages/doctor/Appointments";
import DoctorAvailability from "../pages/doctor/Availability";
import DoctorProfilePage from "../pages/doctor/Profile";
import EditDoctorProfile from '../pages/doctor/EditDoctorProfile'

import AppointmentDetail from '../pages/patient/AppointmentDetail'

// ============================================================
// ADMIN PAGES
// ============================================================
// Dashboard & Management
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminDoctors from "../pages/admin/Doctors";
import AdminPatients from "../pages/admin/Patients";
import AdminAppointments from "../pages/admin/Appointments";
import AdminBlogs from "../pages/admin/Blogs";
import AdminProducts from "../pages/admin/Products";
import AdminOrders from "../pages/admin/Orders";
import AdminReviews from "../pages/admin/Reviews";
import AdminContacts from "../pages/admin/Contacts";
import AdminSubscribers from "../pages/admin/Subscribers";
import AdminNotifications from "../pages/admin/Notifications";
import AdminOrderDetail from '../pages/admin/AdminOrderDetail';
import EditDoctor from '../pages/admin/EditDoctor';
import EditPatient from '../pages/admin/EditPatient';

// Admin Forms
import AddDoctor from "../pages/admin/AddDoctor";
import AddPatient from "../pages/admin/AddPatient";
import BlogForm from "../pages/admin/BlogForm";
import ProductForm from "../pages/admin/ProductForm";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ============================================================ */}
      {/* PUBLIC SITE (Navbar + Footer) */}
      {/* ============================================================ */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorProfile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/services" element={<Services />} />
        <Route path="/cart" element={<Cart />} />
      </Route>

      <Route path="/chat" element={<ChatPage />} />


      {/* ============================================================ */}
      {/* AUTH PAGES (Standalone, no Navbar/Footer) */}
      {/* ============================================================ */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ============================================================ */}
      {/* PATIENT AREA */}
      {/* ============================================================ */}
      <Route element={<ProtectedRoute roles={["patient"]} />}>
        <Route element={<DashboardLayout portal="patient" />}>
          {/* Dashboard */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />

          {/* Appointments */}
          <Route path="/patient/appointments" element={<PatientAppointments />} />
          <Route path="/patient/appointments/new" element={<BookAppointment />} />
          <Route path="/patient/appointments/:id" element={<AppointmentDetails />} />
          <Route path="/patient/appointments/:id/reschedule" element={<RescheduleAppointment />} />
          <Route path="/patient/appointments/:id/cancel" element={<CancelAppointment />} />

          {/* Medical Records */}
          <Route path="/patient/medical-records" element={<MedicalRecords />} />

          {/* Orders */}
          <Route path="/patient/orders" element={<PatientOrders />} />

          {/* Profile */}
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/profile/edit" element={<EditPatientProfile />} />

          {/* Reviews */}
          <Route path="/patient/reviews" element={<PatientReviews />} />
          <Route path="/patient/reviews/new" element={<WriteReview />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          {/* Notifications */}
          <Route path="/patient/notifications" element={<PatientNotifications />} />
        </Route>
      </Route>

      {/* ============================================================ */}
      {/* DOCTOR AREA */}
      {/* ============================================================ */}
      <Route element={<ProtectedRoute roles={["doctor"]} />}>
        <Route element={<DashboardLayout portal="doctor" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/doctor/availability" element={<DoctorAvailability />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          <Route path="/doctor/profile/edit" element={<EditDoctorProfile />} />
        </Route>
      </Route>

      {/* ============================================================ */}
      {/* ADMIN AREA */}
      {/* ============================================================ */}
      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<DashboardLayout portal="admin" />}>
          {/* Dashboard */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Users Management */}
          <Route path="/admin/users" element={<AdminUsers />} />

          {/* Doctors Management */}
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/doctors/add" element={<AddDoctor />} />
          <Route path="/admin/doctors/:id/edit" element={<EditDoctor />} />

          {/* Patients Management */}
          <Route path="/admin/patients" element={<AdminPatients />} />
          <Route path="/admin/patients/add" element={<AddPatient />} />
          <Route path="/admin/patients/:id/edit" element={<EditPatient />} />

          {/* Appointments Management */}
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/appointments/:id" element={<AppointmentDetail />} />

          {/* Blog Management */}
          <Route path="/admin/blogs" element={<AdminBlogs />} />
          <Route path="/admin/blogs/new" element={<BlogForm />} />
          <Route path="/admin/blogs/:id/edit" element={<BlogForm />} />

          {/* Products Management */}
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />

          {/* Orders Management */}
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />

          {/* Reviews Management */}
          <Route path="/admin/reviews" element={<AdminReviews />} />

          {/* Contacts Management */}
          <Route path="/admin/contacts" element={<AdminContacts />} />

          {/* Subscribers Management */}
          <Route path="/admin/subscribers" element={<AdminSubscribers />} />

          {/* Notifications Management */}
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>
      </Route>

      {/* ============================================================ */}
      {/* 404 NOT FOUND */}
      {/* ============================================================ */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;