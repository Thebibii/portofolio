import type { BreadcrumbList, WithContext } from "schema-dts";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type BreadcrumbSchemaParams = {
  items: BreadcrumbItem[];
};

export function breadcrumbSchema(
  params: BreadcrumbSchemaParams
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: params.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
