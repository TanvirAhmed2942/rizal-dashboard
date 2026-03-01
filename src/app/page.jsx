"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page on mount
    router.push("/auth/login");
  }, [router]);

  return null;
}

export default Page;
