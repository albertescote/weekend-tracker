"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/app/actions/profile";
import { signOut } from "@/app/actions/auth";
import { X, Camera, Loader2, User, LogOut } from "lucide-react";
import Portal from "./Portal";
import { Profile } from "@/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Props {
  user: SupabaseUser;
  profile: Profile | null;
  onClose: () => void;
}

export default function ProfileModal({ user, profile, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error("Error pujant la imatge:", error);
      alert("Error al pujar la imatge");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("avatar_url", avatarUrl);

    try {
      await updateProfile(formData);
      onClose();
    } catch {
      alert("Error al guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const isDirty =
    fullName !== (profile?.full_name || "") ||
    avatarUrl !== (profile?.avatar_url || "");

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto overflow-x-hidden">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col">
          {/* Fixed Header */}
          <div className="p-6 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800 flex-shrink-0">
            <h3 className="font-black text-xl tracking-tight text-zinc-950 dark:text-white">
              El teu perfil
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 no-scrollbar">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-zinc-300" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                  Clica per canviar la foto
                </p>
              </div>

              <div className="space-y-4">
                {/* Email (Read Only) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">
                    Correu electrònic
                  </label>
                  <input
                    value={user.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 font-medium cursor-not-allowed border-none outline-none"
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-1">
                    Nom d&apos;usuari
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Com et diuen els amics?"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={20} className="animate-spin" />}
                  GUARDAR CANVIS
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("Segur que vols tancar la sessió?")) {
                      await signOut();
                    }
                  }}
                  className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={20} />
                  TANCAR SESSIÓ
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
}
