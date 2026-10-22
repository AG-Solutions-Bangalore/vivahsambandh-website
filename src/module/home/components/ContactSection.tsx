import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppLanguage } from "../../../i18n/useAppLanguage";
import type { ContactFormData } from "../types";
import Reveal, { RevealGroup } from "../../../components/motion/Reveal";
import { refreshScrollTriggers } from "../../../lib/gsap-setup";
import { img, imgSrcSet } from "../../../lib/image";
import { useCompanyDetails } from "../../company";
import {
  sanitizeName,
  sanitizeEmail,
  sanitizeDigits,
  sanitizeSafeText,
  validateName,
  validateEmail,
  validateIndianMobile,
  validateSafeText,
  handleSanitizedPaste,
} from "@/lib/validation";

export default function ContactSection() {
  const { t } = useTranslation();
  const { lang } = useAppLanguage();
  const { phone, phoneLink, email, address } = useCompanyDetails(lang);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const clearFieldError = (field: keyof ContactFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as keyof ContactFormData;
    clearFieldError(field);

    let sanitized = value;
    if (field === "name") {
      sanitized = sanitizeName(value);
    } else if (field === "email") {
      sanitized = sanitizeEmail(value);
    } else if (field === "phone") {
      sanitized = sanitizeDigits(value, 10);
    } else if (field === "message") {
      sanitized = sanitizeSafeText(value);
    }

    setFormData((prev) => ({ ...prev, [field]: sanitized }));
  };

  const handlePasteCapture =
    (field: keyof ContactFormData) =>
    (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let sanitizer = (val: string) => val;
      if (field === "name") sanitizer = sanitizeName;
      else if (field === "email") sanitizer = sanitizeEmail;
      else if (field === "phone") sanitizer = (val: string) => sanitizeDigits(val, 10);
      else if (field === "message") sanitizer = sanitizeSafeText;

      handleSanitizedPaste(e, sanitizer, (cleaned) => {
        clearFieldError(field);
        setFormData((prev) => ({ ...prev, [field]: cleaned }));
      });
    };

  // Success card swaps form height → re-measure triggers below/above.
  useEffect(() => {
    refreshScrollTriggers();
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameRes = validateName(formData.name, t("contact.name") || "Name", true, 2, 50);
    const emailRes = validateEmail(formData.email, true, t("contact.email") || "Email Address");
    const phoneRes = validateIndianMobile(formData.phone, true, t("contact.phone") || "Mobile Number");
    const messageRes = validateSafeText(formData.message, t("contact.message") || "Message", true, 10, 500);

    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    if (!nameRes.valid) newErrors.name = nameRes.error;
    if (!emailRes.valid) newErrors.email = emailRes.error;
    if (!phoneRes.valid) newErrors.phone = phoneRes.error;
    if (!messageRes.valid) newErrors.message = messageRes.error;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
    setErrors({});
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
    }, 4500);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#FFFBF2] py-16">
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <img
          src={img("/images/home/elegant-temple-wedding-banner.webp")}
          srcSet={imgSrcSet("/images/home/elegant-temple-wedding-banner-1024.webp 1024w, /images/home/elegant-temple-wedding-banner.webp 2170w")}
          sizes="100vw"
          width={2170}
          height={725}
          alt="Elegant temple wedding banner"
          title="Elegant temple wedding banner"
          loading="lazy"
          decoding="async"
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
                    aria-hidden="true"
                  >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    {t("contact.callTitle")}
                  </p>
                  <a
                    href={phoneLink}
                    title={phone}
                    className="font-display text-base font-bold text-navy-900 transition hover:text-gold-600 sm:text-lg"
                  >
                    {phone}
                  </a>
                </div>
              </div>

              {/* Email Us */}
              <div data-reveal-item className="card-ring flex items-center gap-4 bg-white/95 p-4 shadow-xs backdrop-blur transition hover:border-gold-500">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    {t("contact.emailTitle")}
                  </p>
                  <a
                    href={`mailto:${email}`}
                    title={email}
                    className="font-display text-base font-bold text-navy-900 transition hover:text-gold-600 sm:text-lg"
                  >
                    {email}
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
                    aria-hidden="true"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-400">
                    {t("contact.addressTitle")}
                  </p>
                  <p className="font-display text-sm font-bold text-navy-900 sm:text-base">
                    {address}
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
                <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Name */}
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="name"
                        maxLength={50}
                        required
                        value={formData.name}
                        onChange={handleChange}
                        onPaste={handlePasteCapture("name")}
                        aria-label={t("contact.name")}
                        aria-invalid={Boolean(errors.name)}
                        placeholder={`${t("contact.name")} *`}
                        className={`w-full rounded-xl border py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:outline-hidden focus:ring-1 ${
                          errors.name
                            ? "border-maroon-500 bg-maroon-50/30 focus:border-maroon-600 focus:ring-maroon-500/20"
                            : "border-gold-500/30 bg-cream-50/50 focus:border-gold-600 focus:bg-white focus:ring-gold-500"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p role="alert" className="mt-1 text-xs font-semibold text-maroon-600 pl-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        name="email"
                        maxLength={100}
                        required
                        value={formData.email}
                        onChange={handleChange}
                        onPaste={handlePasteCapture("email")}
                        aria-label={t("contact.email")}
                        aria-invalid={Boolean(errors.email)}
                        placeholder={`${t("contact.email")} *`}
                        className={`w-full rounded-xl border py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:outline-hidden focus:ring-1 ${
                          errors.email
                            ? "border-maroon-500 bg-maroon-50/30 focus:border-maroon-600 focus:ring-maroon-500/20"
                            : "border-gold-500/30 bg-cream-50/50 focus:border-gold-600 focus:bg-white focus:ring-gold-500"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p role="alert" className="mt-1 text-xs font-semibold text-maroon-600 pl-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-400">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                          <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                        </svg>
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        onPaste={handlePasteCapture("phone")}
                        aria-label={t("contact.phone")}
                        aria-invalid={Boolean(errors.phone)}
                        placeholder={`${t("contact.phone")} * (10 digits)`}
                        className={`w-full rounded-xl border py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:outline-hidden focus:ring-1 ${
                          errors.phone
                            ? "border-maroon-500 bg-maroon-50/30 focus:border-maroon-600 focus:ring-maroon-500/20"
                            : "border-gold-500/30 bg-cream-50/50 focus:border-gold-600 focus:bg-white focus:ring-gold-500"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p role="alert" className="mt-1 text-xs font-semibold text-maroon-600 pl-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <div className="relative">
                      <span className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-3.5 text-ink-400">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
                        </svg>
                      </span>
                      <textarea
                        name="message"
                        rows={4}
                        maxLength={500}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        onPaste={handlePasteCapture("message")}
                        aria-label={t("contact.message")}
                        aria-invalid={Boolean(errors.message)}
                        placeholder={`${t("contact.message")} * (min. 10 chars)`}
                        className={`w-full rounded-xl border py-3 pr-4 pl-11 text-sm text-navy-900 placeholder:text-ink-400 focus:outline-hidden focus:ring-1 ${
                          errors.message
                            ? "border-maroon-500 bg-maroon-50/30 focus:border-maroon-600 focus:ring-maroon-500/20"
                            : "border-gold-500/30 bg-cream-50/50 focus:border-gold-600 focus:bg-white focus:ring-gold-500"
                        }`}
                      />
                    </div>
                    {errors.message && (
                      <p role="alert" className="mt-1 text-xs font-semibold text-maroon-600 pl-1">
                        {errors.message}
                      </p>
                    )}
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
