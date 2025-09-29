import { useEffect } from "react";

export function useBodyClass() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const bodyClass = "servigenman-login";
    const htmlClass = "servigenman-login-root";

    document.body.classList.add(bodyClass);
    document.documentElement.classList.add(htmlClass);

    return () => {
      document.body.classList.remove(bodyClass);
      document.documentElement.classList.remove(htmlClass);
    };
  }, []);
}
