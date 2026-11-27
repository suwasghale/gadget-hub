"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  Share2,
  Truck,
  Store,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  User
} from 'lucide-react';

import { api, ApiError } from '@/lib/api/client';
import { useAuth } from '@/features/auth/AuthProvider';
import AuthModal from '@/features/auth/components/AuthModal';
import { PLACEHOLDER_IMAGE, type ProductAPI } from '@/features/products/api/products';

interface ProductSpec {
  label: string;
  value: string;
}

const KEY_FEATURE_COUNT = 6;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const ProductDetails = ({ product }: { product: ProductAPI }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'specifications' | 'reviews'>('specifications');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const price = Number(product.final_price);
  const oldPrice = product.old_price ? Number(product.old_price) : null;

  const images = [product.thumbnail_url, ...product.gallery_urls].filter(
    (url): url is string => Boolean(url)
  );
  if (images.length === 0) images.push(PLACEHOLDER_IMAGE);

  const keyFeatures = product.specifications.slice(0, KEY_FEATURE_COUNT);

  const specifications: ProductSpec[] = [
    ...(product.brand ? [{ label: 'Brand', value: product.brand }] : []),
    ...(product.category ? [{ label: 'Category', value: product.category.name }] : []),
    ...product.specifications.map((spec) => ({ label: spec.key, value: spec.value })),
    ...(product.warranty ? [{ label: 'Warranty', value: product.warranty }] : []),
    { label: 'Delivery', value: product.expected_delivery },
  ];

  const inStock = product.is_available && product.stock > 0;

  const handleQuantityChange = (type: 'increment' | 'decrement') => {
    if (type === 'increment' && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewNotice('');
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (userRating < 1) {
      setReviewError('Please choose a rating.');
      return;
    }
    setSubmitting(true);
    try {
      await api('reviews/', {
        method: 'POST',
        json: { product: product.slug, rating: userRating, comment: reviewText.trim() },
      });
      setReviewNotice('Thanks! Your review has been posted.');
      setReviewText('');
      setUserRating(0);
      router.refresh();
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : 'Could not post your review.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, size = 'w-5 h-5') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${interactive ? 'cursor-pointer' : ''} transition-colors duration-200 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            onClick={interactive ? () => setUserRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIndex]}
                alt={product.name}
                className="w-full h-[500px] object-contain p-8 group-hover:scale-105 transition-transform duration-500"
              />

              {images.length > 1 && (
                <>
                  <button
                    aria-label="Previous Image"
                    onClick={() => setActiveImageIndex(prev =>
                      prev === 0 ? images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    aria-label="Next Image"
                    onClick={() => setActiveImageIndex(prev =>
                      prev === images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image + index}
                    aria-label={`Show image ${index + 1}`}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      activeImageIndex === index
                        ? 'border-blue-600 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-contain bg-white p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  {renderStars(product.avg_rating)}
                  <span className="text-sm text-gray-600">
                    {product.review_count} review{product.review_count !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button
                    aria-label="Add to wishlist"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isWishlisted
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    aria-label='Share product'
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  NRS. {price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                {oldPrice && oldPrice > price && (
                  <span className="text-lg text-gray-500 line-through">
                    NRS. {oldPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium mb-4 ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                {inStock ? `In stock (${product.stock} available)` : 'Out of stock'}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    aria-label='Decrease quantity'
                    onClick={() => handleQuantityChange('decrement')}
                    className="p-2 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    aria-label='Increase quantity'
                    onClick={() => handleQuantityChange('increment')}
                    className="p-2 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                disabled={!inStock}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:bg-gray-400 disabled:hover:translate-y-0"
              >
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Delivery Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {product.free_shipping ? 'Free Delivery' : 'Delivery'} · {product.expected_delivery}
                </span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Store className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">In-Store Pickup</span>
              </div>
            </div>

            {/* Key Features */}
            {(keyFeatures.length > 0 || product.description) && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features:</h3>
                {keyFeatures.length > 0 ? (
                  <dl className="space-y-3">
                    {keyFeatures.map((spec) => (
                      <div key={spec.key} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 last:border-b-0">
                        <dt className="font-medium text-gray-900 capitalize">{spec.key}:</dt>
                        <dd className="col-span-2 text-gray-700">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'specifications'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Reviews ({product.review_count})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'specifications' && (
              <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {specifications.map((spec, index) => (
                  <div
                    key={spec.label + index}
                    className={`grid grid-cols-2 gap-4 py-3 px-4 rounded-lg ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <dt className="font-medium text-gray-900">{spec.label}:</dt>
                    <dd className="text-gray-700">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Existing Reviews */}
                <div className="space-y-6">
                  {product.reviews.length === 0 && (
                    <p className="text-gray-600">No reviews yet. Be the first to review this product.</p>
                  )}
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.username}</h4>
                            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                          </div>
                          {renderStars(review.rating)}
                          {review.comment && (
                            <p className="mt-3 text-gray-700 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Form */}
                <form className="border-t border-gray-200 pt-8" onSubmit={handleReviewSubmit}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Leave a review for &quot;{product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}&quot;
                  </h3>

                  {!user && (
                    <p className="text-sm text-gray-600 mb-6">
                      <button type="button" onClick={() => setShowAuth(true)} className="text-blue-600 hover:underline">
                        Sign in
                      </button>{' '}
                      to write a review.
                    </p>
                  )}
                  {reviewNotice && (
                    <p role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{reviewNotice}</p>
                  )}
                  {reviewError && (
                    <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{reviewError}</p>
                  )}

                  <div className="space-y-6">
                    <div>
                      <span className="block text-sm font-medium text-gray-900 mb-3">
                        Your Rating
                      </span>
                      {renderStars(userRating, true, 'w-8 h-8')}
                    </div>

                    <div>
                      <label htmlFor="review-text" className="block text-sm font-medium text-gray-900 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="review-text"
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review"
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {submitting ? 'Posting…' : user ? 'Submit Review' : 'Sign in to review'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialMode="login" />
    </div>
  );
};

export default ProductDetails;
