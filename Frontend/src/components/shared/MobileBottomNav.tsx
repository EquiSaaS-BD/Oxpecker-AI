"use client";

import { usePathname } from "next/navigation";
import { AwwwardsNav } from "./AwwwardsNav";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide only on chat page when user is typing in chat input
  if (pathname === "/chat") {
    return null;
  }

  return (
    <div className="lg:hidden z-[100] relative">
      <AwwwardsNav />
    </div>
  );
}

export default MobileBottomNav;
