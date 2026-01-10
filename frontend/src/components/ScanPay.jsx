import { useState } from "react";

export default function ConvertTrees({ onConvert }) {
  const [trees, setTrees] = useState(10);

  const estimatedTokens = Math.round(trees * 20 * 0.8);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 flex-1">
      <h3 className="text-lg font-semibold">Convert Trees → Currency</h3>
      <p className="text-sm text-gray-600 mt-1">
        Mint carbon tokens from verified tree assets.
      </p>

      <div className="mt-4">
        <label className="text-xs text-gray-500">Verified trees</label>
        <input
          type="number"
          min="0"
          value={trees}
          onChange={(e) => setTrees(Number(e.target.value))}
          className="w-full mt-1 p-2 border rounded-md"
        />
      </div>

      <div className="mt-3 p-3 border rounded-md bg-gray-50">
        <div className="text-xs text-gray-500">Estimated tokens</div>
        <div className="text-lg font-semibold">{estimatedTokens} kg</div>
      </div>

      <button
        onClick={() => onConvert(trees)}
        className="mt-4 w-full py-2 rounded-md bg-green-600 text-white"
      >
        Convert & Mint
      </button>
    </section>
  );
}
