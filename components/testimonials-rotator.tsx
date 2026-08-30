"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { LinkedInIcon } from "@/components/icons";
import type { Testimonial } from "@/lib/content";

const IDLE_MS = 5000;
const FADE_MS = 400;

type PauseReason = "hover" | "focus" | "sticky";

type TestimonialsRotatorProps = {
  testimonials: readonly Testimonial[];
};

function nextIndex(current: number, length: number) {
  if (length < 2) {
    return current;
  }

  return (current + 1 + Math.floor(Math.random() * (length - 1))) % length;
}

export function TestimonialsRotator({ testimonials }: TestimonialsRotatorProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const indexRef = useRef(index);
  const pausedRef = useRef(paused);
  const reduceMotionRef = useRef(reduceMotion);
  const fadingRef = useRef(false);
  const reasonsRef = useRef(new Set<PauseReason>());
  const cardRef = useRef<HTMLDivElement>(null);
  const clearIdleRef = useRef(() => {});
  const scheduleIdleRef = useRef(() => {});

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduceMotionRef.current = media.matches;
      setReduceMotion(media.matches);
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      return;
    }

    const onFocusIn = (event: globalThis.FocusEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".testimonial-pause")) {
        if (!reasonsRef.current.has("focus")) {
          return;
        }

        reasonsRef.current.delete("focus");
        const next = reasonsRef.current.size > 0;
        pausedRef.current = next;
        setPaused(next);

        if (!next) {
          scheduleIdleRef.current();
        }

        return;
      }

      if (reasonsRef.current.has("focus")) {
        return;
      }

      reasonsRef.current.add("focus");
      pausedRef.current = true;
      setPaused(true);
      clearIdleRef.current();
    };

    const onFocusOut = (event: globalThis.FocusEvent) => {
      if (card.contains(event.relatedTarget as Node | null)) {
        return;
      }

      if (!reasonsRef.current.has("focus")) {
        return;
      }

      reasonsRef.current.delete("focus");
      const next = reasonsRef.current.size > 0;
      pausedRef.current = next;
      setPaused(next);

      if (!next) {
        scheduleIdleRef.current();
      }
    };

    card.addEventListener("focusin", onFocusIn);
    card.addEventListener("focusout", onFocusOut);
    return () => {
      card.removeEventListener("focusin", onFocusIn);
      card.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    let idleTimer = 0;
    let fadeTimer = 0;
    let cancelled = false;

    const clearIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = 0;
    };

    const scheduleIdle = () => {
      clearIdle();
      if (
        cancelled ||
        pausedRef.current ||
        fadingRef.current ||
        testimonials.length < 2
      ) {
        return;
      }

      idleTimer = window.setTimeout(() => {
        if (cancelled || pausedRef.current || fadingRef.current) {
          return;
        }

        const upcoming = nextIndex(indexRef.current, testimonials.length);

        if (reduceMotionRef.current) {
          setIndex(upcoming);
          indexRef.current = upcoming;
          scheduleIdle();
          return;
        }

        fadingRef.current = true;
        setVisible(false);
        fadeTimer = window.setTimeout(() => {
          fadingRef.current = false;
          if (cancelled) {
            return;
          }

          setIndex(upcoming);
          indexRef.current = upcoming;
          setVisible(true);
          scheduleIdle();
        }, FADE_MS);
      }, IDLE_MS);
    };

    clearIdleRef.current = clearIdle;
    scheduleIdleRef.current = scheduleIdle;
    scheduleIdle();

    return () => {
      cancelled = true;
      clearIdle();
      window.clearTimeout(fadeTimer);
    };
  }, [testimonials.length]);

  const applyPaused = () => {
    const next = reasonsRef.current.size > 0;
    pausedRef.current = next;
    setPaused(next);

    if (next) {
      clearIdleRef.current();
      return;
    }

    scheduleIdleRef.current();
  };

  const addReason = (reason: PauseReason) => {
    if (reasonsRef.current.has(reason)) {
      return;
    }

    reasonsRef.current.add(reason);
    applyPaused();
  };

  const removeReason = (reason: PauseReason) => {
    if (!reasonsRef.current.has(reason)) {
      return;
    }

    reasonsRef.current.delete(reason);
    applyPaused();
  };

  const toggleSticky = () => {
    if (reasonsRef.current.has("sticky")) {
      reasonsRef.current.delete("sticky");
      setSticky(false);
    } else {
      reasonsRef.current.add("sticky");
      setSticky(true);
    }

    applyPaused();
  };

  const onCardPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element) || target.closest("a, button")) {
      return;
    }

    toggleSticky();
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div
      ref={cardRef}
      className="rounded-card border border-subtle bg-card p-3"
      role="region"
      aria-label="Client testimonials"
      data-paused={paused ? "true" : "false"}
      onPointerDown={onCardPointerDown}
    >
      <div
        className="grid"
        onPointerEnter={() => addReason("hover")}
        onPointerLeave={() => removeReason("hover")}
      >
        {testimonials.map((testimonial, itemIndex) => {
          const isActive = itemIndex === index;
          const isVisible = isActive && visible;
          const paragraphs = testimonial.body.split(/\n\n+/);

          return (
            <figure
              key={testimonial.author}
              className={[
                "m-0 transition-[opacity,visibility] duration-[400ms] [grid-area:1/1] motion-reduce:transition-none",
                isVisible
                  ? "visible opacity-100"
                  : "pointer-events-none invisible opacity-0",
              ].join(" ")}
              aria-hidden={!isActive}
              inert={!isActive || undefined}
            >
              <figcaption className="flex flex-col items-start mb-1">
                <p className="text-md font-semibold text-primary">
                  {testimonial.author}
                </p>
                <a
                  className="inline-flex min-h-3 min-w-3 shrink-0 items-center justify-center text-secondary no-underline hover:text-primary"
                  href={testimonial.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInIcon className="h-2 w-2 mr-0.5" />
                  <p className="text-xs text-secondary leading-none">{testimonial.title || "View LinkedIn profile"}</p>
                  <span className="sr-only">
                    {testimonial.author} on LinkedIn
                  </span>
                </a>
              </figcaption>
              <blockquote className="m-0 font-serif text-sm font-normal leading-1 text-muted [&_p+p]:mt-2">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </blockquote>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
