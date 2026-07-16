import type { Article, WithContext } from "schema-dts";

type ArticleSchemaParams = {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName: string;
};

export function articleSchema(
  params: ArticleSchemaParams
): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    description: params.description,
    image: params.image,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    url: params.url,
    author: {
      "@type": "Person",
      name: params.authorName,
    },
  };
}
