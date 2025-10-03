// src/pages/EditConsumerProfilePage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function EditConsumerProfilePage() {
  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") navigate(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Autofocus username
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { firstInputRef.current?.focus(); }, []);

  const [form, setForm] = useState<{
    username: string;
    password: string;
    confirmPassword: string;
    profilePic: File | null;
  }>({
    username: "",
    password: "",
    confirmPassword: "",
    profilePic: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  function onChange<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // TODO: call API to update profile
    navigate(-1);
  }

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) navigate(-1);
  }

  const roundedInput =
    "w-full rounded-xl border border-gray-300 px-3 py-2 text-[15px] " +
    "focus:border-red-600 focus:ring-2 focus:ring-red-200 outline-none";

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div
        className="w-[min(92vw,720px)] rounded-[2rem] border-4 border-red-600 border-dashed bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* Form */}
        <form onSubmit={onSubmit} className="px-6 py-6 space-y-6">
          {/* New Username */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              New Username
            </label>
            <input
              ref={firstInputRef}
              className={roundedInput}
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
              placeholder="Enter new username"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Password
              </label>
              <span className="text-xs text-red-600">
                At least 8 characters , Case-sensitive
              </span>
            </div>
            <div className="relative">
              <input
                className={`${roundedInput} pr-10`}
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-base font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <span className="text-xs text-red-600">
                Must match the password above
              </span>
            </div>
            <div className="relative">
              <input
                className={`${roundedInput} pr-10`}
                type={showPwd2 ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => onChange("confirmPassword", e.target.value)}
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd2((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                aria-label={showPwd2 ? "Hide password" : "Show password"}
              >
                {showPwd2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Error (form-level) */}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {/* Profile Picture */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {form.profilePic ? (
                <img
                  src={URL.createObjectURL(form.profilePic)}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                  No Pic
                </div>
              )}

              <label className="cursor-pointer">
                <span className="px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm">
                  Choose image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange("profilePic", e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            </div>
            {/* Warning under the row */}
            <p className="mt-2 text-xs text-red-600">
              Max Image Size: 20MB
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}






