"use client";

import { useEffect, useState } from "react";

export function ClientOnly({   // render children only on client side
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);   // tracks: children ? mounted on clinet

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <>{fallback}</>;   // renders fallback

  return <>{children}</>;
}
