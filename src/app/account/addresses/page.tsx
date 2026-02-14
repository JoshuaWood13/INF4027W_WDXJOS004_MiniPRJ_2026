"use client";

import AddressManager from "@/components/address/AddressManager";

export default function AddressesPage() {
  return (
    <div>
      <h3 className="text-xl md:text-2xl font-bold mb-6">Addresses</h3>

      <div className="rounded-[20px] border border-black/10 p-5 md:p-8">
        <AddressManager heading="Saved Addresses" />
      </div>
    </div>
  );
}
