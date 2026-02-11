import { cn } from "@/lib/utils";
import { integralCF } from "@/styles/fonts";

export default function AccountPage() {
  return (
    <div className="max-w-frame mx-auto px-4 xl:px-0 py-12">
      <h1 className={cn(integralCF.className, "text-3xl lg:text-4xl mb-4")}>
        MY ACCOUNT
      </h1>
      <p className="text-black/60">
        placeholder for account profile page
      </p>
    </div>
  );
}
