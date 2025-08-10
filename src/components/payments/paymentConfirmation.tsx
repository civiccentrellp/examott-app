"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCreatePaymentRequest } from "@/hooks/courses/useCourseAccess";
import { toast } from "sonner";
import { uploadFileToFirebase } from "@/utils/firebaseUpload";

export default function PaymentConfirmationPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const router = useRouter();
  const createPayment = useCreatePaymentRequest();

  const [amountPaid, setAmountPaid] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const asMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

  const validateFile = (f: File) => {
    if (!f.type.startsWith("image/")) return "Please upload an image file (PNG/JPG).";
    if (f.size > 8 * 1024 * 1024) return "File too large (max 8 MB).";
    return null;
  };

  const handleFilePick = useCallback((f?: File) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = e.clipboardData?.files?.[0];
      if (item) handleFilePick(item);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFilePick]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFilePick(e.dataTransfer.files?.[0]);
  };

  const canSubmit =
    !!file && Number(amountPaid) > 0 && utrNumber.trim().length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload screenshot");

    const amt = Number(amountPaid);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    if (!utrNumber.trim()) return toast.error("Enter the UTR / Reference Number");

    setLoading(true);
    try {
      const screenshotUrl = await uploadFileToFirebase(file, "payment-screenshots");
      await createPayment.mutateAsync({
        courseId,
        screenshotUrl,
        amountPaid: amt,
        utrNumber: utrNumber.trim(),
      });
      toast.success("Payment request submitted!");
      router.push("/courses");
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* Left: Screenshot */}
        <section className="bg-gray-50 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-800">Upload Screenshot</h2>
          <p className="text-sm text-gray-500 mt-1">
            PNG or JPG up to 8 MB. You can also{" "}
            <span className="font-medium text-gray-700">paste</span> a screenshot.
          </p>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={[
              "mt-4 rounded-lg border-2 border-dashed p-4 md:p-6 text-center cursor-pointer transition",
              dragOver
                ? "border-violet-400 bg-violet-50/40"
                : "border-gray-300 hover:border-violet-400",
            ].join(" ")}
          >
            {!preview ? (
              <div className="text-gray-500 text-sm">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    fill="none"
                  >
                    <path d="M4 7h3l2-3h6l2 3h3v12H4V7Z" strokeWidth="1.5" />
                    <circle cx="12" cy="13" r="4" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Click to upload</span>{" "}
                or drag & drop
              </div>
            ) : (
              <div className="space-y-3">
                <img
                  src={preview}
                  alt="Screenshot preview"
                  className="mx-auto max-h-72 w-full object-contain rounded-md bg-white"
                />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="truncate">
                    {file?.name} • {asMB(file?.size || 0)} MB
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilePick(e.target.files?.[0])}
            />
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <ul className="mt-4 text-xs text-gray-500 list-disc list-inside space-y-1">
            <li>Ensure the UTR / reference number is visible.</li>
            <li>Crop sensitive info if needed.</li>
          </ul>
        </section>

        {/* Right: Details */}
        <section className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-800">Payment Details</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter the exact amount shown on your receipt.
              </p>
            </div>

            {/* UTR */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UTR / Transaction Reference Number
              </label>
              <input
                type="text"
                placeholder="e.g., 1234567890ABC"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                This helps us verify your payment faster.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 rounded-lg py-2 text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
