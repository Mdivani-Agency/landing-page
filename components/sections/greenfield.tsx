import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { StageList, StageListItem } from "@/components/stage-list";
import { TextLink } from "@/components/text-link";
import { BuildingIcon, LightbulbIcon, CodeIcon, PencilIcon, RocketIcon } from "lucide-react";
import { Card } from "../card";

const stages = [
  "Idea",
  "Definition",
  "Architecture",
  "Build",
  "Launch",
] as const;

const iconMap = {
  "Idea": <LightbulbIcon className="size-2.5 mr-1" />,
  "Definition": <PencilIcon className="size-2.5 mr-1" />,
  "Architecture": <BuildingIcon className="size-2.5 mr-1" />,
  "Build": <CodeIcon className="size-2.5 mr-1" />,
  "Launch": <RocketIcon className="size-2.5 mr-1" />,
} as const;

export function Greenfield() {
  return (
    <Card as="section" id="greenfield" aria-labelledby="greenfield-heading" className="flex flex-col gap-4" variant="featured">
      <SectionHeader
        eyebrow="Starting from zero"
        headingId="greenfield-heading"
        title="Starting with an idea, not a codebase?"
        copy="Most founders I work with do not have an existing team or a legacy system to wrap. The job is to go from a sharp idea to a product in production — without a large outsourced team in the middle."
      />
      <StageList className="md:grid-cols-3 lg:grid-cols-5">
        {stages.map((stage, index) => (
          <StageListItem key={stage} index={index}>
            <span className="text-sm font-medium flex items-center"><span className="size-2.5 mr-1">{iconMap[stage]}</span> {stage}</span>
          </StageListItem>
        ))}
      </StageList>
    </Card>
  );
}
