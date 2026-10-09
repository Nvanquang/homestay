import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountShell } from "@/components/layouts";
import { IdentityVerificationForm } from "@/features/verification";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.nav" });

  return {
    title: `${t("verification")} | UrbanNest`,
    description: "Xác minh danh tính tài khoản để trở thành Host hoặc nâng cao hạn mức tài khoản.",
  };
}

export default async function AccountVerificationPage() {
  return (
    <AccountShell activeTab="verification">
      <div className="space-y-6">
        <IdentityVerificationForm />
      </div>
    </AccountShell>
  );
}
