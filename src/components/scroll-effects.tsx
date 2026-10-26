import { useEffect } from "react";

const revealSelector = "main section, main article, main figure, main [data-scroll-reveal-card]";

export function ScrollEffects() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-scroll-revealed", "visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    const prepare = (root: ParentNode) => {
      const elements = [
        ...(root instanceof HTMLElement && root.matches(revealSelector) ? [root] : []),
        ...root.querySelectorAll<HTMLElement>(revealSelector),
      ];

      for (const element of elements) {
        if (element.hasAttribute("data-scroll-revealed")) continue;

        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight && bounds.bottom > 0) {
          element.setAttribute("data-scroll-revealed", "visible");
        } else {
          element.setAttribute("data-scroll-revealed", "pending");
          observer.observe(element);
        }
      }
    };

    prepare(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) prepare(node);
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
