import type { Thing, WithContext } from "schema-dts";

type Props = {
  schema: WithContext<Thing>;
};

export default function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
