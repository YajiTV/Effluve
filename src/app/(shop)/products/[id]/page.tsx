import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ProductDetail from "@/components/product/ProductDetail";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
