import { useCallback, useEffect, useState } from "react";
import api, { TOKEN_KEY } from "../api";
import { getUserIdFromToken } from "../utils/token";
import { AuthContext } from "./auth-context";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  });

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    const data = await api.get("/user/profile");
    return { ...data.user, id: getUserIdFromToken(token) };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      return;
    }

    let cancelled = false;
    fetchUser()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchUser]);

  const login = async (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setLoading(true);
    try {
      const profile = await fetchUser();
      setUser(profile);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    const profile = await fetchUser();
    setUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
