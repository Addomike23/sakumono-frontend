import AppRoutes from "./routes/AppRoutes";
import ChatWidget from "./components/chatbot/ChatWidget";
import { useMessages } from "./context/MessageContext";
import { useEffect } from "react";

function App() {
  // ✅ Optional: Load messages when app starts
  const { loadThreads, socketConnected } = useMessages() || {};
  
  useEffect(() => {
    // Load message threads when app loads
    if (loadThreads) {
      loadThreads();
    }
  }, [loadThreads]);

  return (
    <>
      <AppRoutes />
      <ChatWidget />
      
      {/* ✅ Optional: Show socket connection status in dev */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
          {socketConnected ? '🟢 Messages Connected' : '🔴 Messages Disconnected'}
        </div>
      )}
    </>
  );
}

export default App;