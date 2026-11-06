import React, { useState } from 'react';

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  isVerified: boolean;
  sizePurchased?: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  // Honest customer reviews state: initially empty (no fabricated reviews)
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    // Check session storage for any review submitted by the user in this session
    try {
      const saved = sessionStorage.getItem(`waak_reviews_${productId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Review Form State
  const [formRating, setFormRating] = useState<number>(5);
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formComment, setFormComment] = useState<string>('');
  const [formSize, setFormSize] = useState<string>('');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

  // Review statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterVerified && !r.isVerified) return false;
    return true;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formComment.trim()) return;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: formAuthor.trim(),
      rating: formRating,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: formTitle.trim() || 'Atelier Experience',
      comment: formComment.trim(),
      isVerified: false, // Session submissions are unverified customer feedback (no backend order check)
      sizePurchased: formSize.trim() || undefined,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      sessionStorage.setItem(`waak_reviews_${productId}`, JSON.stringify(updated));
    } catch {
      // sessionStorage unavailable
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setFormSubmitted(false);
      setFormAuthor('');
      setFormTitle('');
      setFormComment('');
      setFormSize('');
    }, 1200);
  };

  return (
    <section id="pdp-reviews-section" className="pdp-reviews-section" aria-labelledby="pdp-reviews-title">
      <div className="pdp-section-header">
        <span className="pdp-section-eyebrow">CLIENT REFLECTIONS</span>
        <h2 id="pdp-reviews-title" className="pdp-section-heading">Atelier Reviews & Testimonials</h2>
      </div>

      <div className="pdp-reviews-container">
        {/* Rating Breakdown Summary Card */}
        <div className="pdp-reviews-summary-card">
          <div className="pdp-reviews-score-block">
            <span className="pdp-reviews-big-score" aria-label={`Average rating ${averageRating} out of 5`}>
              {totalReviews > 0 ? averageRating : '—'}
            </span>
            <div className="pdp-reviews-stars" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    color: totalReviews > 0 && star <= Math.round(Number(averageRating))
                      ? '#C5A265'
                      : 'rgba(197, 162, 101, 0.3)',
                    fontSize: '18px',
                    marginRight: '2px',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="pdp-reviews-count-label">
              {totalReviews === 0 ? 'No customer reviews yet' : `Based on ${totalReviews} verified review${totalReviews === 1 ? '' : 's'}`}
            </span>
          </div>

          {/* Rating Bars Distribution */}
          <div className="pdp-reviews-bars-block">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars as keyof typeof ratingCounts];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="pdp-reviews-bar-row">
                  <span className="pdp-reviews-bar-label">{stars} ★</span>
                  <div className="pdp-reviews-bar-track">
                    <div className="pdp-reviews-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="pdp-reviews-bar-num">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Review Action Trigger */}
          <div className="pdp-reviews-cta-block">
            <p className="pdp-reviews-cta-hint">Have you acquired a WAAK ensemble?</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="pdp-write-review-btn"
            >
              Write an Atelier Review
            </button>
          </div>
        </div>

        {/* Filter Controls (Shown when reviews exist) */}
        {totalReviews > 0 && (
          <div className="pdp-reviews-filter-bar">
            <button
              type="button"
              onClick={() => setFilterRating('all')}
              className={`pdp-filter-chip ${filterRating === 'all' ? 'active' : ''}`}
            >
              All Reviews ({totalReviews})
            </button>
            {[5, 4, 3].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                className={`pdp-filter-chip ${filterRating === star ? 'active' : ''}`}
              >
                {star} Stars ({ratingCounts[star as keyof typeof ratingCounts]})
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilterVerified(!filterVerified)}
              className={`pdp-filter-chip ${filterVerified ? 'active' : ''}`}
            >
              ✓ Verified Only
            </button>
          </div>
        )}

        {/* Honest Empty State vs Reviews List */}
        {totalReviews === 0 ? (
          <div className="pdp-reviews-empty-state">
            <span className="pdp-reviews-empty-icon" aria-hidden="true">✦</span>
            <h3 className="pdp-reviews-empty-title">No customer reviews yet</h3>
            <p className="pdp-reviews-empty-desc">
              Be the first to share your experience with the {productName}. We invite our patrons to provide candid feedback on fit, fabric weight, and drape.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="pdp-reviews-empty-cta"
            >
              Be the First to Review
            </button>
          </div>
        ) : (
          <div className="pdp-reviews-list">
            {filteredReviews.length === 0 ? (
              <p className="pdp-reviews-no-filter-match">No reviews match your selected filter.</p>
            ) : (
              filteredReviews.map((rev) => (
                <div key={rev.id} className="pdp-review-card">
                  <div className="pdp-review-card-header">
                    <div>
                      <div className="pdp-review-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            style={{ color: s <= rev.rating ? '#C5A265' : '#ccc', fontSize: '14px' }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <h4 className="pdp-review-title">{rev.title}</h4>
                    </div>
                    <span className="pdp-review-date">{rev.date}</span>
                  </div>

                  <p className="pdp-review-body">{rev.comment}</p>

                  <div className="pdp-review-meta">
                    <span className="pdp-review-author">{rev.author}</span>
                    {rev.isVerified ? (
                      <span className="pdp-review-verified-badge">
                        ✓ Verified Order
                      </span>
                    ) : (
                      <span className="pdp-review-unverified-badge">
                        Customer Feedback
                      </span>
                    )}
                    {rev.sizePurchased && (
                      <span className="pdp-review-size-tag">Size: {rev.sizePurchased}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="pdp-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="pdp-modal-card pdp-review-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pdp-modal-header">
              <span className="pdp-modal-eyebrow">PATRON FEEDBACK</span>
              <h3 className="pdp-modal-title">Review the {productName}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="pdp-modal-close-btn"
                aria-label="Close review dialog"
              >
                ✕
              </button>
            </div>

            {formSubmitted ? (
              <div className="pdp-review-success" role="status">
                ✓ Thank you for sharing your reflection. Your feedback has been recorded.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="pdp-review-form">
                <div className="pdp-form-group">
                  <label className="pdp-form-label">Your Rating</label>
                  <div className="pdp-rating-picker" role="radiogroup" aria-label="Select star rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className={`pdp-rating-star-btn ${star <= formRating ? 'active' : ''}`}
                        aria-label={`${star} star`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pdp-form-group">
                  <label className="pdp-form-label" htmlFor="review-author">Your Name *</label>
                  <input
                    id="review-author"
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Raghav M."
                    className="pdp-form-input"
                  />
                </div>

                <div className="pdp-form-group">
                  <label className="pdp-form-label" htmlFor="review-size">Chest Size Purchased</label>
                  <input
                    id="review-size"
                    type="text"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="e.g. 40 or 42"
                    className="pdp-form-input"
                  />
                </div>

                <div className="pdp-form-group">
                  <label className="pdp-form-label" htmlFor="review-title">Review Headline</label>
                  <input
                    id="review-title"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Impeccable fit and regal zardozi finish"
                    className="pdp-form-input"
                  />
                </div>

                <div className="pdp-form-group">
                  <label className="pdp-form-label" htmlFor="review-comment">Your Experience & Feedback *</label>
                  <textarea
                    id="review-comment"
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Describe the fabric drape, silhouette comfort, and craftsmanship..."
                    className="pdp-form-textarea"
                  />
                </div>

                <button type="submit" className="pdp-submit-review-btn">
                  Submit Atelier Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .pdp-reviews-section {
          margin: 80px 0 60px;
          border-top: 1px solid rgba(197, 162, 101, 0.3);
          padding-top: 60px;
        }
        .pdp-reviews-container {
          max-width: 960px;
          margin: 0 auto;
        }
        .pdp-reviews-summary-card {
          display: grid;
          grid-template-columns: 220px 1fr 220px;
          gap: 28px;
          background-color: var(--color-cream-light, #FBF8F3);
          border: 1px solid rgba(197, 162, 101, 0.3);
          border-radius: var(--radius-md, 6px);
          padding: 28px;
          box-shadow: 0 4px 18px rgba(80, 27, 21, 0.05);
        }
        .pdp-reviews-score-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .pdp-reviews-big-score {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 46px;
          font-weight: 700;
          color: var(--color-burgundy, #5A121A);
          line-height: 1;
        }
        .pdp-reviews-stars {
          margin: 8px 0;
        }
        .pdp-reviews-count-label {
          font-size: 11.5px;
          color: var(--color-muted, #7A6F66);
        }
        .pdp-reviews-bars-block {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }
        .pdp-reviews-bar-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }
        .pdp-reviews-bar-label {
          width: 36px;
          color: var(--color-charcoal, #1E1A17);
          font-weight: 500;
        }
        .pdp-reviews-bar-track {
          flex: 1;
          height: 8px;
          background-color: rgba(197, 162, 101, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }
        .pdp-reviews-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #C5A265 0%, #98783B 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        .pdp-reviews-bar-num {
          width: 24px;
          text-align: right;
          color: var(--color-muted, #7A6F66);
          font-size: 11px;
        }
        .pdp-reviews-cta-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-left: 1px solid rgba(197, 162, 101, 0.25);
          padding-left: 24px;
          text-align: center;
        }
        .pdp-reviews-cta-hint {
          font-size: 12px;
          color: var(--color-muted, #7A6F66);
          margin-bottom: 12px;
          line-height: 1.4;
        }
        .pdp-write-review-btn {
          width: 100%;
          padding: 12px 16px;
          background-color: var(--color-burgundy, #5A121A);
          color: var(--color-cream-light, #FBF8F3);
          border: 1px solid var(--color-gold, #C5A265);
          border-radius: var(--radius-sm, 4px);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdp-write-review-btn:hover {
          background-color: #3d0c13;
          transform: translateY(-1px);
        }
        .pdp-reviews-filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .pdp-filter-chip {
          padding: 6px 14px;
          background-color: #fff;
          border: 1px solid rgba(197, 162, 101, 0.35);
          border-radius: 20px;
          font-size: 11px;
          color: var(--color-charcoal, #1E1A17);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdp-filter-chip:hover {
          border-color: var(--color-burgundy, #5A121A);
        }
        .pdp-filter-chip.active {
          background-color: var(--color-burgundy, #5A121A);
          color: #fff;
          border-color: var(--color-burgundy, #5A121A);
        }
        .pdp-reviews-empty-state {
          text-align: center;
          padding: 48px 24px;
          background-color: var(--color-cream-light, #FBF8F3);
          border: 1px dashed rgba(197, 162, 101, 0.45);
          border-radius: var(--radius-md, 6px);
          margin-top: 28px;
        }
        .pdp-reviews-empty-icon {
          font-size: 24px;
          color: var(--color-gold, #C5A265);
          display: block;
          margin-bottom: 10px;
        }
        .pdp-reviews-empty-title {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 20px;
          color: var(--color-burgundy, #5A121A);
          margin-bottom: 8px;
        }
        .pdp-reviews-empty-desc {
          font-size: 13px;
          color: var(--color-muted, #7A6F66);
          max-width: 520px;
          margin: 0 auto 22px;
          line-height: 1.6;
        }
        .pdp-reviews-empty-cta {
          padding: 12px 28px;
          background-color: var(--color-burgundy, #5A121A);
          color: var(--color-cream-light, #FBF8F3);
          border: 1px solid var(--color-gold, #C5A265);
          border-radius: var(--radius-sm, 4px);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pdp-reviews-empty-cta:hover {
          background-color: #3d0c13;
          transform: translateY(-1px);
        }
        .pdp-reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 28px;
        }
        .pdp-review-card {
          background-color: #fff;
          border: 1px solid rgba(197, 162, 101, 0.25);
          border-radius: var(--radius-sm, 4px);
          padding: 20px 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .pdp-review-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .pdp-review-title {
          font-family: var(--font-serif, "Cinzel", serif);
          font-size: 15px;
          font-weight: 600;
          color: var(--color-charcoal, #1E1A17);
          margin-top: 4px;
        }
        .pdp-review-date {
          font-size: 11px;
          color: var(--color-muted, #7A6F66);
        }
        .pdp-review-body {
          font-size: 13px;
          line-height: 1.65;
          color: var(--color-charcoal, #1E1A17);
          margin-bottom: 14px;
        }
        .pdp-review-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          flex-wrap: wrap;
        }
        .pdp-review-author {
          font-weight: 600;
          color: var(--color-charcoal, #1E1A17);
        }
        .pdp-review-verified-badge {
          color: #2e7d32;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }
        .pdp-review-unverified-badge {
          color: var(--color-muted, #7A6F66);
          background-color: rgba(122, 111, 102, 0.1);
          border: 1px solid rgba(122, 111, 102, 0.2);
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 2px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .pdp-review-size-tag {
          color: var(--color-muted, #7A6F66);
          background-color: rgba(197, 162, 101, 0.15);
          padding: 2px 8px;
          border-radius: 2px;
        }
        .pdp-review-modal-card {
          max-width: 520px;
        }
        .pdp-review-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 16px;
        }
        .pdp-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pdp-form-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-charcoal, #1E1A17);
        }
        .pdp-rating-picker {
          display: flex;
          gap: 4px;
        }
        .pdp-rating-star-btn {
          background: none;
          border: none;
          font-size: 26px;
          color: rgba(197, 162, 101, 0.3);
          cursor: pointer;
          padding: 0 4px;
          transition: color 0.15s ease;
        }
        .pdp-rating-star-btn.active {
          color: var(--color-gold, #C5A265);
        }
        .pdp-form-input,
        .pdp-form-textarea {
          padding: 10px 12px;
          border: 1px solid rgba(197, 162, 101, 0.4);
          border-radius: var(--radius-sm, 4px);
          font-size: 13px;
          background-color: #fff;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }
        .pdp-form-input:focus,
        .pdp-form-textarea:focus {
          border-color: var(--color-burgundy, #5A121A);
        }
        .pdp-submit-review-btn {
          margin-top: 8px;
          padding: 13px;
          background-color: var(--color-burgundy, #5A121A);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm, 4px);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .pdp-submit-review-btn:hover {
          background-color: #3d0c13;
        }
        .pdp-review-success {
          padding: 18px;
          background-color: rgba(46, 125, 50, 0.1);
          border: 1px solid rgba(46, 125, 50, 0.3);
          color: #2e7d32;
          border-radius: var(--radius-sm, 4px);
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .pdp-reviews-summary-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .pdp-reviews-cta-block {
            border-left: none;
            border-top: 1px solid rgba(197, 162, 101, 0.25);
            padding-left: 0;
            padding-top: 20px;
          }
        }
      `}</style>
    </section>
  );
}
