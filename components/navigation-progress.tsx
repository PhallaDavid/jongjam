"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function NavigationProgress() {
  return (
    <ProgressBar
      height="3px"
      color="linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
