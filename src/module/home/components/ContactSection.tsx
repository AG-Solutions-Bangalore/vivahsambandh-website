import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  COMPANY,
  getCompanyAddress,
  getCompanyHours,
} from "../../../constants/company";
import { useAppLanguage } from "../../../i18n/useAppLanguage";
import type { ContactFormData } from "../types";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import { refreshScrollTriggers } from "../../../lib/gsap-setup";

export default function ContactSection() {
  const { t } = useTranslation();
  const { lang } = useAppLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Success card swaps form height → re-measure triggers below/above.
  useEffect(() => {
    refreshScrollTriggers();
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
    }, 4500);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#FFFBF2] py-16">
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <img
          src="/images/home/elegant-temple-wedding-banner.webp"
          alt=""
          className="h-auto w-full"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[#FFFBF2]/25" />

      <div className="section-pad relative z-10">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Direct Contacts */}
          <Reveal variant="left" className="lg:col-span-5">
            <div className="eyebrow">
              <span className="text-gold-500">✦</span>
              <span>{t("contact.eyebrow")}</span>
            </div>

            <h2 className="font-display mt-4 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
              {t("contact.title")}
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">
              {t("contact.subtitle")}
            </p>

            {/* 3 Contact Info Cards */}
            <RevealGroup className="mt-8 space-y-4" stagger={0.1}>
              {/* Call Us */}
              <div data-reveal-item className="card-ring flex items-center gap-4 bg-white/95 p-4 shadow-xs backdrop-blur transition hover:border-gold-500">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                  >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    {t("contact.callTitle")}
                  </p>
                  <a
                    href={COMPANY.supportPhoneLink}
                    className="font-display text-base font-bold text-navy-900 transition hover:text-gold-600 sm:text-lg"
                  >
                    {COMPANY.supportPhoneDisplay}
                  </a>
                  <p className="text-xs text-ink-500">
                    {getCompanyHours(lang)}
                  </p>
                </div>
              </div>

              {/* Email Us */}
              <div data-reveal-item className="card-ring flex items-center gap-4 bg-white/95 p-4 shadow-xs backdrop-blur transition hover:border-gold-500">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    {t("contact.emailTitle")}
                  </p>
                  <a
                    href={`mailto:${COMPANY.supportEmail}`}
                    className="font-display text-base font-bold text-navy-900 transition hover:text-gold-600 sm:text-lg"
                  >
                    {COMPANY.supportEmail}
                  </a>
                  <p className="text-xs text-ink-500">
                    {t("contact.emailNote")}
                  </p>
                </div>
              </div>

              {/* Our Address */}
              <div data-reveal-item className="card-ring flex items-center gap-4 bg-white/95 p-4 shadow-xs backdrop-blur transition hover:border-gold-500">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    {t("contact.addressTitle")}
                  </p>
                  <p className="font-display text-sm font-bold text-navy-900 sm:text-base">
                    {getCompanyAddress(lang)}
                  </p>
                </div>
              </div>
            </RevealGroup>
          </Reveal>

          {/* Right Column: Contact Form */}
          <Reveal variant="right" delay={0.1} className="lg:col-span-7">
            <div className="card-ring bg-white p-6 shadow-lift sm:p-8 lg:p-10">
              <h3 className="font-display text-2xl font-bold text-navy-900">
                {t("contact.formTitle")}
              </h3>
              <p className="mt-1 text-xs text-ink-500 sm:text-sm">
                {t("contact.formSubtitle")}
              </p>

              {submitted ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-50 p-6 text-center text-emerald-900">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xl font-bold">
                    ✓
                  </div>
                  <p className="mt-3 font-display text-lg font-bold">
                    {lang === "hi"
                      ? "धन्यवाद! संदेश प्राप्त हुआ।"
                      : "Thank You! Message Received."}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    {lang === "hi"
                      ? "हमारी टीम जल्द ही आपसे संपर्क करेगी।"
                      : "Our representative will get in touch with you shortly."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Name */}
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={`${t("contact.name")} *`}
                      className="w-full rounded-xl border border-gold-500/30 bg-cream-50/50 py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:border-gold-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={`${t("contact.email")} *`}
                      className="w-full rounded-xl border border-gold-500/30 bg-cream-50/50 py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:border-gold-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={`${t("contact.phone")} *`}
                      className="w-full rounded-xl border border-gold-500/30 bg-cream-50/50 py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:border-gold-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <span className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-3.5 text-ink-400">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                      </svg>
                    </span>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={`${t("contact.message")} *`}
                      className="w-full rounded-xl border border-gold-500/30 bg-cream-50/50 py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:border-gold-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-gold-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-primary w-full !py-3.5 text-base"
                  >
                    <span>{t("contact.send")}</span>
                    <span className="text-gold-300" aria-hidden="true">
                      →
                    </span>
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
