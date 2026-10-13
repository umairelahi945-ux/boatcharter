import { createFileRoute, notFound } from "@tanstack/react-router";

import { NavigationCategoryPage } from "@/components/navigation-landing-page";
import { NAVIGATION_SECTIONS, getCategory, navigationMetadata } from "@/lib/navigation-content";

export const Route = createFileRoute("/$section/$category")({
  head: ({ params }) => {
    const section = NAVIGATION_SECTIONS[params.section];
    const category = getCategory(params.section, params.category);
    return section && category
      ? navigationMetadata(section, category, `/${params.section}/${params.category}`)
      : { meta: [{ title: "Page not found | Boat Charter" }] };
  },
  beforeLoad: ({ params }) => {
    if (!getCategory(params.section, params.category)) {
      throw notFound();
    }
    return undefined as never;
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { section, category } = Route.useParams();
  return <NavigationCategoryPage sectionSlug={section} categorySlug={category} />;
}
