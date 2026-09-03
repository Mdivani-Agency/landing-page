import { Avatar } from "@/components/avatar";
import { site } from "@/lib/site";

export function AboutIdentity() {
  return (
    <figure className="flex min-h-[28rem] flex-col justify-end gap-2 rounded-card border border-subtle bg-[linear-gradient(180deg,rgba(159,212,200,0.16),rgba(8,9,11,0.2))] p-3">
      <div className="block w-full [container-type:inline-size]">
        <Avatar
          src="/assets/images/giorgi.jpg"
          alt={site.personName}
          fallback={site.personName}
        />
      </div>
      <figcaption className="text-xs text-muted">
        {site.personName}
        <br />
        {site.personRole}
      </figcaption>
    </figure>
  );
}
