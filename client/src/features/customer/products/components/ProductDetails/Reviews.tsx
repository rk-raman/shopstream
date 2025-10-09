export default function Reviews({
  reviews,
}: {
  reviews: Array<{
    id: number;
    author: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
  }>;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900">{review.author}</h4>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{review.date}</span>
            </div>
            <h5 className="font-semibold text-gray-900 mb-1">{review.title}</h5>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
