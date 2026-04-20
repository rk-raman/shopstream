"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  ThumbsUp,
  ChevronDown,
  Loader2,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import reviewService from "../reviewService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "react-hot-toast";

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reviewService.getProductReviews(productId, {
        page,
        limit: 5,
        sortBy,
        sortOrder: "desc",
        rating: filterRating || undefined,
      });
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        setStats(response.data.stats || null);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch {
      // Silent — reviews are supplementary
    } finally {
      setIsLoading(false);
    }
  }, [productId, page, sortBy, filterRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [sortBy, filterRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.addReview(productId, {
        rating: formRating,
        title: formTitle || undefined,
        comment: formComment || undefined,
      });
      toast.success("Review submitted!");
      setShowForm(false);
      setFormRating(0);
      setFormTitle("");
      setFormComment("");
      fetchReviews();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error("Please login to mark reviews as helpful");
      return;
    }
    try {
      const res = await reviewService.markHelpful(reviewId);
      if (res.success) {
        fetchReviews();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Ratings & Reviews
        </h2>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border rounded-lg p-6 space-y-4"
        >
          <h3 className="font-semibold text-gray-900">Rate this product</h3>

          {/* Star Input */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setFormRating(star)}
                className="p-0.5"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || formRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500 self-center">
              {formRating > 0 &&
                ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                  formRating
                ]}
            </span>
          </div>

          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Describe your experience with this product..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || formRating === 0}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              ) : null}
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg p-6">
          {/* Average */}
          <div className="text-center md:text-left flex-shrink-0">
            <div className="text-5xl font-bold text-gray-900">
              {stats.averageRating}
            </div>
            <div className="flex justify-center md:justify-start gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(stats.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const pct =
                stats.totalReviews > 0
                  ? (count / stats.totalReviews) * 100
                  : 0;
              return (
                <button
                  key={star}
                  onClick={() =>
                    setFilterRating(filterRating === star ? null : star)
                  }
                  className={`flex items-center gap-2 w-full group ${
                    filterRating === star ? "opacity-100" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {star}
                  </span>
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        filterRating === star ? "bg-blue-500" : "bg-yellow-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort + Filter Bar */}
      {stats && stats.totalReviews > 0 && (
        <div className="flex items-center gap-4 text-sm">
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
            >
              {filterRating} star only
              <span className="text-blue-500">&times;</span>
            </button>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="ml-auto px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            <option value="createdAt">Most Recent</option>
            <option value="helpfulCount">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filterRating
              ? `No ${filterRating}-star reviews yet`
              : "No reviews yet. Be the first to review!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-100 pb-6 last:border-0"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Title */}
              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-1">
                  {review.title}
                </h4>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
              )}

              {/* Author + Helpful */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {review.user?.firstName} {review.user?.lastName}
                </span>

                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful{" "}
                  {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                </button>
              </div>

              {/* Seller Reply */}
              {review.sellerReply?.comment && (
                <div className="mt-3 ml-6 bg-blue-50 border-l-2 border-blue-300 p-3 rounded-r-lg">
                  <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mb-1">
                    <MessageSquare className="w-3 h-3" />
                    Seller Response
                  </div>
                  <p className="text-sm text-gray-700">
                    {review.sellerReply.comment}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.sellerReply.repliedAt)}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
