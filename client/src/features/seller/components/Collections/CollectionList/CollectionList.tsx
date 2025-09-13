"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  FolderOpen,
  Grid,
  List as ListIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Collection } from "@/types/global";
import {
  getMyCollections,
  deleteCollection,
  bulkDeleteCollections,
  updateCollectionVisibility,
} from "@/features/seller/services/collectionService";

interface CollectionListProps {
  onCreateNew: () => void;
  onEdit: (collection: Collection) => void;
  onView: (collection: Collection) => void;
}

export default function CollectionList({
  onCreateNew,
  onEdit,
  onView,
}: CollectionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] =
    useState<Collection | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch collections
  const {
    data: collectionsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["collections", searchTerm],
    queryFn: () => getMyCollections({ search: searchTerm, limit: 50 }),
  });

  const collections = collectionsResponse?.data?.docs || [];

  // Delete collection mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection deleted successfully");
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete collection");
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteCollections,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success(
        `${selectedCollections.length} collections deleted successfully`
      );
      setSelectedCollections([]);
      setBulkDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete collections");
    },
  });

  // Update visibility mutation
  const visibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      updateCollectionVisibility(id, isVisible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection visibility updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update visibility");
    },
  });

  // Filter collections based on search
  const filteredCollections = useMemo(() => {
    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [collections, searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCollections(filteredCollections.map((c) => c._id));
    } else {
      setSelectedCollections([]);
    }
  };

  const handleSelectCollection = (collectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedCollections((prev) => [...prev, collectionId]);
    } else {
      setSelectedCollections((prev) =>
        prev.filter((id) => id !== collectionId)
      );
    }
  };

  const handleDelete = (collection: Collection) => {
    setCollectionToDelete(collection);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (collectionToDelete) {
      deleteMutation.mutate(collectionToDelete._id);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedCollections);
  };

  const toggleVisibility = (collection: Collection) => {
    visibilityMutation.mutate({
      id: collection._id,
      isVisible: !collection.isVisible,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load collections</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["collections"] })
          }
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Organize your products into collections to make them easier for
            customers to find.
          </p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Create collection
        </Button>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedCollections.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedCollections.length})
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <ListIcon className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Collections Grid/List */}
      {filteredCollections.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No collections found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No collections match your search."
              : "Create your first collection to get started."}
          </p>
          <Button onClick={onCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Create collection
          </Button>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={
                selectedCollections.length === filteredCollections.length
              }
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedCollections.length > 0
                ? `${selectedCollections.length} selected`
                : "Select all"}
            </span>
          </div>

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredCollections.map((collection) => (
              <Card
                key={collection._id}
                className="group hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCollections.includes(collection._id)}
                        onCheckedChange={(checked) =>
                          handleSelectCollection(
                            collection._id,
                            checked as boolean
                          )
                        }
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {collection.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              collection.type === "manual"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {collection.type}
                          </Badge>
                          <Badge
                            variant={
                              collection.isVisible ? "default" : "secondary"
                            }
                          >
                            {collection.isVisible ? "Visible" : "Hidden"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(collection)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(collection)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleVisibility(collection)}
                        >
                          {collection.isVisible ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Show
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(collection)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  {collection.image && (
                    <div className="mb-3">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}

                  {collection.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{collection.productCount} products</span>
                    <span>
                      Updated{" "}
                      {new Date(collection.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collectionToDelete?.name}"? This
              action cannot be undone. Products in this collection will not be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collections</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCollections.length}{" "}
              collections? This action cannot be undone. Products in these
              collections will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
