"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

const QUESTIONS = [
  { q: "Comment ça fonctionne ?", a: "Après chaque prestation, un email est envoyé à votre client. S'il est satisfait, il publie directement sur Google. Sinon, il vous écrit en privé." },
  { q: "Les avis vont-ils vraiment sur Google ?", a: "Oui, le client est redirigé vers votre fiche Google Maps. C'est lui qui publie — 100% conforme aux règles de Google." },
  { q: "Quels métiers sont concernés ?", a: "Tous : dentistes, garages, coiffeurs, restaurants, kinés, avocats, commerces... AvisBoost s'adapte à votre vocabulaire métier." },
  { q: "Et si un client est mécontent ?", a: "Il vous écrit en privé. Son retour n'apparaît pas sur Google. Votre note publique est protégée." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, en un clic. Plan gratuit pour démarrer, aucun engagement sur les plans payants." },
  { q: "Mes données sont-elles protégées ?", a: "Données hébergées en France, connexion chiffrée, conforme RGPD. Rien n'est partagé avec des tiers." },
];

export function FaqButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="link-underline hover:text-foreground transition-colors flex items-center gap-1"
      >
        <HelpCircle className="w-3 h-3" />
        FAQ
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-4 top-[10%] bottom-[10%] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:max-h-[80vh] z-50 bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="font-bold text-lg">Questions fréquentes</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {QUESTIONS.map((item, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-sm mb-1">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
