import { BottomNav } from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen tab-safe">
      {children}
      <BottomNav />
    </div>
  );
}
