import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function useDebugAuth() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("🔍 Debug Auth Check:", {
          isLoaded,
          isSignedIn,
          userId,
          hasGetToken: !!getToken,
        });

        if (isLoaded && isSignedIn && getToken) {
          const token = await getToken();
          console.log("🎫 Token retrieved:", {
            hasToken: !!token,
            tokenLength: token?.length,
            tokenStart: token?.substring(0, 20) + "...",
          });

          setDebugInfo({
            isLoaded,
            isSignedIn,
            userId,
            hasToken: !!token,
            tokenLength: token?.length,
          });
        } else {
          setDebugInfo({
            isLoaded,
            isSignedIn,
            userId,
            hasToken: false,
            error: "Not authenticated",
          });
        }
      } catch (error) {
        console.error("❌ Auth debug error:", error);
        setDebugInfo({
          error: error.message,
        });
      }
    };

    if (isLoaded) {
      checkAuth();
    }
  }, [isLoaded, isSignedIn, getToken, userId]);

  return debugInfo;
}
