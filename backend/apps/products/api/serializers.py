from rest_framework import serializers
from django.db.models import Avg
from apps.products.models import Category, Product, ProductSpecification, Review


# ================================
# CATEGORY SERIALIZER
# ================================
class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "children"]

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []


# ================================
# PRODUCT SPECIFICATION SERIALIZER
# ================================
class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ["key", "value"]


# ================================
# REVIEW SERIALIZER
# ================================
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    # Write-only: POST /reviews/ {"product": "<product slug>", "rating": 5, ...}
    product = serializers.SlugRelatedField(
        slug_field="slug", queryset=Product.objects.all(), write_only=True
    )

    class Meta:
        model = Review
        fields = [
            "id",
            "product",
            "username",
            "rating",
            "comment",
            "images",
            "is_verified_purchase",
            "created_at",
        ]
        read_only_fields = ["created_at", "is_verified_purchase"]

    def validate(self, attrs):
        # The model allows one review per user per product; report it as a
        # validation error instead of a database IntegrityError.
        request = self.context.get("request")
        product = attrs.get("product")
        if (
            self.instance is None
            and request is not None
            and product is not None
            and Review.objects.filter(user=request.user, product=product).exists()
        ):
            raise serializers.ValidationError("You have already reviewed this product.")
        return attrs


# ================================
# PRODUCT SERIALIZER (FINAL + CLEAN)
# ================================
class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    # Computed fields
    discount_amount = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    # Image URL helpers
    thumbnail_url = serializers.SerializerMethodField()
    gallery_urls = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "slug",
            "description",
            "brand",
            "category",
            "price",
            "old_price",
            "discount_percentage",
            "discount_amount",
            "final_price",
            "stock",
            "is_available",
            "warranty",
            "free_shipping",
            "expected_delivery",
            "thumbnail",
            "thumbnail_url",
            "gallery",
            "gallery_urls",
            "specifications",
            "reviews",
            "avg_rating",
            "review_count",
            "created_at",
        ]

    # ================================
    # COMPUTED FIELDS
    # ================================
    def get_discount_amount(self, obj):
        return obj.discount_amount

    def get_final_price(self, obj):
        return obj.final_price

    def get_avg_rating(self, obj):
        avg = obj.reviews.aggregate(avg=Avg("rating"))["avg"]
        return round(avg, 1) if avg else 0.0

    def get_review_count(self, obj):
        return obj.reviews.filter(is_approved=True).count()

    # ================================
    # IMAGE URL HELPERS
    # ================================
    # The storage backend builds the URL: Cloudinary when configured,
    # otherwise MEDIA_URL on this server (made absolute for the frontend).
    def _absolute_url(self, file_field):
        if not file_field:
            return None
        url = file_field.url
        request = self.context.get("request")
        if request is not None and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url

    def get_thumbnail_url(self, obj):
        return self._absolute_url(obj.thumbnail)

    def get_gallery_urls(self, obj):
        return [self._absolute_url(image.image) for image in obj.gallery.all()]


class ProductReadSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()
    images_urls = serializers.SerializerMethodField()
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id","sku","name","slug","description","brand","category",
            "price","old_price","discount_percentage","discount_amount","final_price",
            "stock","is_available","warranty","free_shipping","expected_delivery",
            "thumbnail_public_id","thumbnail_url","images","images_urls",
            "specifications","reviews","created_at",
        ]

    def get_thumbnail_url(self, obj):
        return obj.thumbnail_url() if obj.thumbnail_public_id else None

    def get_images_urls(self, obj):
        return obj.images_urls() if obj.images else []
