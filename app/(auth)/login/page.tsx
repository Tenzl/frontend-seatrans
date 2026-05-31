import { Suspense } from "react";
import { Component as AnimatedLoginPage } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AnimatedLoginPage />
    </Suspense>
  );
}
