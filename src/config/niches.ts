import type { NicheConfigs } from "@/types";

export const NICHE_CONFIGS: NicheConfigs = {
  DENTIST: {
    label: "Cabinet dentaire",
    icon: "\u{1F9B7}",
    defaultDelay: 2,
    vocabulary: {
      client: "patient",
      clients: "patients",
      establishment: "cabinet",
      visit: "consultation",
    },
    templates: {
      SMS: {
        body: "Bonjour {{clientName}}, merci pour votre visite au cabinet {{businessName}}. Votre avis nous aide beaucoup : {{link}}",
      },
      EMAIL: {
        subject: "Votre avis compte pour {{businessName}}",
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Merci pour votre visite !</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous esperons que votre rendez-vous au cabinet <strong>{{businessName}}</strong> s'est bien passe.</p>
  <p>Votre retour nous aide a ameliorer nos soins. Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci pour votre confiance.<br>L'equipe {{businessName}}</p>
</div>`,
      },
    },
  },
  OSTEOPATH: {
    label: "Cabinet d'osteopathie",
    icon: "\u{1F932}",
    defaultDelay: 3,
    vocabulary: {
      client: "patient",
      clients: "patients",
      establishment: "cabinet",
      visit: "seance",
    },
    templates: {
      SMS: {
        body: "Bonjour {{clientName}}, merci pour votre seance chez {{businessName}}. Un petit avis ? {{link}}",
      },
      EMAIL: {
        subject: "Comment vous sentez-vous apres votre seance ?",
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Comment allez-vous ?</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous esperons que votre seance chez <strong>{{businessName}}</strong> vous a fait du bien.</p>
  <p>Un retour rapide nous aide a mieux vous accompagner :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">A bientot !<br>{{businessName}}</p>
</div>`,
      },
    },
  },
  GARAGE: {
    label: "Garage automobile",
    icon: "\u{1F527}",
    defaultDelay: 24,
    vocabulary: {
      client: "client",
      clients: "clients",
      establishment: "garage",
      visit: "intervention",
    },
    templates: {
      SMS: {
        body: "Bonjour {{clientName}}, votre vehicule est passe chez {{businessName}}. Satisfait ? Dites-le nous : {{link}}",
      },
      EMAIL: {
        subject: "Tout roule apres votre passage chez {{businessName}} ?",
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Votre vehicule roule bien ?</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Merci d'avoir confie votre vehicule a <strong>{{businessName}}</strong>.</p>
  <p>Votre avis nous aide a maintenir la qualite de nos services :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci et a bientot !<br>L'equipe {{businessName}}</p>
</div>`,
      },
    },
  },
};
