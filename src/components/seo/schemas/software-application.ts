import type { SoftwareApplication, WithContext } from "schema-dts";

type SoftwareApplicationSchemaParams = {
  name: string;
  description?: string;
  url: string;
  image?: string;
  operatingSystem?: string;
  applicationCategory?: string;
};

export function softwareApplicationSchema(
  params: SoftwareApplicationSchemaParams
): WithContext<SoftwareApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: params.name,
    description: params.description,
    url: params.url,
    image: params.image,
    operatingSystem: params.operatingSystem,
    applicationCategory: params.applicationCategory,
  };
}
