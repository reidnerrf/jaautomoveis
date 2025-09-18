import React, { useState } from "react";
import { analytics } from "../utils/analytics";

interface MiniLeadFormProps {
  context?: "inventory" | "vehicle";
  vehicleId?: string;
  vehicleName?: string;
}

const MiniLeadForm: React.FC<MiniLeadFormProps> = ({ context = "inventory", vehicleId, vehicleName }) => {
  const [name, setName] = useState("");
  const [whats, setWhats] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const normalizePhone = (raw: string) => raw.replace(/[^0-9]/g, "");

  const buildWhatsAppUrl = () => {
    const phone = "5524999037716";
    const text = `Olá, meu nome é ${name || ""}. Gostei ${vehicleName ? `do veículo ${vehicleName}` : "dos veículos"}. Meu WhatsApp é ${whats}.`;
    const url = new URL(`https://wa.me/${phone}`);
    url.searchParams.set("text", text);
    url.searchParams.set("utm_source", "site");
    url.searchParams.set("utm_medium", context);
    url.searchParams.set("utm_campaign", "mini_lead_form");
    if (vehicleId) url.searchParams.set("utm_content", `vehicle_${vehicleId}`);
    return url.toString();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (step === 1) {
      // Advance to step 2 after capturing WhatsApp
      setStep(2);
      try {
        analytics.trackBusinessEvent("lead_stepper_progress", {
          context,
          vehicleId,
          step: 2,
        });
      } catch {}
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        whatsapp: normalizePhone(whats),
        source: `mini_form_${context}`,
      };
      if (vehicleId) payload.vehicleId = vehicleId;
      if (vehicleName) payload.vehicleName = vehicleName;

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSent(true);
      try {
        const statusEl = document.getElementById("mini-lead-status");
        if (statusEl) statusEl.textContent = "Enviado com sucesso!";
      } catch {}
      try {
        analytics.trackBusinessEvent("contact_form", payload);
      } catch {}
    } catch (_err) {
      // Fallback to WhatsApp if API fails
      window.open(buildWhatsAppUrl(), "_blank", "noopener,noreferrer");
      try {
        analytics.trackBusinessEvent("whatsapp_click", {
          fallback: true,
          context,
          vehicleId,
          vehicleName,
        });
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
      {step === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="lead-whats" className="sr-only">WhatsApp</label>
            <input
              id="lead-whats"
              name="whatsapp"
              inputMode="tel"
              placeholder="Seu WhatsApp (DDD)"
              autoComplete="tel"
              value={whats}
              onChange={(e) => setWhats(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
              aria-label="WhatsApp"
              required
            />
          </div>
          <div className="flex">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
              aria-label="Avançar"
            >
              Continuar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="lead-name" className="sr-only">Nome</label>
            <input
              id="lead-name"
              name="name"
              placeholder="Seu nome"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
              aria-label="Nome"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-32 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-red-600 bg-white border-2 border-red-200 hover:bg-red-50"
              aria-label="Voltar"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
              aria-label="Enviar contato"
            >
              {loading ? "Enviando..." : sent ? "Enviado!" : "Quero uma proposta"}
            </button>
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Ao enviar, concordo em ser contatado via WhatsApp.</p>
      <div id="mini-lead-status" role="status" aria-live="polite" className="text-xs text-gray-600 dark:text-gray-300 mt-1"></div>
    </form>
  );
};

export default MiniLeadForm;

