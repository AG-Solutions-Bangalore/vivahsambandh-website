/**
 * @file src/components/CompanyLogo.tsx
 * Brand logo resolved from the `getCompany` API (`company_logo` joined with
 * the `Company` image base). Falls back to the bundled lotus mark while the
 * query is pending or when the CRM has no logo uploaded.
 */

import { useCompanyDetails } from "../module/company";

interface CompanyLogoProps {
  className?: string;
  fallbackClassName?: string;
}

export default function CompanyLogo({
  className = "h-8 w-auto",
}: CompanyLogoProps) {
  const { logoUrl, name } = useCompanyDetails();

  return (
    <img
      src={logoUrl}
      alt={name}
      width={480}
      height={232}
      decoding="async"
      className={className}
    />
  );
}
