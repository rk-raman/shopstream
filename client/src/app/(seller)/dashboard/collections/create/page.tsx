"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import CollectionForm from "@/features/seller/components/Collections/CollectionForm/CollectionForm";
import { Collection } from "@/types/global";

const queryClient = new QueryClient();

export default function CreateCollectionPage() {
  const router = useRouter();

  const handleSave = (collection: Collection) => {
    router.push("/dashboard/collections");
  };

  const handleCancel = () => {
    router.push("/dashboard/collections");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-6 px-4">
        <CollectionForm onSave={handleSave} onCancel={handleCancel} />
      </div>
    </QueryClientProvider>
  );
}
