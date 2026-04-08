import type { NicheConfigs } from "@/types";

export const NICHE_CONFIGS: NicheConfigs = {
  DENTIST: {
    label: "Cabinet dentaire",
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
    presets: {
      EMAIL: [
        {
          name: "Formel",
          subject: "Votre avis compte pour {{businessName}}",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Merci pour votre visite !</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous espérons que votre rendez-vous au cabinet <strong>{{businessName}}</strong> s'est bien passé.</p>
  <p>Votre retour nous aide à améliorer nos soins. Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci pour votre confiance.<br>L'équipe {{businessName}}</p>
</div>`,
        },
        {
          name: "Amical",
          subject: "Un petit mot pour {{businessName}} ? 😊",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Hello {{clientName}} !</h2>
  <p>On espère que vous repartez avec le sourire après votre passage chez <strong>{{businessName}}</strong> 😁</p>
  <p>Si vous avez 30 secondes, votre avis ferait super plaisir à toute l'équipe :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Laisser un avis</a>
  <p style="color:#666;font-size:13px">À très bientôt !<br>L'équipe {{businessName}}</p>
</div>`,
        },
        {
          name: "Relance",
          subject: "On n'a pas eu de vos nouvelles, {{clientName}}",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Votre avis nous intéresse toujours</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Suite à votre visite chez <strong>{{businessName}}</strong>, nous n'avons pas encore reçu votre retour.</p>
  <p>Votre avis est précieux et nous aide à nous améliorer chaque jour :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci d'avance !<br>L'équipe {{businessName}}</p>
</div>`,
        },
      ],
      SMS: [
        {
          name: "Formel",
          body: "Bonjour {{clientName}}, merci pour votre visite au cabinet {{businessName}}. Votre avis nous aide beaucoup : {{link}}",
        },
        {
          name: "Amical",
          body: "Hello {{clientName}} ! On espère que tout s'est bien passé chez {{businessName}} 😊 Un petit avis ? Ça nous ferait plaisir : {{link}}",
        },
        {
          name: "Relance",
          body: "{{clientName}}, votre retour sur votre visite chez {{businessName}} nous intéresse toujours ! 30 sec suffisent : {{link}}",
        },
      ],
    },
  },
  OSTEOPATH: {
    label: "Cabinet d'ostéopathie",
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
    presets: {
      EMAIL: [
        {
          name: "Formel",
          subject: "Comment vous sentez-vous après votre séance ?",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Comment allez-vous ?</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous espérons que votre séance chez <strong>{{businessName}}</strong> vous a fait du bien.</p>
  <p>Un retour rapide nous aide à mieux vous accompagner :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">À bientôt !<br>{{businessName}}</p>
</div>`,
        },
        {
          name: "Amical",
          subject: "Alors, comment ça va après votre séance ? 😊",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Tout va bien ? 😊</h2>
  <p>Hello {{clientName}},</p>
  <p>On espère que votre corps vous dit merci après votre passage chez <strong>{{businessName}}</strong> !</p>
  <p>Votre retour nous aide énormément :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Laisser un avis</a>
  <p style="color:#666;font-size:13px">Prenez soin de vous !<br>{{businessName}}</p>
</div>`,
        },
        {
          name: "Relance",
          subject: "Votre avis sur votre séance chez {{businessName}}",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Votre retour nous intéresse</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Suite à votre séance chez <strong>{{businessName}}</strong>, nous serions ravis d'avoir votre avis.</p>
  <p>Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci d'avance !<br>{{businessName}}</p>
</div>`,
        },
      ],
      SMS: [
        {
          name: "Formel",
          body: "Bonjour {{clientName}}, merci pour votre séance chez {{businessName}}. Votre avis nous aide à progresser : {{link}}",
        },
        {
          name: "Amical",
          body: "Hello {{clientName}} ! On espère que la séance chez {{businessName}} vous a fait du bien 😊 Un petit avis ? {{link}}",
        },
        {
          name: "Relance",
          body: "{{clientName}}, votre retour sur votre séance chez {{businessName}} compte pour nous ! 30 sec : {{link}}",
        },
      ],
    },
  },
  GARAGE: {
    label: "Garage automobile",
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
    presets: {
      EMAIL: [
        {
          name: "Formel",
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
        {
          name: "Amical",
          subject: "Alors, content de votre voiture ? 🚗",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Tout roule ? 🚗</h2>
  <p>Salut {{clientName}} !</p>
  <p>On espère que votre passage chez <strong>{{businessName}}</strong> vous a satisfait.</p>
  <p>Un petit avis nous ferait super plaisir :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Laisser un avis</a>
  <p style="color:#666;font-size:13px">Bonne route !<br>L'équipe {{businessName}}</p>
</div>`,
        },
        {
          name: "Relance",
          subject: "On attend votre retour, {{clientName}} !",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Votre avis compte</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Suite à votre passage chez <strong>{{businessName}}</strong>, nous n'avons pas encore eu votre retour.</p>
  <p>30 secondes suffisent pour nous aider :</p>
  <a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci d'avance !<br>L'équipe {{businessName}}</p>
</div>`,
        },
      ],
      SMS: [
        {
          name: "Formel",
          body: "Bonjour {{clientName}}, merci pour votre confiance envers {{businessName}}. Votre avis nous aide : {{link}}",
        },
        {
          name: "Amical",
          body: "Salut {{clientName}} ! Content de votre passage chez {{businessName}} ? 🚗 Un avis rapide : {{link}}",
        },
        {
          name: "Relance",
          body: "{{clientName}}, votre avis sur {{businessName}} nous intéresse toujours ! 30 sec : {{link}}",
        },
      ],
    },
  },
  OTHER: {
    label: "Autre métier",
    defaultDelay: 4,
    vocabulary: {
      client: "client",
      clients: "clients",
      establishment: "établissement",
      visit: "visite",
    },
    templates: {
      SMS: {
        body: "Bonjour {{clientName}}, merci pour votre visite chez {{businessName}}. Votre avis compte beaucoup : {{link}}",
      },
      EMAIL: {
        subject: "Votre avis compte pour {{businessName}}",
        body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Merci pour votre visite !</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous espérons que votre expérience chez <strong>{{businessName}}</strong> vous a plu.</p>
  <p>Votre retour nous aide à nous améliorer. Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci pour votre confiance.<br>L'équipe {{businessName}}</p>
</div>`,
      },
    },
    presets: {
      EMAIL: [
        {
          name: "Formel",
          subject: "Votre avis compte pour {{businessName}}",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Merci pour votre visite !</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Nous espérons que votre expérience chez <strong>{{businessName}}</strong> vous a plu.</p>
  <p>Votre retour nous aide à nous améliorer. Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci pour votre confiance.<br>L'équipe {{businessName}}</p>
</div>`,
        },
        {
          name: "Amical",
          subject: "Merci pour votre visite, {{clientName}} ! 😊",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Merci {{clientName}} ! 😊</h2>
  <p>On espère que votre expérience chez <strong>{{businessName}}</strong> était top !</p>
  <p>Votre avis nous ferait très plaisir :</p>
  <a href="{{link}}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Laisser un avis</a>
  <p style="color:#666;font-size:13px">À bientôt !<br>L'équipe {{businessName}}</p>
</div>`,
        },
        {
          name: "Relance",
          subject: "On aimerait vraiment avoir votre avis, {{clientName}}",
          body: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Votre retour nous intéresse</h2>
  <p>Bonjour {{clientName}},</p>
  <p>Suite à votre visite chez <strong>{{businessName}}</strong>, nous serions ravis d'avoir votre avis.</p>
  <p>Cela ne prend que 30 secondes :</p>
  <a href="{{link}}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Donner mon avis</a>
  <p style="color:#666;font-size:13px">Merci d'avance !<br>L'équipe {{businessName}}</p>
</div>`,
        },
      ],
      SMS: [
        {
          name: "Formel",
          body: "Bonjour {{clientName}}, merci pour votre visite chez {{businessName}}. Votre avis compte beaucoup : {{link}}",
        },
        {
          name: "Amical",
          body: "Hello {{clientName}} ! On espère que votre visite chez {{businessName}} vous a plu 😊 Un avis rapide ? {{link}}",
        },
        {
          name: "Relance",
          body: "{{clientName}}, votre avis sur {{businessName}} nous intéresse toujours ! 30 sec suffisent : {{link}}",
        },
      ],
    },
  },
};
