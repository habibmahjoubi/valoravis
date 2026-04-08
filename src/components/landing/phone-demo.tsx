"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, ArrowRight, Check } from "lucide-react";

export function PhoneDemo() {
  const [step, setStep] = useState(0);
  const [starsFilled, setStarsFilled] = useState(0);

  const runSequence = useCallback(() => {
    setStep(0);
    setStarsFilled(0);

    const timers = [
      // Step 0: Email visible
      setTimeout(() => setStep(1), 2500),
      // Step 1: "Marie ouvre le lien"
      setTimeout(() => setStep(2), 4000),
      // Step 2: Rating page — étoiles s'allument une par une
      setTimeout(() => setStarsFilled(1), 4800),
      setTimeout(() => setStarsFilled(2), 5100),
      setTimeout(() => setStarsFilled(3), 5400),
      setTimeout(() => setStarsFilled(4), 5700),
      setTimeout(() => setStarsFilled(5), 6000),
      // Step 3: "5 étoiles ! Redirection..."
      setTimeout(() => setStep(3), 6800),
      // Step 4: Google avis publié
      setTimeout(() => setStep(4), 8500),
    ];

    return timers;
  }, []);

  useEffect(() => {
    let timers = runSequence();

    // Boucle toutes les 13 secondes
    const loop = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = runSequence();
    }, 13000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, [runSequence]);

  return (
    <div className="relative w-[260px] h-[520px] mx-auto">
      {/* Phone frame */}
      <div className="absolute inset-0 rounded-[2.5rem] border-[6px] border-foreground/10 bg-card shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="h-10 bg-muted/50 flex items-center justify-between px-5 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <div className="w-20 h-5 rounded-full bg-foreground/10" />
          <span>100%</span>
        </div>

        {/* Screen content */}
        <div className="p-4 h-[calc(100%-2.5rem)] relative">

          {/* ── Écran 1 : Email reçu ── */}
          <div className={`absolute inset-4 transition-all duration-500 ease-out ${
            step <= 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6 pointer-events-none"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-bold">Cabinet Dentaire</p>
                <p className="text-[9px] text-muted-foreground">Votre avis compte</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-3 text-[11px] leading-relaxed">
              <p>Bonjour Marie,</p>
              <p className="mt-1.5">Nous espérons que votre rendez-vous s'est bien passé.</p>
              <p className="mt-1.5">Votre retour nous aide beaucoup :</p>
              <div className="mt-3 bg-primary text-white text-center py-2 rounded-lg text-[10px] font-semibold">
                Donner mon avis
              </div>
            </div>
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] text-primary font-medium transition-opacity duration-500 ${
              step >= 1 ? "opacity-100" : "opacity-0"
            }`}>
              <ArrowRight className="w-3 h-3" /> Marie ouvre le lien...
            </div>
          </div>

          {/* ── Écran 2 : Page de notation ── */}
          <div className={`absolute inset-4 transition-all duration-500 ease-out ${
            step === 2 || step === 3 ? "opacity-100 translate-y-0" : step < 2 ? "opacity-0 translate-y-8 pointer-events-none" : "opacity-0 -translate-y-6 pointer-events-none"
          }`}>
            <div className="text-center pt-8">
              <p className="text-[12px] font-bold mb-1">Bonjour Marie !</p>
              <p className="text-[10px] text-muted-foreground mb-6">
                Comment évaluez-vous votre expérience ?
              </p>
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-9 h-9 transition-all duration-300 ${
                      s <= starsFilled
                        ? "text-primary fill-primary scale-110"
                        : "text-border"
                    }`}
                    style={{ transitionDelay: `${(s - 1) * 60}ms` }}
                  />
                ))}
              </div>
              <div className={`transition-all duration-500 ${
                step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}>
                <p className="text-[11px] text-success font-bold mb-1">5 étoiles !</p>
                <p className="text-[9px] text-muted-foreground">Redirection vers Google...</p>
              </div>
            </div>
          </div>

          {/* ── Écran 3 : Avis Google publié ── */}
          <div className={`absolute inset-4 transition-all duration-500 ease-out ${
            step >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
          }`}>
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#4285F4] flex items-center justify-center text-white text-[11px] font-bold">G</div>
                <p className="text-[11px] font-bold">Google Avis</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3.5 border border-border/50">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">M</div>
                  <div>
                    <p className="text-[10px] font-bold">Marie D.</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Très bon accueil, équipe professionnelle et à l'écoute. Je recommande vivement !
                </p>
              </div>
              <div className="mt-5 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-success/10 text-success text-[10px] font-semibold">
                  <Check className="w-3 h-3" />
                  Avis publié sur Google
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-5 bg-primary" : i < step ? "w-1.5 bg-primary/30" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Labels sous les dots */}
      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] text-muted-foreground">
          {step <= 1 && "Email envoyé au client"}
          {step === 2 && "Le client note son expérience"}
          {step === 3 && "5 étoiles — redirection Google"}
          {step >= 4 && "Avis publié !"}
        </p>
      </div>
    </div>
  );
}
