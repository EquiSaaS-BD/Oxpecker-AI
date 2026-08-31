"use client";

import { MegaMenuNavbar } from "./MegaMenuNavbar";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";

export function Navbar() {
  return (
    <>
      {/* Desktop & Laptop Mega Menu Navbar */}
      <MegaMenuNavbar />

      {/* Mobile & Tablet Bottom Navigation Bar (Glassmorphic AwwwardsNav matching dashboard) */}
      <MobileBottomNav />
    </>
  );
}

export default Navbar;