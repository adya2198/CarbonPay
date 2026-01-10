import { useState } from "react";
import ProfileWallet from "../components/ProfileWallet";
import ConvertTrees from "../components/ConvertTrees";
import ScanPay from "../components/ScanPay";
import OverviewCard from "../components/OverviewCard";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();

  // Demo state (replace with API later)
  const [balanceKg, setBalanceKg] = useState(1600);
  const [trees] = useState(100);

  function handleConvert(treeCount) {
    const minted = Math.round(treeCount * 20 * 0.8);
    setBalanceKg((prev) => prev + minted);
    alert(`${minted} carbon tokens minted`);
  }

  function handlePay(amount) {
    if (amount > balanceKg) {
      alert("Insufficient balance");
      return;
    }
    setBalanceKg((prev) => prev - amount);
    alert(`Paid ${amount} carbon tokens`);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">CarbonPay</h1>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Profile + Wallet */}
          <ProfileWallet user={user} balanceKg={balanceKg} />

          {/* Right: Main Actions */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Overview */}
            <OverviewCard trees={trees} balanceKg={balanceKg} />

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              <ConvertTrees onConvert={handleConvert} />
              <ScanPay onPay={handlePay} />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-8 bg-white rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold">How it works</h2>
          <p className="text-sm text-gray-600 mt-2">
            Trees are registered and verified before tokens are minted.
            Each token represents 1 kg of CO₂ removed from the atmosphere.
            Tokens can be spent at partner merchants or retired to offset emissions.
          </p>
        </section>

        {/* Disclaimer */}
        <footer className="mt-8 text-xs text-gray-400">
          CarbonPay is an experimental prototype and not a certified carbon market.
        </footer>
      </div>
    </main>
  );
}
