"use client";

import React, { useRef, useState } from "react";
import { ImageCropperModal } from "./ImageCropperModal";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadCropperProps {
  onUpload: (base64: string) => void;
  aspectRatio?: number;
  circular?: boolean;
  buttonText?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function ImageUploadCropper({
  onUpload,
  aspectRatio = 1,
  circular = true,
  buttonText = "Change Photo",
  className = "px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[13px] font-bold rounded-xl transition-colors shadow-none flex items-center gap-2",
  icon = <Camera size={14} />,
}: ImageUploadCropperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.includes("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setTempImageSrc(reader.result?.toString() || "");
        setModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (base64: string) => {
    onUpload(base64);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={className}
      >
        {icon}
        {buttonText}
      </button>

      <ImageCropperModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
        circular={circular}
      />
    </>
  );
}
