import type { ImageLoaderProps } from "next/image";

const BASE = process.env.NODE_ENV === "production" ? "/projects/effluve" : "";

export default function imageLoader({ src }: ImageLoaderProps): string {
  return `${BASE}${src}`;
}
