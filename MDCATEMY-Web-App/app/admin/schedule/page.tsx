"use client";

import { useState } from "react";
import { Upload, CheckCircle, ImageOff } from "lucide-react";

export default function SchedulePage() {
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setPreview(e.target?.result as string); };
    reader.readAsDataURL(file);
    setState("uploading");
    setTimeout(() => setState("done"), 1200);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 mb-1">Schedule Image</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload an image of the full test series schedule. It appears in the student app when they tap "View Schedule".
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 text-xs text-blue-800 mb-6">
        <p className="font-bold mb-0.5">Where does this appear?</p>
        <p>Dashboard → Test Series → "View Schedule" button → popup image.</p>
        <p className="mt-1">Recommended: a clean PNG/JPG image of your schedule table. Any size works — it'll scale to fit.</p>
      </div>

      {state === "idle" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById("scheduleInput")?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
        >
          <Upload size={28} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm font-semibold text-gray-700">Drop your schedule image here</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · any size</p>
          <input id="scheduleInput" type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {state === "uploading" && (
        <div className="border border-gray-200 rounded-xl p-10 text-center bg-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">Uploading…</p>
        </div>
      )}

      {state === "done" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-bold">
            <CheckCircle size={16} /> Schedule image updated successfully
          </div>
          {preview ? (
            <img src={preview} alt="Schedule preview" className="w-full rounded-xl border border-gray-200" />
          ) : (
            <div className="w-full aspect-[4/3] border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageOff size={24} />
              <p className="text-xs">No preview available</p>
            </div>
          )}
          <button onClick={() => { setState("idle"); setPreview(null); }}
            className="w-full py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            Replace image
          </button>
        </div>
      )}
    </div>
  );
}
