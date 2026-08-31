import { MedicineInventory } from "@/components/medicines/MedicineInventory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medicine Inventory - Oxpecker AI",
  description: "Manage clinic medicine inventory.",
};

export default function MedicinesPage() {
  return <MedicineInventory />;
}
