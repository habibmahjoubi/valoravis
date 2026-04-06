import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  Send,
  Star,
  ShieldCheck,
  Rocket,
  Target,
  BarChart3,
  Smartphone,
  Lock,
  UserPlus,
  Users,
  MousePointerClick,
  ThumbsUp,
  Stethoscope,
  Bone,
  Wrench,
  Check,
  ArrowRight,
  ChevronDown,
  Zap,
  Clock,
  CreditCard,
} from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Inscrivez-vous",
    description:
      "Creez votre compte en 30 secondes. Collez votre lien Google Maps.",
  },
  {
    icon: Users,
    title: "Ajoutez vos clients",
    description:
      "Manuellement ou par import CSV. Un par un ou en masse.",
  },
  {
    icon: Send,
    title: "Envoyez la demande",
    description:
      "Un clic. Votre client recoit un email professionnel personnalise.",
  },
  {
    icon: Star,
    title: "L'avis est publie",
    description:
      "Client satisfait ? Redirige directement vers Google pour laisser un avis.",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Protegez votre reputation",
    description:
      "Les clients insatisfaits vous ecrivent en prive. Seuls les clients contents vont sur Google.",
  },
  {
    icon: Rocket,
    title: "Automatisez la collecte",
    description:
      "Programmez l'envoi apres chaque prestation. Plus besoin d'y penser.",
  },
  {
    icon: Target,
    title: "Adapte a votre metier",
    description:
      "Messages pre-rediges pour votre profession. Pret a l'emploi en 2 minutes.",
  },
  {
    icon: BarChart3,
    title: "Suivez vos resultats",
    description:
      "Taux de clic, avis obtenus, evolution dans le temps. Tout en un tableau de bord.",
  },
  {
    icon: Smartphone,
    title: "Email et SMS",
    description:
      "Choisissez le canal adapte a chaque client. Maximisez le taux de reponse.",
  },
  {
    icon: Lock,
    title: "Sans engagement",
    description:
      "Plan gratuit pour commencer. Upgradez quand vous etes pret. Annulez a tout moment.",
  },
];

const NICHES = [
  {
    icon: Stethoscope,
    label: "Cabinets dentaires",
    description: "Envoi 2h apres le rendez-vous",
    stat: "+340% d'avis en moyenne",
  },
  {
    icon: Bone,
    label: "Osteopathes",
    description: "Envoi 3h apres la seance",
    stat: "+280% d'avis en moyenne",
  },
  {
    icon: Wrench,
    label: "Garages auto",
    description: "Envoi 24h apres la restitution",
    stat: "+250% d'avis en moyenne",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Martin L.",
    role: "Chirurgien-dentiste, Lyon",
    text: "En 2 mois, on est passe de 12 a 67 avis Google. Les patients sont ravis de la simplicite.",
  },
  {
    name: "Sophie R.",
    role: "Osteopathe, Bordeaux",
    text: "Mes patients recoivent automatiquement un message apres chaque seance. Je n'ai plus rien a faire.",
  },
  {
    name: "Garage Central",
    role: "Garage auto, Nantes",
    text: "On recupere 3 a 4 avis par semaine maintenant. Notre note Google est passee de 3.8 a 4.6.",
  },
];

