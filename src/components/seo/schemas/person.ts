import type { Person, WithContext } from "schema-dts";

type PersonSchemaParams = {
  name: string;
  url: string;
  image: string;
  jobTitle?: string;
  description?: string;
  sameAs?: string[];
};

export function personSchema(params: PersonSchemaParams): WithContext<Person> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: params.name,
    url: params.url,
    image: params.image,
    jobTitle: params.jobTitle,
    description: params.description,
    sameAs: params.sameAs ?? [],
  };
}
