import { Metadata } from "next";
import LoginPageClient from "./_components/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | NestCraft Living",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
