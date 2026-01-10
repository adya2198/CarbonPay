export default function ProfileWallet({ user, balanceKg }) {
  return (
    <aside className="bg-white rounded-2xl shadow-sm p-4 w-full md:w-80">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center font-semibold">
          {user.name?.charAt(0) || "U"}
        </div>
        <div>
          <div className="text-sm font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      </div>

      <div className="mt-4 border rounded-lg p-3 bg-gray-50">
        <div className="text-xs text-gray-500">Wallet balance</div>
        <div className="text-2xl font-semibold">{balanceKg} kg</div>
        <div className="text-xs text-gray-500">
          {(balanceKg / 1000).toFixed(3)} tCO₂
        </div>
      </div>
    </aside>
  );
}
