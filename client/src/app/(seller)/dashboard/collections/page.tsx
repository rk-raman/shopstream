"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CollectionList from "@/features/seller/components/Collections/CollectionList/CollectionList";
import CollectionForm from "@/features/seller/components/Collections/CollectionForm/CollectionForm";
import { Collection } from "@/types/global";
import { useRouter } from "next/navigation";

const queryClient = new QueryClient();

export default function CollectionsPage() {
  const router = useRouter();
  const [editing, setEditing] = useState<Collection | null>(null);

  const handleCreateNew = () => {
    router.push("/dashboard/collections/create");
  };

  const handleEdit = (collection: Collection) => {
    setEditing(collection);
  };

  const handleView = (collection: Collection) => {
    // For now, reuse edit modal in read-only mode later; navigate to handle route if needed
    setEditing(collection);
  };

  const handleSave = (_saved: Collection) => {
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-6 px-4">
        <CollectionList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />

        {editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4">
              <CollectionForm
                collection={editing}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}
