import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const user = session?.user;
  const role = user?.role;

  return {
    user,
    role,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: role === "ADMIN",
    isClient: role === "CLIENT",
    isEngineer: role === "ENGINEER",
  };
};