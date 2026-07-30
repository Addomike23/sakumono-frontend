import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { ChatbotProvider } from "./context/ChatbotContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <ChatbotProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#122421",
                    color: "#FBFAF6",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.9rem",
                    borderRadius: "12px",
                    padding: "16px",
                  },
                  success: {
                    icon: "✅",
                    style: {
                      background: "#10B981",
                      color: "#fff",
                    },
                  },
                  error: {
                    icon: "❌",
                    style: {
                      background: "#EF4444",
                      color: "#fff",
                    },
                  },
                }}
              />
            </ChatbotProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);