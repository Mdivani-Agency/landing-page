"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type SelectHTMLAttributes,
} from "react";
import { TextLink } from "@/components/text-link";
import { trackAdsConversionAboutUs } from "@/lib/analytics";
import {
  BUDGETS,
  PROJECT_TYPES,
  TIMELINES,
  type ContactErrors,
} from "@/lib/contact";
import { site } from "@/lib/site";

const FIELD_ORDER = [
  "name",
  "email",
  "company",
  "projectType",
  "budget",
  "timeline",
  "description",
  "link",
] as const;

type FieldName = (typeof FIELD_ORDER)[number];

const emptyValues = {
  name: "",
  email: "",
  company: "",
  projectType: "",
  budget: "",
  timeline: "",
  description: "",
  link: "",
  companyFax: "",
};

const HONEYPOT_INPUT_ID = "contact-company-fax";

const inputClass =
  "w-full rounded-card border border-subtle bg-card p-2 text-sm text-primary placeholder:text-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-secondary";

const selectClass = `${inputClass} appearance-none bg-none pr-5 [&::-ms-expand]:hidden`;

const labelClass = "text-xs uppercase tracking-caps text-secondary";

const submitClass =
  "inline-flex max-w-fit cursor-pointer items-center justify-center rounded-full border border-transparent bg-primary px-3 min-h-6 text-sm font-semibold leading-[1.2] text-canvas no-underline hover:opacity-[0.86] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-60";

function fieldId(name: FieldName) {
  return `contact-${name}`;
}

function errorId(name: FieldName) {
  return `contact-${name}-error`;
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      {" "}
      *
    </span>
  );
}

function FieldError({ name, message }: { name: FieldName; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={errorId(name)} className="text-xs text-destructive">
      {message}
    </p>
  );
}

function SelectField({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={selectClass}>
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function ContactForm() {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [pending, setPending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const focusFirstErrorRef = useRef(false);

  useEffect(() => {
    if (succeeded) {
      successRef.current?.focus();
    }
  }, [succeeded]);

  useEffect(() => {
    if (!focusFirstErrorRef.current) {
      return;
    }

    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
    }

    focusFirstErrorRef.current = false;
  }, [errors]);

  function updateField(name: keyof typeof emptyValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setPending(true);
    setErrors({});
    focusFirstErrorRef.current = false;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          company: values.company,
          projectType: values.projectType,
          budget: values.budget,
          timeline: values.timeline,
          description: values.description,
          link: values.link,
          website: values.companyFax,
        }),
      });

      let data: { ok?: boolean; errors?: ContactErrors } = {};

      try {
        data = (await response.json()) as { ok?: boolean; errors?: ContactErrors };
      } catch {
        data = {};
      }

      if (response.ok && data.ok) {
        trackAdsConversionAboutUs();
        setSucceeded(true);
        return;
      }

      if (response.status === 400 && data.errors) {
        focusFirstErrorRef.current = true;
        setErrors(data.errors);
        return;
      }

      setErrors({
        form:
          data.errors?.form ??
          "Something went wrong. Please try again or email us directly.",
      });
    } catch {
      setErrors({
        form: "Something went wrong. Please try again or email us directly.",
      });
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  if (succeeded) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-card border border-subtle bg-card p-3 text-sm leading-4 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-secondary"
      >
        Thanks — I read every inquiry and reply within 1–2 business days.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-2 md:grid-cols-2">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("name")} className={labelClass}>
            Name
            <RequiredMark />
          </label>
          <FieldError name="name" message={errors.name} />
        </div>
        <input
          id={fieldId("name")}
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? errorId("name") : undefined}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("email")} className={labelClass}>
            Email
            <RequiredMark />
          </label>
          <FieldError name="email" message={errors.email} />
        </div>
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorId("email") : undefined}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("company")} className={labelClass}>
            Company
            <RequiredMark />
          </label>
          <FieldError name="company" message={errors.company} />
        </div>
        <input
          id={fieldId("company")}
          name="company"
          type="text"
          autoComplete="organization"
          value={values.company}
          onChange={(event) => updateField("company", event.target.value)}
          aria-invalid={errors.company ? true : undefined}
          aria-describedby={errors.company ? errorId("company") : undefined}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("projectType")} className={labelClass}>
            Project type
            <RequiredMark />
          </label>
          <FieldError name="projectType" message={errors.projectType} />
        </div>
        <SelectField
          id={fieldId("projectType")}
          name="projectType"
          required
          value={values.projectType}
          onChange={(event) => updateField("projectType", event.target.value)}
          aria-invalid={errors.projectType ? true : undefined}
          aria-describedby={
            errors.projectType ? errorId("projectType") : undefined
          }
        >
          <option value="" disabled>
            Select…
          </option>
          {PROJECT_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("budget")} className={labelClass}>
            Budget range
            <RequiredMark />
          </label>
          <FieldError name="budget" message={errors.budget} />
        </div>
        <SelectField
          id={fieldId("budget")}
          name="budget"
          value={values.budget}
          onChange={(event) => updateField("budget", event.target.value)}
          aria-invalid={errors.budget ? true : undefined}
          aria-describedby={errors.budget ? errorId("budget") : undefined}
        >
          <option value="">Select…</option>
          {BUDGETS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("timeline")} className={labelClass}>
            Timeline
            <RequiredMark />
          </label>
          <FieldError name="timeline" message={errors.timeline} />
        </div>
        <SelectField
          id={fieldId("timeline")}
          name="timeline"
          required
          value={values.timeline}
          onChange={(event) => updateField("timeline", event.target.value)}
          aria-invalid={errors.timeline ? true : undefined}
          aria-describedby={errors.timeline ? errorId("timeline") : undefined}
        >
          <option value="" disabled>
            Select…
          </option>
          {TIMELINES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-0.5 md:col-span-2">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("description")} className={labelClass}>
            Project description
            <RequiredMark />
          </label>
          <FieldError name="description" message={errors.description} />
        </div>
        <textarea
          id={fieldId("description")}
          name="description"
          required
          rows={6}
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description ? errorId("description") : undefined
          }
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-0.5 md:col-span-2">
        <div className="flex items-center justify-between gap-1">
          <label htmlFor={fieldId("link")} className={labelClass}>
            Link to product/site
            <RequiredMark />
          </label>
          <FieldError name="link" message={errors.link} />
        </div>
        <input
          id={fieldId("link")}
          name="link"
          type="url"
          inputMode="url"
          placeholder="https://example.com"
          value={values.link}
          onChange={(event) => updateField("link", event.target.value)}
          aria-invalid={errors.link ? true : undefined}
          aria-describedby={errors.link ? errorId("link") : undefined}
          className={inputClass}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <input
          id={HONEYPOT_INPUT_ID}
          name="company_fax"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.companyFax}
          onChange={(event) => updateField("companyFax", event.target.value)}
        />
      </div>

      {errors.form ? (
        <p
          role="alert"
          className="text-xs text-secondary md:col-span-2"
        >
          {errors.form} You can also email{" "}
          <TextLink href={`mailto:${site.email}`}>{site.email}</TextLink>.
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button type="submit" className={submitClass} disabled={pending}>
          {pending ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
