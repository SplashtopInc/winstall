import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";

import LoginPanel from "../components/LoginPanel";
import Toast from "../components/Toast";
import {
  AUTH_ERROR_MESSAGE,
  setAuthGateIntent,
} from "../utils/authGate";
import { setLastLoginProvider } from "../utils/lastLoginProvider";

const AuthGateContext = createContext(null);

export function useAuthGate() {
  const context = useContext(AuthGateContext);

  if (!context) {
    throw new Error("useAuthGate must be used within AuthGateProvider");
  }

  return context;
}

export function AuthGateProvider({ children }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const loginOptionsRef = useRef(null);

  useEffect(() => {
    if (session?.user?.provider) {
      setLastLoginProvider(session.user.provider);
    }
  }, [session?.user?.provider]);

  const authError =
    isOpen && router.query.error ? AUTH_ERROR_MESSAGE : null;

  const closeLogin = useCallback(() => {
    setIsOpen(false);
    loginOptionsRef.current = null;
  }, []);

  const openLogin = useCallback((options = {}) => {
    loginOptionsRef.current = options;
    setIsOpen(true);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const handleSignIn = useCallback(
    (provider) => {
      const options = loginOptionsRef.current || {};
      const {
        callbackUrl = router.asPath,
        beforeSignIn,
        resumeKey,
      } = options;

      beforeSignIn?.();

      if (resumeKey) {
        setAuthGateIntent(resumeKey);
      }

      setLastLoginProvider(provider);
      signIn(provider, { callbackUrl });
    },
    [router.asPath]
  );

  return (
    <AuthGateContext.Provider value={{ openLogin, closeLogin, showToast }}>
      {children}
      <LoginPanel
        isOpen={isOpen}
        onClose={closeLogin}
        onLogin={handleSignIn}
        authError={authError}
      />
      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </AuthGateContext.Provider>
  );
}
