"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileNavToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // avoid early return before hooks to maintain stable hook order

  const handleToggle = () => {
    const layout = document.querySelector(".dashboard-layout");
    const sidebar = document.querySelector(".sidebar");

    if (layout && sidebar) {
      layout.classList.toggle("sidebar-open");
      sidebar.classList.toggle("open");
      setIsOpen(!isOpen);
    }
  };

  const handleCloseMenu = () => {
    const layout = document.querySelector(".dashboard-layout");
    const sidebar = document.querySelector(".sidebar");

    if (layout && sidebar) {
      layout.classList.remove("sidebar-open");
      sidebar.classList.remove("open");
      setIsOpen(false);
    }
  };

  // Close menu when navigating
  useEffect(() => {
    handleCloseMenu();
  }, []);

  if (!mounted) return null;

  return (
    <button
      className="mobile-nav-toggle"
      onClick={handleToggle}
      title={isOpen ? "Close menu" : "Open menu"}
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      aria-expanded={isOpen}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
