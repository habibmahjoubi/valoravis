export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  Send, Star, ShieldCheck, Rocket, BarChart3, Smartphone, Lock,
  UserPlus, Users, Check, ArrowRight, ChevronRight, Clock, CreditCard,
  ThumbsUp, ArrowUpRight, Stethoscope, Bone, Wrench, Quote, Building2,
  Scissors, UtensilsCrossed, ShoppingBag, Heart, Car, Dumbbell, Briefcase,
  Shield, MapPin, MessageCircle,
} from "lucide-react";
import { PhoneDemo } from "@/components/landing/phone-demo";
import { FaqButton } from "@/components/landing/faq-modal";

export default async function HomePage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const highlightedIndex = plans.length >= 2 ? 1 : 0;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 brand-gradient rounded-xl flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">AvisBoost</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 sm:gap-8 text-[13px] font-medium">
            <a href="#comment" className="link-underline text-muted-foreground hover:text-foreground transition-colors">Comment ça marche</a>
            <a href="#metiers" className="link-underline text-muted-foreground hover:text-foreground transition-colors">Pour qui</a>
            <a href="#tarifs" className="link-underline text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">Se connecter</Link>
            <Link href="/register" className="text-[13px] font-semibold brand-gradient text-white px-5 py-2 rounded-full btn-glow transition-all">Essai gratuit</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative mesh-bg grain py-16 sm:py-24 md:py-28 px-5">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-10 items-center">
            <div>
              <p className="text-sm font-semibold text-primary mb-4 tracking-wide">Pour les professionnels de proximité</p>
              <h1 className="text-[2.2rem] sm:text-5xl md:text-[3.4rem] font-extrabold tracking-tight leading-[1.08] mb-5">
                Vos clients vous adorent.<br />
                <span className="brand-gradient-text">Faites-le savoir.</span>
              </h1>
              <p className="text-base md:text-[17px] text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Après chaque prestation, AvisBoost envoie automatiquement une demande d'avis. Client satisfait ? Il publie sur Google. Mécontent ? Il vous écrit en privé.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
                <Link href="/register" className="flex items-center gap-2 brand-gradient text-white px-7 py-3.5 rounded-full text-[15px] font-semibold btn-glow transition-all shadow-xl shadow-primary/20">
                  Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" />{plans[0]?.quota > 0 ? `${plans[0].quota} envois offerts` : "Gratuit"}</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" />Sans carte bancaire</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success" />2 min pour démarrer</span>
              </div>
            </div>

            {/* Démo téléphone animée */}
            <div className="hidden sm:flex justify-center pb-10">
              <PhoneDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ── LE PROBLÈME / LA SOLUTION ── */}
      <section className="py-20 px-5 border-b border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-destructive/70 mb-2">Le constat</p>
              <h2 className="text-2xl font-bold mb-4">80% de vos clients satisfaits ne laissent jamais d'avis</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ils ont apprécié votre travail, mais personne ne le saura. Pendant ce temps, un seul client mécontent peut ruiner votre note Google.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Le problème n'est pas la satisfaction — c'est le passage à l'acte. Vos clients ont besoin d'un coup de pouce au bon moment.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary mb-2">La solution</p>
              <h2 className="text-2xl font-bold mb-4">AvisBoost transforme le silence en 5 étoiles</h2>
              <div className="space-y-4">
                {[
                  "Un message envoyé automatiquement après la prestation",
                  "Le client note en un clic — s'il est content, direction Google",
                  "S'il est mécontent, vous récupérez le feedback en privé",
                ].map((text, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="step-number flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section id="comment" className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-primary mb-2">En pratique</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">Ce que vit votre client</h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-6 top-8 bottom-8 w-px bg-border" />

            <div className="space-y-8">
              {[
                { time: "J+0", title: "Votre client passe chez vous", desc: "Consultation, séance, intervention — peu importe le métier." },
                { time: "J+0 à J+1", title: "Il reçoit un email personnalisé", desc: "Message adapté à votre profession, envoyé au moment idéal." },
                { time: "30 sec", title: "Il clique et note son expérience", desc: "Page simple, une question, 5 étoiles à cliquer." },
                { time: "Si 4-5★", title: "Redirigé vers Google", desc: "Il publie son avis directement. Vous gagnez en visibilité." },
                { time: "Si 1-3★", title: "Feedback privé", desc: "Son retour reste entre vous. Votre note Google est protégée." },
              ].map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 relative z-10 bg-white border-2 border-primary/20">
                      {step.time.length <= 4 ? step.time : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                  <div className="flex-1 pb-2">
                    <span className="md:hidden text-xs font-bold text-primary">{step.time}</span>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── POUR QUI ── */}
      <section id="metiers" className="py-20 px-5 mesh-bg grain relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-sm font-semibold text-primary mb-2">Pour tous les professionnels</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Quel que soit votre métier, vos avis comptent</h2>
          <p className="text-muted-foreground mb-10 max-w-lg">
            AvisBoost s'adapte automatiquement à votre activité : vocabulaire, délais d'envoi, modèles de messages.
          </p>

          {/* Métiers principaux */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Stethoscope, name: "Dentistes", detail: "Envoi 2h après le RDV", stat: "×3,4 avis", color: "text-sky-600 bg-sky-50 border-sky-100" },
              { icon: Bone, name: "Ostéopathes", detail: "Envoi 3h après la séance", stat: "×2,8 avis", color: "text-violet-600 bg-violet-50 border-violet-100" },
              { icon: Wrench, name: "Garages auto", detail: "Envoi 24h après", stat: "×2,5 avis", color: "text-amber-600 bg-amber-50 border-amber-100" },
            ].map((m) => (
              <div key={m.name} className={`rounded-2xl p-5 border ${m.color}`}>
                <m.icon className="w-6 h-6 mb-3" />
                <h3 className="font-bold mb-0.5">{m.name}</h3>
                <p className="text-xs opacity-70 mb-3">{m.detail}</p>
                <p className="text-xl font-extrabold brand-gradient-text">{m.stat}</p>
              </div>
            ))}
          </div>

          {/* Autres métiers — grille de tags */}
          <div className="card-elevated rounded-2xl p-6">
            <p className="text-sm font-semibold mb-4">Et aussi pour :</p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Scissors, label: "Coiffeurs & barbiers" },
                { icon: UtensilsCrossed, label: "Restaurants" },
                { icon: ShoppingBag, label: "Commerces" },
                { icon: Heart, label: "Infirmiers" },
                { icon: Car, label: "Auto-écoles" },
                { icon: Dumbbell, label: "Coachs sportifs" },
                { icon: Briefcase, label: "Avocats & notaires" },
                { icon: Building2, label: "Agents immobiliers" },
                { icon: Stethoscope, label: "Kinés" },
                { icon: Scissors, label: "Esthéticiennes" },
                { icon: Wrench, label: "Plombiers" },
                { icon: Building2, label: "Architectes" },
              ].map((tag) => (
                <span key={tag.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm border border-border/50">
                  <tag.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  {tag.label}
                </span>
              ))}
              <Link href="/register?plan=free" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-sm text-primary font-medium border border-primary/20">
                Votre métier ? <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SATISFACTION GATE ── */}
      <section className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Le filtre intelligent</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Les avis négatifs ne finissent jamais sur Google. Vous les récupérez en privé pour vous améliorer. Seuls les retours positifs sont publiés.
              </p>
            </div>
            <div className="md:col-span-3 space-y-3">
              <div className="rounded-2xl p-5 bg-emerald-50 border border-emerald-100 flex items-start gap-4">
                <ThumbsUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-emerald-900">4-5 étoiles</h3>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-emerald-500 fill-emerald-500" />)}</div>
                  </div>
                  <p className="text-xs text-emerald-700/70">Redirection automatique vers Google Maps pour publier l'avis</p>
                </div>
                <span className="ml-auto text-emerald-600"><ArrowUpRight className="w-4 h-4" /></span>
              </div>
              <div className="rounded-2xl p-5 bg-amber-50 border border-amber-100 flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-amber-900">1-3 étoiles</h3>
                    <div className="flex gap-0.5">{[1,2].map(s => <Star key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />)}{[3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-200" />)}</div>
                  </div>
                  <p className="text-xs text-amber-700/70">Le client vous écrit en privé — rien ne va sur Google</p>
                </div>
                <span className="ml-auto text-amber-600"><Lock className="w-4 h-4" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AVANTAGES (compact) ── */}
      <section className="py-20 px-5 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Rocket, title: "Automatisé", desc: "Programmez une fois, oubliez" },
              { icon: BarChart3, title: "Mesurable", desc: "Taux de clic, avis obtenus" },
              { icon: Smartphone, title: "Email & SMS", desc: "Choisissez le canal adapté" },
              { icon: Lock, title: "Sans engagement", desc: "Annulation en un clic" },
            ].map((b) => (
              <div key={b.title} className="flex gap-3">
                <b.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-20 px-5 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-primary mb-2">Retours clients</p>
          <h2 className="text-2xl font-bold mb-8">Ce qu'en disent nos utilisateurs</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Dr. Martin L.", role: "Dentiste · Lyon", quote: "De 12 à 67 avis en 2 mois. Mes patients adorent la simplicité." },
              { name: "Sophie R.", role: "Ostéopathe · Bordeaux", quote: "Tout est automatisé. Les avis arrivent tout seuls, je n'ai rien à faire." },
              { name: "Garage Central", role: "Garage · Nantes", quote: "3 à 4 avis par semaine. Notre note est passée de 3,8 à 4,6." },
            ].map((t) => (
              <div key={t.name} className="card-elevated rounded-2xl p-5">
                <Quote className="w-4 h-4 text-primary/20 mb-2" />
                <p className="text-sm leading-relaxed mb-4">{t.quote}</p>
                <div className="flex items-center gap-2.5 pt-3 border-t border-border/50">
                  <div className="w-8 h-8 rounded-full brand-gradient flex items-center justify-center text-white text-[11px] font-bold">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="py-20 px-5 mesh-bg grain relative">
        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-sm font-semibold text-primary mb-2">Tarifs</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Commencez gratuitement</h2>
          <p className="text-muted-foreground mb-10">Évoluez quand vous êtes prêt. Annulation à tout moment.</p>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan, index) => {
              const isHL = index === highlightedIndex;
              return (
                <div key={plan.id} className={`rounded-2xl p-5 sm:p-7 transition-all relative flex flex-col ${isHL ? "card-elevated border-2 border-primary/30 shadow-xl shadow-primary/8" : "card-elevated"}`}>
                  {isHL && <div className="absolute -top-3 left-1/2 -translate-x-1/2 brand-gradient text-white text-[11px] font-bold px-3.5 py-1 rounded-full tracking-wide">RECOMMANDÉ</div>}
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-5">{plan.quota === 0 ? "Envois illimités" : `${plan.quota} envois/mois`}</p>
                  <div className="mb-6">
                    {plan.price === 0 ? <span className="text-3xl font-extrabold">Gratuit</span> : <><span className="text-3xl font-extrabold">{formatPrice(plan.price)}</span><span className="text-muted-foreground text-sm ml-1">/mois</span></>}
                  </div>
                  <ul className="space-y-2.5 flex-1">
                    {plan.key === "free" && <>
                      <PF text="Email uniquement" />
                      <PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement`} />
                      <PF text="Templates standards" />
                      <PF text="Tableau de bord" />
                    </>}
                    {plan.key === "pro" && <>
                      <PF text="Email + SMS" />
                      <PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} />
                      <PF text="Templates personnalisés" />
                      <PF text="Statistiques détaillées" />
                      <PF text="Import CSV" />
                    </>}
                    {plan.key === "business" && <>
                      <PF text="Email + SMS" />
                      <PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} />
                      <PF text={plan.quota === 0 ? "Envois illimités" : `${plan.quota} envois/mois`} />
                      <PF text="Templates personnalisés" />
                      <PF text="Statistiques avancées" />
                      <PF text="Import CSV" />
                      <PF text="Support prioritaire" />
                    </>}
                    {!["free", "pro", "business"].includes(plan.key) && <>
                      <PF text="Email + SMS" />
                      <PF text={plan.maxUsers === 0 ? "Établissements illimités" : `${plan.maxUsers} établissement${plan.maxUsers > 1 ? "s" : ""}`} />
                      <PF text="Templates personnalisés" />
                      <PF text="Tableau de bord" />
                    </>}
                  </ul>
                  <Link href={`/register?plan=${plan.key}`} className={`flex items-center justify-center gap-2 py-3 mt-7 rounded-xl text-sm font-semibold transition-all ${isHL ? "brand-gradient text-white shadow-md shadow-primary/20 btn-glow" : "bg-muted text-foreground hover:bg-muted-foreground/10"}`}>
                    {plan.price === 0 ? "Commencer" : plan.trialDays > 0 ? `Essai gratuit ${plan.trialDays}j` : "Choisir"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 px-5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Vos prochains avis 5 étoiles<br />commencent ici
          </h2>
          <p className="text-muted-foreground mb-8">
            Créez votre compte, ajoutez vos premiers clients, et regardez les avis arriver.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 brand-gradient text-white px-8 py-4 rounded-full text-base font-semibold btn-glow transition-all shadow-xl shadow-primary/20">
            Créer mon compte — c'est gratuit <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-muted-foreground mt-3">Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-5 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          {/* Badges confiance */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mb-8 pb-8 border-b border-border/30">
            {[
              { icon: MapPin, text: "Données hébergées en France" },
              { icon: Shield, text: "Conforme RGPD" },
              { icon: MessageCircle, text: "Support en français" },
              { icon: Lock, text: "Connexion sécurisée SSL" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Footer bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 brand-gradient rounded-md flex items-center justify-center"><Star className="w-2.5 h-2.5 text-white fill-white" /></div>
              <span className="text-sm font-semibold">AvisBoost</span>
              <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <FaqButton />
              <Link href="/login" className="link-underline hover:text-foreground transition-colors">Connexion</Link>
              <Link href="/register" className="link-underline hover:text-foreground transition-colors">Inscription</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PF({ text }: { text: string }) {
  return (
    <li className="text-sm flex items-start gap-2.5">
      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
      <span>{text}</span>
    </li>
  );
}
