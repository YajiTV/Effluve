import { PrismaClient, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany({});

  const products = [
    // --- HOMME (img1, img2, img3) ---
    {
      name: "Veste en laine mérinos",
      description:
        "Veste structurée en laine mérinos extra-fine. Coupe ajustée, idéale pour les occasions formelles comme casual.",
      priceCents: 18900,
      imageUrl: "/images/img1.png",
      category: ProductCategory.homme,
    },
    {
      name: "Manteau oversize camel",
      description:
        "Grand manteau oversize en cachemire mélangé, couleur camel. Chaleureux et élégant pour l'hiver.",
      priceCents: 29500,
      imageUrl: "/images/img2.png",
      category: ProductCategory.homme,
    },
    {
      name: "Pull col roulé en angora",
      description:
        "Pull col roulé en mélange angora et laine. Douceur incomparable, disponible en coloris neutres.",
      priceCents: 12400,
      imageUrl: "/images/img3.png",
      category: ProductCategory.homme,
    },

    // --- FEMME (img4, img5, img6, img7) ---
    {
      name: "Robe midi en soie naturelle",
      description:
        "Robe mi-longue en soie naturelle avec tombé délicat. Motif discret, parfaite pour toutes les saisons.",
      priceCents: 22500,
      imageUrl: "/images/img4.png",
      category: ProductCategory.femme,
    },
    {
      name: "Cardigan en cachemire",
      description:
        "Cardigan long en cachemire pur, coupe fluide et douce. Le luxe du quotidien.",
      priceCents: 16800,
      imageUrl: "/images/img5.png",
      category: ProductCategory.femme,
    },
    {
      name: "Blazer en tweed écossais",
      description:
        "Blazer tailleur en tweed écossais multicolore. Coupe structurée et élégante pour un look affirmé.",
      priceCents: 24900,
      imageUrl: "/images/img6.png",
      category: ProductCategory.femme,
    },
    {
      name: "Top en dentelle rebrodée",
      description:
        "Top à manches longues en dentelle rebrodée à la main. Pièce délicate et raffinée.",
      priceCents: 9800,
      imageUrl: "/images/img7.png",
      category: ProductCategory.femme,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✓ ${products.length} produits insérés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