export default async function HomePage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const highlightedIndex = plans.length >= 2 ? 1 : 0;
  const totalUsers = await prisma.user.count({ where: { isAdmin: false } });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AvisBoost</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#fonctionnement"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnement
            </a>
            <a
              href="#avantages"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Avantages
            </a>
            <a
              href="#tarifs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary text-primary-foreground px-5 py-2 rounded-full hover:opacity-90 transition-opacity font-medium"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            {totalUsers > 10
              ? `Rejoint par ${totalUsers}+ professionnels`
              : "Collectez vos avis Google en automatique"}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Transformez vos clients satisfaits en{" "}
            <span className="text-primary">avis Google 5 etoiles</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Envoyez automatiquement une demande d'avis apres chaque prestation.
            Vos clients satisfaits laissent un avis Google en un clic. Les
            mecontents vous ecrivent en prive.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
            >
              Commencer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#fonctionnement"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground px-6 py-3.5 text-lg transition-colors"
            >
              Voir comment ca marche
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-success" />
              {plans[0] && plans[0].quota > 0
                ? `${plans[0].quota} envois offerts`
                : "Gratuit"}
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-success" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-success" />
              Pret en 2 min
            </span>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-8 bg-muted border-y border-border">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 md:gap-16">
          {[
            { icon: Star, value: "4.9/5", label: "Note moyenne" },
            { icon: BarChart3, value: "+300%", label: "Avis en plus" },
            { icon: Clock, value: "2 min", label: "Pour demarrer" },
            { icon: CreditCard, value: "0\u20AC", label: "Pour commencer" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="fonctionnement" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Simple comme 1, 2, 3, 4
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Collectez des avis Google en moins de 2 minutes, sans competence
              technique.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center md:relative md:top-auto md:right-auto md:-mt-10 md:ml-auto md:mr-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Concu pour votre metier
            </h2>
            <p className="text-muted-foreground text-lg">
              Messages, delais et vocabulaire adaptes a votre profession.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {NICHES.map((niche) => (
              <div
                key={niche.label}
                className="bg-card rounded-2xl p-5 md:p-8 border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <niche.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">{niche.label}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {niche.description}
                </p>
                <p className="text-sm font-semibold text-primary flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  {niche.stat}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="avantages" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Pourquoi AvisBoost ?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Tout ce dont vous avez besoin pour booster votre reputation en
              ligne.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title} className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Satisfaction Gate */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                Le secret : la Satisfaction Gate
              </h2>
              <p className="text-muted-foreground">
                Filtrez intelligemment les retours pour ne publier que le
                meilleur.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-success/5 border border-success/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="w-5 h-5 text-success" />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-4 h-4 text-success fill-success"
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold text-success mb-2">
                  Client satisfait (4-5 etoiles)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Redirige automatiquement vers Google pour publier un avis
                  positif. Un clic suffit.
                </p>
                <div className="mt-4 flex items-center gap-2 text-success text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  Avis publie sur Google
                </div>
              </div>

              <div className="bg-warning/5 border border-warning/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-warning" />
                  <div className="flex gap-0.5">
                    {[1, 2].map((s) => (
                      <Star
                        key={s}
                        className="w-4 h-4 text-warning fill-warning"
                      />
                    ))}
                    {[3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-border" />
                    ))}
                  </div>
                </div>
                <h3 className="font-semibold text-warning mb-2">
                  Client insatisfait (1-3 etoiles)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Recueille un feedback prive envoye directement a votre
                  etablissement. Pas sur Google.
                </p>
                <div className="mt-4 flex items-center gap-2 text-warning text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  Feedback prive confidentiel
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Ils utilisent AvisBoost
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-primary fill-primary"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-foreground/80">
                  &laquo; {t.text} &raquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 px-4 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Des tarifs simples et transparents
            </h2>
            <p className="text-muted-foreground text-lg">
              Commencez gratuitement, upgradez quand vous voulez.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const isHighlighted = index === highlightedIndex;
              const isUnlimited = plan.quota === 0;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-card rounded-2xl p-5 md:p-8 border-2 transition-all ${
                    isHighlighted
                      ? "border-primary shadow-xl shadow-primary/10 scale-105"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                      Le plus populaire
                    </div>
                  )}

                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {isUnlimited
                      ? "Envois illimites"
                      : `${plan.quota} envois/mois`}
                  </p>

                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-4xl font-bold">
                          0{"\u20AC"}
                        </span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.price === 0 && (
                      <>
                        <PricingFeature text="Email uniquement" />
                        <PricingFeature
                          text={
                            plan.maxUsers === 0
                              ? "Etablissements illimites"
                              : `${plan.maxUsers} etablissement`
                          }
                        />
                        <PricingFeature text="Templates standards" />
                        <PricingFeature text="Tableau de bord" />
                      </>
                    )}
                    {plan.price > 0 && plan.price < 50 && (
                      <>
                        <PricingFeature text="Email + SMS" highlighted />
                        <PricingFeature
                          text={
                            plan.maxUsers === 0
                              ? "Etablissements illimites"
                              : `${plan.maxUsers} etablissement${plan.maxUsers > 1 ? "s" : ""}`
                          }
                          highlighted
                        />
                        <PricingFeature text="Templates personnalisables" />
                        <PricingFeature text="Statistiques detaillees" />
                        <PricingFeature text="Import CSV" />
                      </>
                    )}
                    {plan.price >= 50 && (
                      <>
                        <PricingFeature text="Email + SMS" highlighted />
                        <PricingFeature
                          text={
                            plan.maxUsers === 0
                              ? "Etablissements illimites"
                              : `${plan.maxUsers} etablissement${plan.maxUsers > 1 ? "s" : ""}`
                          }
                          highlighted
                        />
                        <PricingFeature text="Envois illimites" highlighted />
                        <PricingFeature text="Templates personnalisables" />
                        <PricingFeature text="Statistiques avancees" />
                        <PricingFeature text="Support prioritaire" />
                      </>
                    )}
                  </ul>

                  <Link
                    href={`/register?plan=${plan.key}`}
                    className={`flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all ${
                      isHighlighted
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90"
                        : "bg-foreground/5 text-foreground hover:bg-foreground/10"
                    }`}
                  >
                    {plan.price === 0
                      ? "Commencer gratuitement"
                      : plan.trialDays > 0
                        ? `Essai gratuit ${plan.trialDays} jours`
                        : `Choisir ${plan.name}`}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Tous les plans incluent : satisfaction gate, tableau de bord,
            support par email. Annulation a tout moment.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Pret a booster vos avis Google ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Rejoignez les professionnels qui collectent des avis 5 etoiles en
            automatique.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
          >
            Demarrer maintenant — c'est gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Aucune carte bancaire requise
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border bg-muted">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Star className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-bold">AvisBoost</span>
            <span className="text-sm text-muted-foreground">
              {"\u00A9"} {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="hover:text-foreground transition-colors"
            >
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingFeature({
  text,
  highlighted,
}: {
  text: string;
  highlighted?: boolean;
}) {
  return (
    <li className="text-sm flex items-start gap-2.5">
      <Check
        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? "text-primary" : "text-success"}`}
      />
      <span className={highlighted ? "font-medium" : ""}>{text}</span>
    </li>
  );
}
