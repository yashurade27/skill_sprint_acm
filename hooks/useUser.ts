import { useSession } from "next-auth/react";
import { ExtendedUser } from "@/lib/types";

interface UseUserReturn {
  user: ExtendedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
}

export function useUser(): UseUserReturn {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const isLoading = status === "loading";
  const isAuthenticated = !!session;
  const isAdmin = user?.role === "admin";
  const isEmailVerified = user?.email_verified === true;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isEmailVerified,
  };
}