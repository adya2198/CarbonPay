// src/components/TransactionItem.jsx
import React from "react";

export default function TransactionItem({ txn }) {
  const time = txn.timestamp ? new Date(txn.timestamp).toLocaleString() : "";

  let icon = "🔁";
  let sign = "-";
  let colorClass = "minus";

  if (txn.type === "MINT") {
    icon = "🌱";
    sign = "+";
    colorClass = "plus";
  }

  if (txn.type === "RECEIVE") {
    icon = "⬇️";
    sign = "+";
    colorClass = "plus";
  }

  if (txn.type === "SEND") {
    icon = "⬆️";
    sign = "-";
    colorClass = "minus";
  }

  return (
    <div className="txn-row improved">
      <div className="txn-left">
        <div className="txn-icon">{icon}</div>

        <div>
          <div className="txn-type">{txn.type}</div>
          <div className="txn-time">{time}</div>
        </div>
      </div>

      <div className={`txn-amt ${colorClass}`}>
        {sign}
        {txn.amount}
      </div>
    </div>
  );
}