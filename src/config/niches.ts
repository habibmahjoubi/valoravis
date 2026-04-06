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
  <p>Nous espérons que votre rendez-vous au cabinet <strong>{{businessName}}</strong> s'est bien passe.</p>
  <p>Votre retour nous aide à améliorer nos soins. Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci pour votre confiance.<br>L'équipe {{businessName}}</p>
</div>`,
      },
    },
  },
  OSTEOPATH: {
    label: "Cabinet d'ostéopathie",
    icon: "\u{1F932}",
    defaultDelay: 3,
    vocabulary: {
      client: "patient",
      clients: "patients",
      establishment: "cabinet",
      visit: "séance",
    },
    templates: {
      SMS: {
        body: "Bonjour {{clientName}}, merci pour votre séance chez {{businessName}}. Un petit avis ? {{link}}",
      },
      EMAIL: {
        subject: "Comment vous sentez-vous après votre séance ?",
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Comment allez-vous ?</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous espérons que votre séance chez <strong>{{businessName}}</strong> vous à fait du bien.</p>
  <p>Un retour rapide nous aide à mieux vous accompagner :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">A bientôt !<br>{{businessName}}</p>
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
        body: "Bonjour {{clientName}}, votre véhicule est passe chez {{businessName}}. Satisfait ? Dites-le nous : {{link}}",
      },
      EMAIL: {
        subject: "Tout roule après votre passage chez {{businessName}} ?",
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Votre véhicule roule bien ?</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Merci d'avoir confié votre véhicule à <strong>{{businessName}}</strong>.</p>
  <p>Votre avis nous aide à maintenir la qualité de nos services :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci et à bientôt !<br>L'équipe {{businessName}}</p>
</div>`,
      },
    },
  },
};
