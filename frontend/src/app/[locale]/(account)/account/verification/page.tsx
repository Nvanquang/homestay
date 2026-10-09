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
  const t = await getTranslations({ locale, namespace: "account.verification" });

  return {
    title: `${t("title")} | UrbanNest`,
    description:
      locale === "vi"
        ? "Xác minh danh tính tài khoản để trở thành Host hoặc nâng cao hạn mức tài khoản."
        : "Verify your identity to become a host and increase account privileges.",
  };
}

export default async function AccountVerificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.verification" });

  return (
    <AccountShell
      activeTab="verification"
      title={t("title")}
      description={
        locale === "vi"
          ? "Xác minh danh tính tài khoản để trở thành Host hoặc nâng cao quyền lợi tài khoản."
          : "Verify your identity to become a host and access full platform privileges."
      }
    >
      <div className="space-y-6">
        <IdentityVerificationForm />
      </div>
    </AccountShell>
  );
}
