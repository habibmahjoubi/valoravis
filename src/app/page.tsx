export const dynamic = "force-dynamic";

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
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Créez votre compte",
    description: "Inscription en 30 secondes. Configurez votre établissement et collez votre lien Google.",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Users,
    title: "Ajoutez vos clients",
    description: "Un par un ou importez-les en masse via CSV. Simple et rapide.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Send,
    title: "Envoyéz la demande",
    description: "Un clic suffit. Email ou SMS personnalisé, automatique après chaque prestation.",
    color: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: Star,
    title: "Récoltez les avis",
    description: "Client satisfait ? Redirige vers Google. Insatisfait ? Feedback privé pour vous.",
    color: "from-fuchsia-500 to-pink-500",
  },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Protégez votre e-réputation",
    description: "Les mécontents vous écrivent en privé. Seuls les satisfaits publient sur Google.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Rocket,
    title: "100% automatisé",
    description: "Programmez l'envoi après chaque prestation. Zéro effort au quotidien.",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    icon: Target,
    title: "Adapté à votre métier",
    description: "Messages pré-rédigés, vocabulaire métier, délais optimisés par profession.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: BarChart3,
    title: "Tableaux de bord complets",
    description: "Taux de clic, avis obtenus, évolution — suivez vos résultats en temps réel.",
    gradient: "from-sky-500/20 to-blue-500/20",
  },
  {
    icon: Smartphone,
    title: "Email et SMS",
    description: "Choisissez le canal qui convertit le mieux pour chaque client.",
    gradient: "from-rose-500/20 to-pink-500/20",
  },
  {
    icon: Lock,
    title: "Zero engagement",
    description: "Plan gratuit pour démarrer. Upgradez quand vous voulez. Annulez en un clic.",
    gradient: "from-slate-500/20 to-gray-500/20",
  },
];

