import { ToptalBadge } from "@/components/toptal-badge";
import { site } from "@/lib/site";

export function AboutIdentity() {
  return (
    <div className="about-identity">
      <div className="portrait-panel" aria-hidden="true">
        <span className="portrait-mark">GM</span>
        <span className="portrait-caption">
          {site.personName}
          <br />
          {site.personRole}
        </span>
      </div>
      <ToptalBadge />
    </div>
  );
}
