"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "../../lib/auth";

export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Users</h1>
      <p className="text-muted-foreground">
        Manage your users and their permissions here.
      </p>
    </div>
  );
} 