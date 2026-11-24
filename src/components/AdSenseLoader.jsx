import { useEffect } from "react";

// Auto Ads stays off until the site is approved and the publisher explicitly
// enables it with VITE_ADSENSE_ENABLED=true and a real ca-pub ID.
export default function AdSenseLoader() {
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || "";
  const enabled = import.meta.env.VITE_ADSENSE_ENABLED === "true";
  const validClientId = /^ca-pub-\d{16}$/.test(clientId);

  useEffect(() => {
    if (!enabled || !validClientId) return undefined;

    const metaName = "google-adsense-account";
    let meta = document.querySelector(`meta[name="${metaName}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = metaName;
      document.head.appendChild(meta);
    }
    meta.content = clientId;

    const scriptId = "google-adsense-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      document.head.appendChild(script);
    }

    return undefined;
  }, [clientId, enabled, validClientId]);

  return null;
}
