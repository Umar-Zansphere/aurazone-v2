"use client";

import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

// Redirect to parent store page — attributes are now managed in the tabbed layout
export default function AttributeTemplatesPage() {
  const params = useParams();
  redirect(`/stores/${params.storeId}`);
}
