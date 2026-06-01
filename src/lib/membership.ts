import type { MembershipLimitValue } from "@/lib/types";

export function formatMembershipLimit(value: MembershipLimitValue): string {
  return value === "unlimited" ? "∞" : value.toLocaleString();
}

export function formatMembershipLimitLabel(
  value: MembershipLimitValue,
  unlimitedLabel: string,
): string {
  return value === "unlimited" ? unlimitedLabel : value.toLocaleString();
}

export function formatIdr(amount: number | null): string | null {
  if (amount == null) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}
