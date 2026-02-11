import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-frame mx-auto px-4 xl:px-0 py-12">
      <h1 className={cn(integralCF.className, "text-3xl lg:text-4xl mb-4")}>
        ADMIN DASHBOARD
      </h1>
      <p className="text-black/60">
        This is a placeholder for admin dashboard
      </p>
    </div>
  );
}
