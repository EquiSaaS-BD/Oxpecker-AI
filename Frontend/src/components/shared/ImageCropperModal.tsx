"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
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
    const nextCrop = centerCrop(
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
    setCrop(nextCrop);
    setCompletedCrop({
      unit: "px",
      x: (nextCrop.x / 100) * width,
      y: (nextCrop.y / 100) * height,
      width: (nextCrop.width / 100) * width,
      height: (nextCrop.height / 100) * height,
    });
  }

  const handleSave = () => {
    if (!imgRef.current) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / (image.width || 1);
    const scaleY = image.naturalHeight / (image.height || 1);

    const activeCrop: PixelCrop =
      completedCrop && completedCrop.width > 0 && completedCrop.height > 0
        ? completedCrop
        : {
            unit: "px",
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          };

    const srcWidth = Math.max(1, activeCrop.width * scaleX);
    const srcHeight = Math.max(1, activeCrop.height * scaleY);
    const maxDim = 360;
    const ratio = Math.min(1, maxDim / Math.max(srcWidth, srcHeight));

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(srcWidth * ratio));
    canvas.height = Math.max(1, Math.round(srcHeight * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      activeCrop.x * scaleX,
      activeCrop.y * scaleY,
      srcWidth,
      srcHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const base64data = canvas.toDataURL("image/jpeg", 0.84);
    onCropComplete(base64data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Crop Image</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
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
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 hover:shadow-md transition-all cursor-pointer"
          >
            Save & Compress
          </button>
        </div>
      </div>
    </div>
  );
}
