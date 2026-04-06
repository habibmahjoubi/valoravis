export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  Send, Star, ShieldCheck, Rocket, Target, BarChart3, Smartphone, Lock,
  UserPlus, Users, Check, ArrowRight, ChevronDown, Clock, CreditCard,
  Sparkles, ThumbsUp, ArrowUpRight, Stethoscope, Bone, Wrench, Quote,
} from "lucide-react";

export default async function HomePage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const highlightedIndex = plans.length >= 2 ? 1 : 0;
  const totalUsers = await prisma.user.count({ where: { isAdmin: false } });

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 brand-gradient rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AvisBoost</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium">
            <a href="#comment" className="link-underline text-muted-foreground hover:text-foreground transition-colors">Comment ça marche</a>
            <a href="#avantages" className="link-underline text-muted-foreground hover:text-foreground transition-colors">Avantages</a>
            <a href="#tarifs" className="link-underline text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Se connecter
            </Link>
            <Link href="/register" className="text-[13px] font-semibold brand-gradient text-white px-5 py-2 rounded-full btn-glow transition-all">
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mesh-bg grain py-24 md:py-36 px-5">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="pill mx-auto mb-8 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            {totalUsers > 10
              ? `${totalUsers}+ professionnels nous font confiance`
              : "La collecte d'avis Google, simplifiée"}
          </div>

          <h1 className="text-[2.5rem] sm:text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-[1.1] mb-6">
            Chaque client satisfait<br />
            mérite de <span className="brand-gradient-text">le dire sur Google</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Un email après la prestation, un clic pour le client, un avis 5&nbsp;étoiles pour vous. Automatique, intelligent, sans effort.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/register"
              className="flex items-center gap-2 brand-gradient text-white px-7 py-3.5 rounded-full text-[15px] font-semibold btn-glow transition-all shadow-xl shadow-primary/20"
            >
              Démarrer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#comment" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground px-5 py-3.5 text-[15px] font-medium transition-colors">
              Découvrir <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {[
              { icon: Check, text: plans[0]?.quota > 0 ? `${plans[0].quota} envois offerts` : "Gratuit" },
              { icon: CreditCard, text: "Sans carte bancaire" },
              { icon: Clock, text: "Prêt en 2 min" },
            ].map((item) => (
              <span key={item.text} className="flex items-center gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-success" />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-7 border-y border-border/40">
        <div className="max-w-4xl mx-auto px-5 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {[
            { value: "4,9/5", label: "Satisfaction" },
            { value: "×3", label: "Plus d'avis" },
            { value: "2 min", label: "Pour démarrer" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold tracking-tight brand-gradient-text">{s.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="comment" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader tag="Fonctionnement" title="4 étapes, 0 compétence technique" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {[
              { icon: UserPlus, title: "Inscription", desc: "30 secondes. Collez votre lien Google Maps, c'est parti." },
              { icon: Users, title: "Contacts", desc: "Ajoutez vos clients un par un ou importez-les en CSV." },
              { icon: Send, title: "Envoi", desc: "Email personnalisé envoyé automatiquement après la prestation." },
              { icon: Star, title: "Avis publié", desc: "Le client satisfait est redirigé directement vers Google." },
            ].map((step, i) => (
              <div key={step.title} className="card-elevated rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="step-number">{i + 1}</div>
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTIERS */}
      <section className="py-24 px-5 mesh-bg grain relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeader tag="Votre métier" title="Configuré sur mesure pour vous" />
          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {[
              { icon: Stethoscope, name: "Cabinets dentaires", timing: "2h après le rendez-vous", stat: "×3,4", color: "text-sky-600 bg-sky-50" },
              { icon: Bone, name: "Ostéopathes", timing: "3h après la séance", stat: "×2,8", color: "text-violet-600 bg-violet-50" },
              { icon: Wrench, name: "Garages auto", timing: "24h après l'intervention", stat: "×2,5", color: "text-amber-600 bg-amber-50" },
            ].map((niche) => (
              <div key={niche.name} className="card-elevated rounded-2xl p-7">
                <div className={`w-12 h-12 rounded-xl ${niche.color} flex items-center justify-center mb-5`}>
                  <niche.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">{niche.name}</h3>
                <p className="text-sm text-muted-foreground mb-5">Envoi automatique {niche.timing}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold brand-gradient-text">{niche.stat}</span>
                  <span className="text-sm text-muted-foreground">d'avis en plus</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="avantages" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionHeader tag="Pourquoi AvisBoost" title="Tout ce qu'il faut, rien de superflu" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
            {[
              { icon: ShieldCheck, title: "E-réputation protégée", desc: "Les mécontents vous écrivent en privé. Seuls les satisfaits publient sur Google." },
              { icon: Rocket, title: "Zéro effort", desc: "Automatisé de bout en bout. Programmez une fois, oubliez." },
              { icon: Target, title: "Adapté à votre métier", desc: "Vocabulaire, délais, templates — tout est calibré pour votre profession." },
              { icon: BarChart3, title: "Résultats mesurables", desc: "Taux de clic, avis obtenus, évolution. Pilotez en temps réel." },
              { icon: Smartphone, title: "Email & SMS", desc: "Choisissez le canal qui convertit le mieux pour chaque client." },
              { icon: Lock, title: "Zéro engagement", desc: "Gratuit pour démarrer, annulation en un clic. Pas de piège." },
            ].map((b) => (
              <div key={b.title} className="group p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1.5">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SATISFACTION GATE */}
      <section className="py-24 px-5 mesh-bg grain relative">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="card-elevated rounded-3xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="w-14 h-14 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">La Satisfaction Gate</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Le filtre qui protège votre réputation et maximise les avis positifs.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-5 bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />)}
                  </div>
                </div>
                <h3 className="font-bold text-emerald-900 mb-1">Satisfait</h3>
                <p className="text-xs text-emerald-700/70 mb-3">Redirigé vers Google pour publier un avis visible par tous.</p>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Publié sur Google</span>
              </div>
              <div className="rounded-2xl p-5 bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <div className="flex gap-0.5">
                    {[1,2].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                    {[3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-amber-200" />)}
                  </div>
                </div>
                <h3 className="font-bold text-amber-900 mb-1">Insatisfait</h3>
                <p className="text-xs text-amber-700/70 mb-3">Feedback privé envoyé directement à votre établissement.</p>
                <span className="text-xs font-semibold text-amber-700 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Reste confidentiel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <SectionHeader tag="Témoignages" title="Ils ont boosté leurs avis" />
          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {[
              { name: "Dr. Martin L.", role: "Dentiste · Lyon", quote: "De 12 à 67 avis en 2 mois. Les patients adorent la simplicité." },
              { name: "Sophie R.", role: "Ostéopathe · Bordeaux", quote: "Tout est automatisé. Je n'ai plus rien à faire, les avis arrivent tout seuls." },
              { name: "Garage Central", role: "Garage · Nantes", quote: "3 à 4 avis par semaine. Note passée de 3,8 à 4,6 en trois mois." },
            ].map((t) => (
              <div key={t.name} className="card-elevated rounded-2xl p-6">
                <Quote className="w-5 h-5 text-primary/30 mb-3" />
                <p className="text-sm leading-relaxed mb-5">{t.quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-9 h-9 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" className="py-24 px-5 mesh-bg grain relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeader tag="Tarifs" title="Simple, transparent, sans piège" subtitle="Commencez gratuitement. Évoluez à votre rythme." />
          <div className="grid md:grid-cols-3 gap-5 items-start mt-14">
            {plans.map((plan, index) => {
              const isHL = index === highlightedIndex;
              return (
                <div key={plan.id} className={`rounded-2xl p-7 transition-all relative ${isHL ? "card-elevated border-2 border-primary/30 md:scale-[1.03] md:-my-3 shadow-xl shadow-primary/8" : "card-elevated"}`}>
                  {isHL && <div className="absolute -top-3 left-1/2 -translate-x-1/2 brand-gradient text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">RECOMMANDÉ</div>}
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-5">{plan.quota === 0 ? "Envois illimités" : `${plan.quota} envois/mois`}</p>
                  <div className="mb-6">
                    {plan.price === 0 ? <span className="text-3xl font-extrabold">Gratuit</span> : <><span className="text-3xl font-extrabold">{formatPrice(plan.price)}</span><span className="text-muted-foreground text-sm ml-1">/mois</span></>}
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.price === 0 && <><PF text="Email uniquement" /><PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement`} /><PF text="Templates standards" /><PF text="Tableau de bord" /></>}
                    {plan.price > 0 && plan.price < 50 && <><PF text="Email + SMS" bold /><PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} bold /><PF text="Templates personnalisés" /><PF text="Statistiques détaillées" /><PF text="Import CSV" /></>}
                    {plan.price >= 50 && <><PF text="Email + SMS" bold /><PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} bold /><PF text="Envois illimités" bold /><PF text="Templates personnalisés" /><PF text="Statistiques avancées" /><PF text="Support prioritaire" /></>}
                  </ul>
                  <Link href={`/register?plan=${plan.key}`} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${isHL ? "brand-gradient text-white shadow-md shadow-primary/20 btn-glow" : "bg-muted text-foreground hover:bg-muted-foreground/10"}`}>
                    {plan.price === 0 ? "Commencer" : plan.trialDays > 0 ? `Essai gratuit ${plan.trialDays}j` : "Choisir"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">Satisfaction Gate incluse dans tous les plans · Annulation à tout moment</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Prêt à transformer vos clients<br />en ambassadeurs ?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Rejoignez les professionnels qui collectent des avis 5 étoiles sans effort.</p>
          <Link href="/register" className="inline-flex items-center gap-2 brand-gradient text-white px-8 py-4 rounded-full text-base font-semibold btn-glow transition-all shadow-xl shadow-primary/20">
            Démarrer maintenant — c'est gratuit <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-4">Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-5 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 brand-gradient rounded-md flex items-center justify-center"><Star className="w-2.5 h-2.5 text-white fill-white" /></div>
            <span className="text-sm font-semibold">AvisBoost</span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/login" className="link-underline hover:text-foreground transition-colors">Connexion</Link>
            <Link href="/register" className="link-underline hover:text-foreground transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <span className="pill mb-4 inline-flex">{tag}</span>
      <h2 className="text-2xl sm:text-3xl font-bold mt-3">{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

function PF({ text, bold }: { text: string; bold?: boolean }) {
  return (
    <li className="text-sm flex items-start gap-2">
      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${bold ? "text-primary" : "text-success/70"}`} />
      <span className={bold ? "font-medium" : "text-muted-foreground"}>{text}</span>
    </li>
  );
}
