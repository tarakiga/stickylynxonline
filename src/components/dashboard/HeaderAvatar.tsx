"use client";
import * as React from "react";
import { UserButton } from "@clerk/nextjs";

// Wrapper to completely bypass React 19 / Next 15+ Clerk hydration mismatch overlays
export function HeaderAvatar() {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
     setIsMounted(true);
  }, []);

  if (!isMounted) {
     return <div className="w-10 h-10 rounded-full bg-divider animate-pulse shadow-sm border-2 border-transparent" />;
  }

  return (
    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-divider shadow-sm" } }} />
  );
}
