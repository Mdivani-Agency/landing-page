import { Avatar } from "@/components/avatar";
import { ToptalBadge } from "@/components/toptal-badge";
import { site } from "@/lib/site";

export function AboutIdentity() {
  return (
    <figure className="portrait-panel">
      <div className="portrait-avatar">
        <Avatar
          src="/assets/images/giorgi.jpg"
          alt={site.personName}
          fallback={site.personName}
        />
        <ToptalBadge />
      </div>
      <figcaption className="portrait-caption">
        {site.personName}
        <br />
        {site.personRole}
      </figcaption>
    </figure>
  );
}
