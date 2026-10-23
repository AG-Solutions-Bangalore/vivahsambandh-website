/**
 * @file src/components/CompanyLogo.tsx
 * Brand logo resolved from the `getCompany` API (`company_logo` joined with
 * the `Company` image base). The uploaded image is rendered at its natural
 * aspect ratio with `object-contain`, so it is never stretched or cropped.
 * Falls back to the bundled lotus mark while the query is pending or when the
 * CRM has no logo uploaded.
 */

import { cn } from "cn";
import { useCompanyDetails } from "../module/company";
import LotusMark from "./LotusMark";

interface CompanyLogoProps {
  className?: string;
  fallbackClassName?: string;
}

export default function CompanyLogo({
  className = "h-8 w-auto",
  fallbackClassName = "h-8 w-8 text-gold-400",
}: CompanyLogoProps) {
  const { logoUrl, name } = useCompanyDetails();

  if (!logoUrl) {
    return <LotusMark className={fallbackClassName} />;
  }

  return (
    <img
      src={logoUrl}
      alt={name}
      decoding="async"
      className={cn("object-contain", className)}
    />
  );
}
