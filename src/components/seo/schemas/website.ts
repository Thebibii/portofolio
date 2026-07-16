import type { SearchAction, WebSite, WithContext } from "schema-dts";

type WebSiteSchemaParams = {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
};

export function websiteSchema(
  params: WebSiteSchemaParams
): WithContext<WebSite> {
  const schema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: params.name,
    url: params.url,
    description: params.description,
  };

  if (params.searchUrl) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: params.searchUrl,
      },
      "query-input": "required name=search_term_string",
    } as unknown as SearchAction;
  }

  return schema;
}
