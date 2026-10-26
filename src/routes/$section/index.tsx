import { createFileRoute, notFound } from "@tanstack/react-router";

import { NavigationLandingPage } from "@/components/navigation-landing-page";
import { NAVIGATION_SECTIONS, navigationMetadata } from "@/lib/navigation-content";

export const Route = createFileRoute("/$section/")({
  head: ({ params }) => {
    const section = NAVIGATION_SECTIONS[params.section];
    return section
      ? navigationMetadata(section, undefined, `/${params.section}`)
      : { meta: [{ title: "Page not found | Boat Charter" }] };
  },
  beforeLoad: ({ params }) => {
    if (!NAVIGATION_SECTIONS[params.section]) {
      throw notFound();
    }
    return undefined as never;
  },
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  return <NavigationLandingPage sectionSlug={section} />;
}