const NICHES = [
  {
    icon: Stethoscope,
    label: "Cabinets dentaires",
    description: "Envoi automatique 2h après le rendez-vous",
    stat: "+340%",
    statLabel: "d'avis en plus",
    gradient: "from-sky-500 to-indigo-500",
  },
  {
    icon: Bone,
    label: "Ostéopathes",
    description: "Envoi automatique 3h après la séance",
    stat: "+280%",
    statLabel: "d'avis en plus",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Wrench,
    label: "Garages auto",
    description: "Envoi automatique 24h après l'intervention",
    stat: "+250%",
    statLabel: "d'avis en plus",
    gradient: "from-amber-500 to-orange-500",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Martin L.",
    role: "Chirurgien-dentiste, Lyon",
    text: "En 2 mois, on est passe de 12 à 67 avis Google. Les patients adorent la simplicite du processus.",
    avatar: "M",
  },
  {
    name: "Sophie R.",
    role: "Osteopathe, Bordeaux",
    text: "Tout est automatisé. Mes patients reçoivent un message après chaque séance sans que j'aie rien à faire.",
    avatar: "S",
  },
  {
    name: "Garage Central",
    role: "Garage auto, Nantes",
    text: "3 à 4 nouveaux avis par semaine. Notre note est passee de 3.8 à 4.6 en trois mois.",
    avatar: "G",
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
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">AvisBoost</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#fonctionnement" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnement
            </a>
            <a href="#avantages" className="text-muted-foreground hover:text-foreground transition-colors">
              Avantages
            </a>
            <a href="#tarifs" className="text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="text-sm font-semibold gradient-primary text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 gradient-border bg-card">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="gradient-text font-semibold">
              {totalUsers > 10
                ? `Rejoint par ${totalUsers}+ professionnels`
                : "Nouveau : collecte d'avis Google automatisée"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Transformez chaque client en{" "}
            <span className="gradient-text">avis 5 étoiles</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Envoyéz automatiquement une demande d'avis après chaque prestation.
            Un clic pour le client, un avis Google pour vous.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="flex items-center gap-2 gradient-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-primary/30"
            >
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#fonctionnement"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-6 py-4 text-lg font-medium transition-colors"
            >
              Découvrir
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-success" />
              {plans[0] && plans[0].quota > 0 ? `${plans[0].quota} envois offerts` : "Gratuit"}
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-success" />
              Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-success" />
              Prêt en 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-8 border-y border-border/50 bg-card/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {[
            { value: "4.9/5", label: "Satisfaction", icon: Star },
            { value: "+300%", label: "Avis en plus", icon: BarChart3 },
            { value: "2 min", label: "Installation", icon: Clock },
            { value: "0\u20AC", label: "Pour commencer", icon: Zap },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="fonctionnement" className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold gradient-text uppercase tracking-wider mb-3">
              Fonctionnement
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              4 etapes. 2 minutes. C'est tout.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Pas besoin de competences techniques. AvisBoost s'occupe de tout.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative group">
                <div className="bg-card rounded-2xl p-6 border border-border/50 h-full transition-all duration-300 glow-card">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-wider">
                    Etape {i + 1}
                  </span>
                  <h3 className="font-bold text-lg mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section className="py-20 md:py-28 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold gradient-text uppercase tracking-wider mb-3">
              Votre métier
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Configuré sur mesure
            </h2>
            <p className="text-muted-foreground text-lg">
              Messages, vocabulaire et délais adaptes à votre profession.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {NICHES.map((niche) => (
              <div
                key={niche.label}
                className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 transition-all duration-300 glow-card group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${niche.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <niche.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2">{niche.label}</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {niche.description}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold gradient-text">{niche.stat}</span>
                  <span className="text-sm text-muted-foreground">{niche.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="avantages" className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold gradient-text uppercase tracking-wider mb-3">
              Avantages
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Tout pour booster votre réputation
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="bg-card rounded-2xl p-6 border border-border/50 transition-all duration-300 glow-card"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-4`}>
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Satisfaction Gate */}
      <section className="py-20 md:py-28 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl overflow-hidden gradient-border bg-card p-8 md:p-12 glow-primary">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary/25">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                La Satisfaction Gate
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Le filtre intelligent qui protège votre réputation et maximise vos avis positifs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50">
                <div className="flex items-center gap-2.5 mb-3">
                  <ThumbsUp className="w-5 h-5 text-emerald-600" />
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-emerald-900 mb-2 text-lg">
                  Client satisfait
                </h3>
                <p className="text-sm text-emerald-700/80 mb-4">
                  Redirige automatiquement vers Google pour publier un avis positif visible par tous.
                </p>
                <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  Publie sur Google Maps
                </div>
              </div>

              <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
                <div className="flex items-center gap-2.5 mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <div className="flex gap-0.5">
                    {[1, 2].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                    {[3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-amber-200" />
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-amber-900 mb-2 text-lg">
                  Client insatisfait
                </h3>
                <p className="text-sm text-amber-700/80 mb-4">
                  Feedback privé envoyé directement à votre établissement. Rien sur Google.
                </p>
                <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                  <Lock className="w-4 h-4" />
                  Confidentiel et privé
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold gradient-text uppercase tracking-wider mb-3">
              Témoignages
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Ils ont booste leurs avis
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-card rounded-2xl p-6 border border-border/50 transition-all duration-300 glow-card"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 text-foreground/80">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                    <span className="text-sm font-bold text-white">{t.avatar}</span>
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
      <section id="tarifs" className="py-20 md:py-28 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold gradient-text uppercase tracking-wider mb-3">
              Tarifs
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent, sans surprise
            </h2>
            <p className="text-muted-foreground text-lg">
              Commencez gratuitement. Évoluez à votre rythme.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, index) => {
              const isHighlighted = index === highlightedIndex;
              const isUnlimited = plan.quota === 0;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                    isHighlighted
                      ? "gradient-border bg-card shadow-2xl shadow-primary/10 md:scale-105 md:-my-4"
                      : "bg-card border border-border/50 glow-card"
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-primary/30">
                      Recommandé
                    </div>
                  )}

                  <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {isUnlimited ? "Envois illimités" : `${plan.quota} envois/mois`}
                  </p>

                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-extrabold">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold">{formatPrice(plan.price)}</span>
                        <span className="text-muted-foreground ml-1">/mois</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.price === 0 && (
                      <>
                        <PricingFeature text="Email uniquement" />
                        <PricingFeature text={plan.maxUsers === 0 ? "Etablissements illimités" : `${plan.maxUsers} établissement`} />
                        <PricingFeature text="Templates standards" />
                        <PricingFeature text="Tableau de bord" />
                      </>
                    )}
                    {plan.price > 0 && plan.price < 50 && (
                      <>
                        <PricingFeature text="Email + SMS" highlighted />
                        <PricingFeature text={plan.maxUsers === 0 ? "Etablissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} highlighted />
                        <PricingFeature text="Templates personnalisables" />
                        <PricingFeature text="Statistiques détaillées" />
                        <PricingFeature text="Import CSV" />
                      </>
                    )}
                    {plan.price >= 50 && (
                      <>
                        <PricingFeature text="Email + SMS" highlighted />
                        <PricingFeature text={plan.maxUsers === 0 ? "Etablissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} highlighted />
                        <PricingFeature text="Envois illimités" highlighted />
                        <PricingFeature text="Templates personnalisables" />
                        <PricingFeature text="Statistiques avancées" />
                        <PricingFeature text="Support prioritaire" />
                      </>
                    )}
                  </ul>

                  <Link
                    href={`/register?plan=${plan.key}`}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                      isHighlighted
                        ? "gradient-primary text-white shadow-lg shadow-primary/30 hover:opacity-90"
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
            Tous les plans incluent la Satisfaction Gate, le tableau de bord et le support email.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30 animate-float">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
            Prêt à booster vos avis Google ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Rejoignez les professionnels qui collectent des avis 5 étoiles en automatique.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 gradient-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-xl shadow-primary/30"
          >
            Démarrer maintenant — c'est gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Aucune carte bancaire requise
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border/50 bg-card/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold">AvisBoost</span>
            <span className="text-sm text-muted-foreground">{"\u00A9"} {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Connexion</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingFeature({ text, highlighted }: { text: string; highlighted?: boolean }) {
  return (
    <li className="text-sm flex items-start gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${highlighted ? "gradient-primary" : "bg-success/10"}`}>
        <Check className={`w-3 h-3 ${highlighted ? "text-white" : "text-success"}`} />
      </div>
      <span className={highlighted ? "font-medium" : ""}>{text}</span>
    </li>
  );
}
