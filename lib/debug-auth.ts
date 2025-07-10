// Test script to debug authentication
console.log("=== Testing Clerk Authentication ===");

// Check if running on client side
if (typeof window !== "undefined") {
  console.log("Running on client side");
  
  // Check if Clerk is available
  if ((window as any).Clerk) {
    console.log("Clerk is available");
    
    // Check if there's a session
    if ((window as any).Clerk.session) {
      console.log("Session exists");
      
      // Try to get token
      if (typeof (window as any).Clerk.session.getToken === "function") {
        console.log("getToken method exists");
        
        (window as any).Clerk.session.getToken()
          .then((token: string) => {
            console.log("Token retrieved:", token ? "YES" : "NO");
            if (token) {
              console.log("Token starts with:", token.substring(0, 10));
            }
          })
          .catch((error: any) => {
            console.error("Error getting token:", error);
          });
      } else {
        console.log("getToken method not available");
      }
    } else {
      console.log("No session available");
    }
  } else {
    console.log("Clerk not available");
  }
} else {
  console.log("Running on server side");
}

export {};
