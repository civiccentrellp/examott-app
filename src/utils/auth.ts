// utils/auth.ts

export async function signup(userData: {
    name: string;
    email: string;
    password: string;
    mobile: string;
  }) {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Signup failed");
      }
  
      const data = await res.json();
      localStorage.setItem("token", data.token);
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }
  
  export async function signin(credentials: {
    email: string;
    password: string;
  }) {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
  
      const data = await res.json();
      localStorage.setItem("token", data.token);
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
  
  export function logout() {
    localStorage.removeItem("token");
  }
  