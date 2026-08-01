"use client";

import { CldUploadWidget } from "next-cloudinary";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
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
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "gearup_preset";

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
        {label}
      </label>

      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 group">
          <Image
            src={value}
            alt="Product Image Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-rose-600/90 p-1.5 text-white shadow hover:bg-rose-500 transition-all opacity-90 hover:opacity-100"
            title="Remove Image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
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
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-6 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500/50"
            >
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Click to upload via Cloudinary
              </span>
              <span className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                PNG, JPG, WEBP up to 10MB
              </span>
            </button>
          )}
        </CldUploadWidget>
      )}

      {/* Direct URL Fallback or Manual Edit */}
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
