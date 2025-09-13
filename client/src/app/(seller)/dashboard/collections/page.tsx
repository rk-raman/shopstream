"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Collection } from "@/types/global";
import CollectionList from "@/features/seller/components/Collections/CollectionList/CollectionList";
import CollectionForm from "@/features/seller/components/Collections/CollectionForm/CollectionForm";

type ViewMode = "list" | "create" | "edit" | "view";

const queryClient = new QueryClient();

export default function CollectionsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const handleCreateNew = () => {
    setSelectedCollection(null);
    setViewMode("create");
  };

  const handleEdit = (collection: Collection) => {
    setSelectedCollection(collection);
    setViewMode("edit");
  };

  const handleView = (collection: Collection) => {
    setSelectedCollection(collection);
    setViewMode("view");
  };

  const handleSave = (collection: Collection) => {
    setViewMode("list");
    setSelectedCollection(null);
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedCollection(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "create":
        return <CollectionForm onSave={handleSave} onCancel={handleCancel} />;
      case "edit":
        return (
          <CollectionForm
            collection={selectedCollection!}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        );
      case "view":
        return (
          <CollectionView
            collection={selectedCollection!}
            onEdit={() => handleEdit(selectedCollection!)}
            onBack={handleCancel}
          />
        );
      default:
        return (
          <CollectionList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onView={handleView}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-6 px-4">{renderContent()}</div>
    </QueryClientProvider>
  );
}

// Collection View Component
interface CollectionViewProps {
  collection: Collection;
  onEdit: () => void;
  onBack: () => void;
}

function CollectionView({ collection, onEdit, onBack }: CollectionViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to collections
          </button>
          <div>
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            <p className="text-muted-foreground">
              {collection.productCount} products • {collection.type} collection
            </p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Edit collection
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {collection.image && (
            <div>
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {collection.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{collection.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-4">
              Products in this collection
            </h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>Product list will be displayed here</p>
              <p className="text-sm">
                This feature will be implemented in the next update
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-3">Collection details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{collection.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility:</span>
                <span>{collection.isVisible ? "Visible" : "Hidden"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sort order:</span>
                <span className="capitalize">
                  {collection.sortOrder.replace("-", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Handle:</span>
                <span className="font-mono text-xs">{collection.handle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {new Date(collection.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>
                  {new Date(collection.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {(collection.seoTitle || collection.seoDescription) && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium mb-3">SEO</h3>
              <div className="space-y-2 text-sm">
                {collection.seoTitle && (
                  <div>
                    <span className="text-muted-foreground block">Title:</span>
                    <span>{collection.seoTitle}</span>
                  </div>
                )}
                {collection.seoDescription && (
                  <div>
                    <span className="text-muted-foreground block">
                      Description:
                    </span>
                    <span>{collection.seoDescription}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
