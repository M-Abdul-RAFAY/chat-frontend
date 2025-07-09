// components/WidgetWrapper.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import your widget component with SSR disabled
const Widget = dynamic(() => import("./Widget"), { ssr: false });

export default function WidgetWrapper() {
  return <Widget />;
}
