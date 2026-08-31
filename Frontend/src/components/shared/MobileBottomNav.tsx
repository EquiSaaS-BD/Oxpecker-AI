"use client";

import { usePathname } from "next/navigation";
import { AwwwardsNav } from "./AwwwardsNav";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on chat, messages, and prescription editor pages where bottom fixed input/actions exist
  if (pathname === "/chat" || pathname.includes("/messages") || pathname.includes("/prescription/new")) {
    return null;
  }

  return (
    <div className="md:hidden">
      <AwwwardsNav />
    </div>
  );
}

export default MobileBottomNav;
