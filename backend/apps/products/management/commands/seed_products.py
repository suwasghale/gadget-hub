"""
Load a small demo catalogue so the storefront has something to show locally.

    python manage.py seed_products

Safe to run more than once: rows are matched by SKU and updated in place.
"""

from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.products.models import Category, Product, ProductSpecification

DEMO_VENDOR_EMAIL = "store@gadgethub.local"

LAPTOPS = [
    {
        "sku": "GH-LEN-IPS3",
        "name": "Lenovo IdeaPad Slim 3 15IAN8",
        "brand": "Lenovo",
        "price": "48999",
        "old_price": "62000",
        "stock": 0,
        "specs": {"Processor": "Intel Core i3-N305", "RAM": "8GB", "Storage": "512GB SSD"},
    },
    {
        "sku": "GH-HP-PAV15",
        "name": "HP Pavilion 15-eg2xxx (12th Gen Intel Core i5 | 16GB RAM | 1TB SSD)",
        "brand": "HP",
        "price": "65999",
        "old_price": "78000",
        "stock": 12,
        "specs": {"Processor": "Intel Core i5 12th Gen", "RAM": "16GB", "Storage": "1TB SSD"},
    },
    {
        "sku": "GH-DEL-INS15",
        "name": "Dell Inspiron 15 3525 (AMD Ryzen 5 5500U | 8GB RAM | 512GB SSD)",
        "brand": "Dell",
        "price": "54999",
        "old_price": "64000",
        "stock": 7,
        "specs": {"Processor": "AMD Ryzen 5 5500U", "RAM": "8GB", "Storage": "512GB SSD"},
    },
    {
        "sku": "GH-ASU-VB15",
        "name": "ASUS VivoBook 15 X515EA (11th Gen Intel Core i3 | 8GB RAM | 256GB SSD)",
        "brand": "ASUS",
        "price": "42999",
        "old_price": "52000",
        "stock": 20,
        "specs": {"Processor": "Intel Core i3 11th Gen", "RAM": "8GB", "Storage": "256GB SSD"},
    },
    {
        "sku": "GH-ACE-ASP5",
        "name": "Acer Aspire 5 A515-57 (12th Gen Intel Core i5 | 16GB RAM | 512GB SSD)",
        "brand": "Acer",
        "price": "58999",
        "old_price": "68000",
        "stock": 5,
        "specs": {"Processor": "Intel Core i5 12th Gen", "RAM": "16GB", "Storage": "512GB SSD"},
    },
    {
        "sku": "GH-MSI-MOD14",
        "name": "MSI Modern 14 C12M (12th Gen Intel Core i5 | 8GB RAM | 512GB SSD)",
        "brand": "MSI",
        "price": "61999",
        "old_price": "72000",
        "stock": 9,
        "specs": {"Processor": "Intel Core i5 12th Gen", "RAM": "8GB", "Storage": "512GB SSD"},
    },
    {
        "sku": "GH-LEN-TPE14",
        "name": "Lenovo ThinkPad E14 Gen 4 (AMD Ryzen 5 5625U | 16GB RAM | 512GB SSD)",
        "brand": "Lenovo",
        "price": "72999",
        "old_price": "85000",
        "stock": 4,
        "specs": {"Processor": "AMD Ryzen 5 5625U", "RAM": "16GB", "Storage": "512GB SSD"},
    },
    {
        "sku": "GH-HP-ENVY13",
        "name": "HP Envy 13-ba1xxx (11th Gen Intel Core i7 | 16GB RAM | 1TB SSD)",
        "brand": "HP",
        "price": "84999",
        "old_price": "98000",
        "stock": 3,
        "specs": {"Processor": "Intel Core i7 11th Gen", "RAM": "16GB", "Storage": "1TB SSD"},
    },
]


class Command(BaseCommand):
    help = "Create or update a demo catalogue of laptops for local development."

    @transaction.atomic
    def handle(self, *args, **options):
        User = get_user_model()
        vendor, created = User.objects.get_or_create(
            email=DEMO_VENDOR_EMAIL,
            defaults={"username": "gadgethub-store", "role": User.Roles.VENDOR},
        )
        if created:
            vendor.set_unusable_password()
            vendor.save()

        laptops, _ = Category.objects.get_or_create(
            slug="laptops", defaults={"name": "Laptops"}
        )

        for item in LAPTOPS:
            product, _ = Product.objects.update_or_create(
                sku=item["sku"],
                defaults={
                    "vendor": vendor,
                    "category": laptops,
                    "name": item["name"],
                    "brand": item["brand"],
                    "description": item["name"],
                    "price": Decimal(item["price"]),
                    "old_price": Decimal(item["old_price"]),
                    "stock": item["stock"],
                    "is_available": True,
                    "warranty": "1 year manufacturer warranty",
                },
            )
            for key, value in item["specs"].items():
                ProductSpecification.objects.update_or_create(
                    product=product, key=key, defaults={"value": value}
                )

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {len(LAPTOPS)} products in '{laptops.name}'.")
        )
