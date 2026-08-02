"use client";

import React, { useRef, useState, ChangeEvent, DragEvent } from "react";
import { CldUploadWidget } from "next-cloudinary";
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  Camera,
  FolderOpen,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface CloudinaryUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function CloudinaryUpload({
  value,
  onChange,
  label = "Product Image",
}: CloudinaryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"local" | "cloudinary" | "url">(
    "local"
  );

  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "gearup_preset";

  // Compress and read image file from local device or camera capture
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
            onChange(compressedDataUrl);
          } else {
            onChange(e.target?.result as string);
          }
        } catch {
          onChange(e.target?.result as string);
        } finally {
          setIsProcessing(false);
        }
      };

      img.onerror = () => {
        alert("Failed to process the selected image.");
        setIsProcessing(false);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      alert("Failed to read image file.");
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
        {!value && (
          <div className="flex gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("local")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                activeTab === "local"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              Device / Camera
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cloudinary")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                activeTab === "cloudinary"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              Cloudinary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                activeTab === "url"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              }`}
            >
              URL Link
            </button>
          </div>
        )}
      </div>

      {/* Hidden File Inputs for Device & Camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview Box */
        <div className="relative h-44 sm:h-48 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 group shadow-inner">
          <Image
            src={value}
            alt="Product Image Preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute top-2 left-2 rounded-lg bg-emerald-600/90 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur-md flex items-center gap-1 shadow">
            <CheckCircle2 className="h-3 w-3" /> Image Selected
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-rose-600/90 p-1.5 text-white shadow-lg hover:bg-rose-500 transition-all opacity-90 hover:opacity-100 z-10"
            title="Remove Image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : activeTab === "local" ? (
        /* Direct Local Machine / Camera Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
            isDragging
              ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/40 scale-[0.99]"
              : "border-zinc-300 bg-zinc-50/50 hover:border-emerald-500/70 hover:bg-emerald-50/10 dark:border-zinc-800 dark:bg-zinc-950"
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center py-4 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Optimizing & loading image...
              </span>
            </div>
          ) : (
            <>
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Upload from Local Storage or Camera
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                Drag & drop image here or choose an option below
              </p>

              {/* Responsive Action Buttons for Local Device & Camera */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all active:scale-95"
                >
                  <FolderOpen className="h-4 w-4" /> Browse Device
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95"
                >
                  <Camera className="h-4 w-4 text-emerald-500" /> Take Photo
                </button>
              </div>
            </>
          )}
        </div>
      ) : activeTab === "cloudinary" ? (
        /* Cloudinary Widget Fallback */
        <CldUploadWidget
          uploadPreset={uploadPreset}
          onSuccess={(result: any) => {
            if (result?.info?.secure_url) {
              onChange(result.info.secure_url);
            }
          }}
          options={{
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
            sources: ["local", "url", "camera"],
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open?.()}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/10 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-2">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Launch Cloudinary Upload Widget
              </span>
              <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Preset: {uploadPreset}
              </span>
            </button>
          )}
        </CldUploadWidget>
      ) : null}

      {/* Direct URL Input */}
      <div className="relative mt-2">
        <input
          type="url"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste direct image URL (https://...)"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 pl-9 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-medium"
        />
        <ImageIcon className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
      </div>
    </div>
  );
}

