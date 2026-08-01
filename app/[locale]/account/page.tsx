import { Metadata } from "next";
import AccountPageClient from "./_components/AccountPageClient";

export const metadata: Metadata = {
  title: "My Account | NestCraft Living",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountPageClient />;
}
