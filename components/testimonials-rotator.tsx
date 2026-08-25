"use client";

import { useEffect, useState, type FocusEvent } from "react";
import { LinkedInMark } from "@/components/linkedin-mark";
import type { Testimonial } from "@/lib/content";

const IDLE_MS = 5000;
const FADE_MS = 400;

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
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduceMotion(media.matches);
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || testimonials.length < 2 || !visible) {
      return;
    }

    const idleTimer = window.setTimeout(() => {
      if (reduceMotion) {
        setIndex((current) => nextIndex(current, testimonials.length));
        return;
      }

      setVisible(false);
    }, IDLE_MS);

    return () => window.clearTimeout(idleTimer);
  }, [index, paused, reduceMotion, testimonials.length, visible]);

  useEffect(() => {
    if (visible) {
      return;
    }

    const fadeTimer = window.setTimeout(() => {
      setIndex((current) => nextIndex(current, testimonials.length));
      setVisible(true);
    }, reduceMotion ? 0 : FADE_MS);

    return () => window.clearTimeout(fadeTimer);
  }, [reduceMotion, testimonials.length, visible]);

  if (testimonials.length === 0) {
    return null;
  }

  const pause = () => {
    setPaused(true);
  };

  const resumeIfLeaving = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPaused(false);
    }
  };

  return (
    <div
      className="testimonial-card"
      tabIndex={0}
      onMouseEnter={pause}
      onMouseLeave={() => setPaused(false)}
      onFocus={pause}
      onBlur={resumeIfLeaving}
    >
      <div className="testimonial-stack">
        {testimonials.map((testimonial, itemIndex) => {
          const isActive = itemIndex === index;
          const isVisible = isActive && visible;
          const paragraphs = testimonial.body.split(/\n\n+/);

          return (
            <figure
              key={testimonial.author}
              className={["testimonial-quote", isVisible ? "is-visible" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-hidden={!isActive}
              inert={!isActive || undefined}
            >
              <blockquote>
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </blockquote>
              <figcaption className="testimonial-caption">
                <div className="testimonial-byline">
                  <p className="testimonial-author">{testimonial.author}</p>
                  {testimonial.title ? (
                    <p className="testimonial-role">{testimonial.title}</p>
                  ) : null}
                </div>
                <a
                  className="testimonial-linkedin"
                  href={testimonial.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkedInMark className="testimonial-linkedin-icon" />
                  <span className="sr-only">
                    {testimonial.author} on LinkedIn
                  </span>
                </a>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
