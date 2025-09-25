"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Collection } from "@/types/global";
import {
  getMyCollections,
  deleteCollection,
  updateCollectionVisibility,
} from "@/features/seller/services/collectionService";

type SortField = "name" | "type" | "productCount" | "updatedAt" | "isVisible";
type SortDirection = "asc" | "desc";

interface CollectionTableViewProps {
  onCreateNew: () => void;
  onEdit: (collection: Collection) => void;
  onView: (collection: Collection) => void;
}

export default function CollectionTableView({
  onCreateNew,
  onEdit,
  onView,
}: CollectionTableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
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
    queryKey: ["collections"],
    // Server GET /collections/my/collections does not support search/limit; we filter client-side
    queryFn: () =>
      getMyCollections({
        includeHidden: true,
        includeUnpublished: true,
      }),
  });

  const collections = collectionsResponse?.data || [];

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

  // Bulk delete mutation implemented client-side (no bulk delete API on server)
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteCollection(id)));
    },
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

  // Filter and sort collections
  const filteredAndSortedCollections = useMemo(() => {
    let filtered = collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort collections
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === "isVisible") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [collections, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCollections(filteredAndSortedCollections.map((c) => c._id));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </Button>
  );

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
      </div>

      {/* Table */}
      {filteredAndSortedCollections.length === 0 ? (
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
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <Checkbox
                      checked={
                        selectedCollections.length ===
                          filteredAndSortedCollections.length &&
                        filteredAndSortedCollections.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="w-16 px-4 py-3"></th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="name">Name</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="type">Type</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="isVisible">Status</SortButton>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortButton field="productCount">Products</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="updatedAt">Updated</SortButton>
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCollections.map((collection) => (
                  <tr
                    key={collection._id}
                    className="group hover:bg-muted/50 border-b last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedCollections.includes(collection._id)}
                        onCheckedChange={(checked) =>
                          handleSelectCollection(
                            collection._id,
                            checked as boolean
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      {collection.image?.url ? (
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                          <img
                            src={collection.image.url}
                            alt={collection.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{collection.name}</div>
                        {collection.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                            {collection.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          collection.type === "manual" ? "default" : "secondary"
                        }
                      >
                        {collection.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={collection.isVisible ? "default" : "secondary"}
                        className={
                          collection.isVisible
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : ""
                        }
                      >
                        {collection.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {collection.productCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(collection.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredAndSortedCollections.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedCollections.length} of {collections?.length}{" "}
          collections
          {selectedCollections.length > 0 && (
            <span> • {selectedCollections.length} selected</span>
          )}
        </div>
      )}
    </div>
  );
}
