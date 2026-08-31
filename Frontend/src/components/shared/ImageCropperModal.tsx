"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import imageCompression from "browser-image-compression";
import { X } from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (base64Image: string) => void;
  aspectRatio?: number;
  circular?: boolean;
}

export function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  circular = true,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  if (!isOpen) return null;

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // Convert canvas to Blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Compress
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(blob as File, options);
        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onCropComplete(base64data);
          onClose();
        };
      } catch (error) {
        console.error("Error compressing image", error);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Crop Image</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center max-h-[60vh] overflow-y-auto">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            circularCrop={circular}
          >
            <img
              ref={imgRef}
              alt="Crop"
              src={imageSrc}
              onLoad={onImageLoad}
              className="max-h-[400px] object-contain"
            />
          </ReactCrop>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!completedCrop}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save & Compress
          </button>
        </div>
      </div>
    </div>
  );
}
