import type { Tour } from "@/lib/tours-data";

export function TourJsonLd({ tours, origin }: { tours: Tour[]; origin: string }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": tours.map((t) => ({
      "@type": "Product",
      name: t.title,
      description: t.description,
      image: origin ? `${origin}${t.image}` : t.image,
      url: `${origin}/?tour=${t.id}`,
      brand: { "@type": "Brand", name: "Экскурсии по СПб" },
      offers: {
        "@type": "Offer",
        price: t.price,
        priceCurrency: "RUB",
        availability: "https://schema.org/InStock",
        url: `${origin}/?tour=${t.id}`,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}