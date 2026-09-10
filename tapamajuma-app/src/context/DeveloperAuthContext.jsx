import { createContext, useContext, useState, useEffect } from "react";
import devApi from "@/lib/devAxios";

const DeveloperAuthContext = createContext(null);

export function DeveloperAuthProvider({ children }) {
  const [developer, setDeveloper] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dev_token");
    const cached = localStorage.getItem("dev_data");

    if (token) {
      if (cached) {
        try {
          setDeveloper(JSON.parse(cached));
        } catch {
          // Abaikan jika cache rusak
        }
      }

      // Validasi ulang ke /me di backend
      devApi.get("/api/developer/me")
        .then((res) => {
          setDeveloper(res.data);
          localStorage.setItem("dev_data", JSON.stringify(res.data));
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            localStorage.removeItem("dev_token");
            localStorage.removeItem("dev_data");
            setDeveloper(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await devApi.post("/api/developer/login", { email, password });
    localStorage.setItem("dev_token", res.data.access_token);
    localStorage.setItem("dev_data", JSON.stringify(res.data.developer));
    setDeveloper(res.data.developer);
    return res.data;
  };

  const logout = async () => {
    try {
      await devApi.post("/api/developer/logout");
    } finally {
      localStorage.removeItem("dev_token");
      localStorage.removeItem("dev_data");
      setDeveloper(null);
      window.location.href = "/developer/login";
    }
  };

  return (
    <DeveloperAuthContext.Provider value={{ developer, isLoading, login, logout }}>
      {children}
    </DeveloperAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDeveloperAuth = () => useContext(DeveloperAuthContext);