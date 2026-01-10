export default function OverviewCard({ trees, balanceKg }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Overview</h2>
      <p className="text-sm text-gray-600 mt-2">
        Summary of your tree assets and carbon balance.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-3 border rounded-lg">
          <div className="text-xs text-gray-500">Trees</div>
          <div className="text-lg font-semibold">{trees}</div>
        </div>
        <div className="p-3 border rounded-lg">
          <div className="text-xs text-gray-500">Tokens</div>
          <div className="text-lg font-semibold">{balanceKg} kg</div>
        </div>
        <div className="p-3 border rounded-lg">
          <div className="text-xs text-gray-500">Value (demo)</div>
          <div className="text-lg font-semibold">₹{balanceKg * 0.5}</div>
        </div>
      </div>
    </div>
  );
}
