"use client";

import { motion } from "framer-motion";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
}
