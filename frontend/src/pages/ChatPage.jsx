import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import Footer from "../components/Footer.jsx";
import SettingsModal from "../components/SettingsModal.jsx";
import { pageTransition } from "../animations/variants.js";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <motion.div {...pageTransition} className="flex h-screen w-full overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} onOpenSettings={() => setSettingsOpen(true)} />
        <div className="min-h-0 flex-1">
          <ChatWindow />
        </div>
        <Footer />
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </motion.div>
  );
}
