"use client";

import { redirect } from "next/navigation";
import { useParams } from "next/navigation";

// Redirect to parent store page — categories are now managed in the tabbed layout
export default function CategoriesPage() {
  const params = useParams();
  redirect(`/stores/${params.storeId}`);
}
