"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { currencySymbol } from "@/lib/utils";
import { showToast, Toaster } from "@/components/ui/Toast";

const CODES = [
  "USD","EUR","GBP","JPY","CNY","INR","NGN","GHS","ZAR","KES","UGX","TZS","CAD","AUD","NZD","CHF",
  "SEK","NOK","DKK","PLN","CZK","HUF","RUB","TRY","AED","SAR","QAR","BHD","OMR","PKR","LKR","THB",
  "SGD","HKD","MYR","IDR","PHP","BRL","MXN","ARS","CLP","COP"
];

function labelFor(code: string) {
  const names: Record<string, string> = {
    USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen", CNY: "Chinese Yuan", INR: "Indian Rupee",
    NGN: "Nigerian Naira", GHS: "Ghanaian Cedi", ZAR: "South African Rand", KES: "Kenyan Shilling", UGX: "Ugandan Shilling",
    TZS: "Tanzanian Shilling", CAD: "Canadian Dollar", AUD: "Australian Dollar", NZD: "New Zealand Dollar", CHF: "Swiss Franc",
    SEK: "Swedish Krona", NOK: "Norwegian Krone", DKK: "Danish Krone", PLN: "Polish Złoty", CZK: "Czech Koruna", HUF: "Hungarian Forint",
    RUB: "Russian Ruble", TRY: "Turkish Lira", AED: "UAE Dirham", SAR: "Saudi Riyal", QAR: "Qatari Riyal", BHD: "Bahraini Dinar",
    OMR: "Omani Rial", PKR: "Pakistani Rupee", LKR: "Sri Lankan Rupee", THB: "Thai Baht", SGD: "Singapore Dollar",
    HKD: "Hong Kong Dollar", MYR: "Malaysian Ringgit", IDR: "Indonesian Rupiah", PHP: "Philippine Peso", BRL: "Brazilian Real",
    MXN: "Mexican Peso", ARS: "Argentine Peso", CLP: "Chilean Peso", COP: "Colombian Peso",
  };
  const sym = currencySymbol(code);
  const name = names[code] || code;
  return `${name} (${code}) — ${sym}`;
}

export function CurrencySettings({ defaultCode }: { defaultCode: string }) {
  const [code, setCode] = React.useState<string>(defaultCode || "USD");
  const options = CODES.map((c) => ({ label: labelFor(c), value: c }));
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/settings/currency", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      if (res.ok) showToast("Currency updated", "success");
      else {
        const data = await res.json().catch(() => ({}));
        showToast(String(data.error || "Failed to update"), "error");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-divider p-0">
      <Toaster />
      <div className="p-6 md:p-8 border-b border-divider bg-background/50">
        <h2 className="text-xl font-bold text-text-primary">Settings</h2>
        <p className="text-sm text-text-secondary mt-1">Control global preferences for your pages.</p>
      </div>
      <div className="p-6 md:p-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Currency" value={code} onChange={(e) => setCode(e.target.value)} options={options} />
        </div>
        <div className="flex justify-end">
          <Button variant="primary" onClick={save} disabled={saving} className="px-8 py-3 rounded-xl shadow-sm cursor-pointer">{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </Card>
  );
}
