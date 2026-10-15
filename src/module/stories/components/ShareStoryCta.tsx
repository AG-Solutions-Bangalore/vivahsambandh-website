import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Reveal from "../../../components/motion/Reveal";
import { pagePath } from "../../../constants/navigation";
import type { AppLang } from "../../../i18n";

export default function ShareStoryCta() {
  const { t, i18n } = useTranslation();
  const lang: AppLang =
    i18n.resolvedLanguage === "hi" || i18n.language === "hi" ? "hi" : "en";

  return (
    <section className="relative overflow-hidden bg-navy-pattern py-14 sm:py-16 text-white">
      <div className="section-pad relative z-10 text-center">
        <Reveal variant="scale" className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
            <span>♥</span>
            <span>{t("storiesPage.cta.eyebrow")}</span>
            <span>♥</span>
          </div>

          <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
            {t("storiesPage.cta.title")}
          </h2>

          <p className="mt-4 text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl mx-auto">
            {t("storiesPage.cta.body")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to={pagePath("/contact", lang)}
              className="btn-gold !px-8 !py-3.5 text-sm font-bold shadow-lg"
            >
              {t("storiesPage.cta.submit")}
            </Link>
            <a
              href="#register"
              className="rounded-full border border-gold-400/60 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {t("storiesPage.cta.createProfile")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
