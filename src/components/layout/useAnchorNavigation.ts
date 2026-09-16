"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type ScrollIntent = {
  href: string;
  targetId: string | null;
};

const targets = new Set([
  "getting-started",
  "booking-preview",
  "teacher-classes",
  "teacher-sessions",
  "available-sessions",
]);

// Carry an explicit click across the old header's unmount and the new mount.
// This contains only a URL, never account or booking data.
let requestedIntent: ScrollIntent | null = null;

function getIntent(url: URL, allowOverview: boolean): ScrollIntent | null {
  const fragments = url.hash.slice(1).split("#");
  const targetId = fragments[fragments.length - 1];
  // Recover an old malformed URL only when every fragment is one of our IDs.
  if (targetId && fragments.every((fragment) => targets.has(fragment))) {
    const cleanUrl = new URL(url.href);
    cleanUrl.hash = targetId;
    return { href: cleanUrl.href, targetId };
  }
  if (
    allowOverview &&
    !url.hash &&
    !url.search &&
    (url.pathname === "/teacher" || url.pathname === "/student")
  ) {
    return { href: url.href, targetId: null };
  }
  return null;
}

export default function useAnchorNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let frame = 0;
    let running = false;

    const stopFrames = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const cancel = () => {
      stopFrames();
      requestedIntent = null;
    };

    const start = (intent: ScrollIntent | null) => {
      stopFrames();
      requestedIntent = intent;
      if (!intent) return;
      running = true;
      const deadline = performance.now() + 30000;
      let previousTop: number | null = null;
      let stableFrames = 0;

      const attempt = () => {
        if (!running || requestedIntent !== intent) return;
        if (performance.now() > deadline) {
          cancel();
          return;
        }
        // Keep checking even if the router changes the URL without a DOM mutation.
        frame = requestAnimationFrame(attempt);
        const destination = new URL(intent.href);
        if (
          window.location.pathname !== destination.pathname ||
          window.location.search !== destination.search
        ) {
          stableFrames = 0;
          previousTop = null;
          return;
        }

        const route = destination.pathname;
        const targetId =
          intent.targetId ??
          (route === "/teacher" ? "teacher-sessions" : "available-sessions");
        const target = document.getElementById(targetId);
        if (!target || !target.isConnected) return;

        // The class list sits above sessions and changes height after loading.
        if (
          intent.targetId &&
          route === "/teacher" &&
          document.querySelector('[data-navigation-loading="true"]')
        ) {
          stableFrames = 0;
          previousTop = null;
          return;
        }

        const header = document.querySelector("[data-app-header]");
        const offset = (header?.getBoundingClientRect().height ?? 88) + 20;
        const top = intent.targetId
          ? Math.max(
              0,
              target.getBoundingClientRect().top + window.scrollY - offset,
            )
          : 0;
        stableFrames =
          previousTop !== null && Math.abs(top - previousTop) < 1
            ? stableFrames + 1
            : 0;
        previousTop = top;
        if (stableFrames < 3) return;

        // Assign the entire destination, never append a hash to the old URL.
        // Cross-page routing above deliberately receives no hash.
        if (window.location.href !== intent.href) {
          window.history.replaceState(null, "", intent.href);
        }
        window.scrollTo({ top, behavior: "instant" });
        window.dispatchEvent(new Event("booking:navigation"));
        cancel();
      };
      frame = requestAnimationFrame(attempt);
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const element = event.target instanceof Element ? event.target : null;
      const link = element?.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        (link.target && link.target !== "_self") ||
        link.hasAttribute("download")
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const intent = getIntent(url, true);
      if (!intent) {
        cancel();
        return;
      }
      if (event.defaultPrevented) return;
      // Own this navigation. Next Link respects preventDefault, so two handlers
      // cannot independently update the fragment for this same click.
      event.preventDefault();
      const destination = new URL(intent.href);
      const samePage =
        window.location.pathname === destination.pathname &&
        window.location.search === destination.search;
      start(intent);
      if (samePage) {
        if (window.location.href !== intent.href) {
          window.history.pushState(null, "", intent.href);
        }
        window.dispatchEvent(new Event("booking:navigation"));
      } else {
        router.push(destination.pathname + destination.search, {
          scroll: false,
        });
      }
    };

    const onHistory = () => {
      // Let normal browser restoration handle Back/Forward without an anchor.
      start(getIntent(new URL(window.location.href), false));
      window.dispatchEvent(new Event("booking:navigation"));
    };
    const onHashChange = () => {
      start(
        requestedIntent?.href === window.location.href
          ? requestedIntent
          : getIntent(new URL(window.location.href), false),
      );
    };
    const onKey = (event: KeyboardEvent) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        cancel();
    };

    start(requestedIntent ?? getIntent(new URL(window.location.href), false));
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHistory);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      // Preserve the click intent when the next page mounts its header.
      stopFrames();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", onKey);
    };
  }, [pathname, router]);
}
