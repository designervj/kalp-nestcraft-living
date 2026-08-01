import { Metadata } from "next";
import SignupPageClient from "./_components/SignupPageClient";

export const metadata: Metadata = {
  title: "Create Account | NestCraft Living",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <SignupPageClient />;
}
