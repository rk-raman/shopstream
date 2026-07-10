# Upload Module

## Overview

The Upload module provides a multi-provider file upload system supporting **Cloudinary** and **AWS S3**. It handles avatar uploads, product images, brand assets, category images, collection images, banners, and custom file uploads. The module uses a **provider factory pattern** allowing runtime switching between storage providers.

## Architecture

```
server/src/modules/upload/
├── controllers/
│   └── upload.controller.js      # Upload endpoint handlers
├── models/
│   ├── Upload.model.js           # Upload metadata record
│   └── index.js                  # Model exports
├── services/
│   └── upload.service.js         # Upload orchestration logic
├── providers/
│   ├── base.provider.js          # Abstract provider interface
│   ├── cloudinary.provider.js    # Cloudinary implementation
│   ├── aws.provider.js           # AWS S3 implementation
│   └── index.js                  # Provider factory
├── middleware/
│   └── upload.middleware.js      # Multer configuration & helpers
├── routes/
│   └── upload.routes.js          # Route definitions
├── validators/
│   └── upload.validators.js      # File validation rules
├── events/
│   ├── upload.events.js          # Event type definitions
│   ├── publishers/
│   │   └── UploadEventPublisher.js
│   └── subscribers/
│       ├── UploadAnalyticsSubscriber.js # Track upload metrics
│       └── index.js
└── index.js                      # Module exports
```

## API Endpoints

### Upload Routes (`/api/v1/uploads`)

All routes require authentication.

| Method | Endpoint                                | Auth    | Description                       |
|--------|-----------------------------------------|---------|-----------------------------------|
| POST   | `/avatar`                               | User    | Upload user avatar                |
| POST   | `/avatar/:userId`                       | User    | Upload avatar for specific user   |
| POST   | `/products/images`                      | User    | Upload product images (up to 10)  |
| POST   | `/products/:productId/images`           | User    | Upload images for specific product|
| POST   | `/banners`                              | User    | Upload banner image               |
| POST   | `/categories/:categoryId/image`         | User    | Upload category image             |
| POST   | `/custom`                               | User    | Generic single file upload        |
| POST   | `/folders/:categoryPath`                | User    | Upload to custom folder path      |
| POST   | `/folders/:categoryPath/multiple`       | User    | Multiple files to custom folder   |
| POST   | `/bulk`                                 | User    | Bulk upload (up to 20 files)      |
| DELETE | `/files/:publicId`                      | User    | Delete a file                     |
| DELETE | `/files`                                | User    | Delete multiple files             |
| GET    | `/files/:publicId/info`                 | User    | Get file metadata                 |
| POST   | `/signed-url`                           | User    | Generate signed upload URL        |
| POST   | `/transform/:publicId`                  | User    | Apply image transformations       |
| POST   | `/provider/switch`                      | Admin   | Switch active upload provider     |
| GET    | `/provider/info`                        | User    | Get current provider info         |
| GET    | `/admin/stats`                          | Admin   | Upload statistics                 |
| GET    | `/admin/health`                         | Admin   | Provider health check             |
| POST   | `/brands/:brandId/logo`                 | User    | Upload brand logo                 |
| POST   | `/brands/:brandId/banner`               | User    | Upload brand banner               |
| POST   | `/brands/:brandId/images`               | User    | Upload brand images (up to 10)    |
| POST   | `/collections/:collectionId/image`      | User    | Upload collection image           |

## Provider Pattern

### Base Provider Interface

All providers implement these methods:

```javascript
class BaseProvider {
  upload(file, options)         // Upload a file
  delete(publicId)              // Delete a file
  getInfo(publicId)             // Get file metadata
  generateSignedUrl(options)   // Generate pre-signed URL
  transform(publicId, options) // Apply transformations
  getHealth()                  // Provider health check
}
```

### Cloudinary Provider
- Image optimization and transformation on-the-fly
- CDN delivery with global edge caching
- Automatic format selection (WebP, AVIF)
- Responsive image breakpoints

### AWS S3 Provider
- Direct upload with pre-signed URLs
- Bucket-based organization
- CloudFront CDN integration
- Lifecycle policies for cleanup

### Provider Factory

```javascript
// Switch providers at runtime (admin only)
POST /uploads/provider/switch
{ "provider": "cloudinary" | "aws" }
```

## File Organization

Files are organized in a structured folder hierarchy:

```
/{category}/{userType}/{userId}/filename
```

Examples:
- `users/user/12345/avatar.jpg`
- `products/seller/67890/product_main.jpg`
- `brands/seller/67890/logo.png`
- `categories/admin/11111/banner.jpg`

## Upload Middleware

The `upload.middleware.js` provides Multer-based configuration:

- **`single(fieldName)`** - Single file upload
- **`multiple(fieldName, maxCount)`** - Multiple file upload
- **`custom(fieldName, mode, options)`** - Custom configuration
- **`avatar()`** - Pre-configured for avatar uploads
- **`handleUploadError()`** - Error handling middleware

### File Validation

- **Size limits**: Configurable per upload type
- **Type validation**: MIME type and extension checking
- **Image dimensions**: Optional min/max dimension validation

## Events Published

| Event               | Payload                      | Triggered When           |
|---------------------|------------------------------|--------------------------|
| `upload.completed`  | File URL, public_id, uploader| File uploaded            |
| `upload.deleted`    | Public ID, uploader          | File deleted             |
| `upload.bulk`       | File count, total size       | Bulk upload completed    |

## Dependencies

- **Internal**: Used by User module (avatars), Product module (images), and other modules needing file uploads
- **External**: multer, cloudinary, @aws-sdk/client-s3
