import { Avatar } from "@/components/avatar";
import { ToptalBadge } from "@/components/toptal-badge";
import { site } from "@/lib/site";

type AboutIdentityProps = {
  showToptalBadge?: boolean;
};

export function AboutIdentity({ showToptalBadge = false }: AboutIdentityProps) {
  return (
    <figure className="relative flex min-h-[28rem] flex-col justify-end gap-2 overflow-visible rounded-card border border-subtle bg-[linear-gradient(180deg,rgba(159,212,200,0.16),rgba(8,9,11,0.2))] p-3 pr-5.5 pb-5.5">
      <div className="relative block w-full overflow-visible [container-type:inline-size]">
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
      {showToptalBadge ? <ToptalBadge /> : null}
    </figure>
  );
}
