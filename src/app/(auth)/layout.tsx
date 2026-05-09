import BackButton from "@/components/ui/BackButton";
import { Toaster } from "@/components/ui/sonner";
import JesusLoadingOverlay from "@/components/auth/JesusLoadingOverlay";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid min-h-screen items-center bg-cover bg-no-repeat md:bg-[#ac1d1d]">
      <JesusLoadingOverlay />
      <BackButton />
      {children}
      <Toaster position="top-right"/>
    </section>
  )
}
