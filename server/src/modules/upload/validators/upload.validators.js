const Joi = require("joi");
const { validateRequest } = require("../../../shared/utils/validators");

// Upload validation schemas
const uploadSchemas = {
  // Avatar upload validation
  uploadAvatar: Joi.object({
    body: Joi.object({
      transformation: Joi.object({
        width: Joi.number().min(50).max(2000),
        height: Joi.number().min(50).max(2000),
        quality: Joi.number().min(1).max(100),
        format: Joi.string().valid("jpg", "jpeg", "png", "webp"),
        crop: Joi.string().valid("fill", "fit", "scale", "crop"),
      }).optional(),
      metadata: Joi.object().optional(),
    }).optional(),
  }),

  // Product images upload validation
  uploadProductImages: Joi.object({
    body: Joi.object({
      transformation: Joi.object({
        width: Joi.number().min(100).max(3000),
        height: Joi.number().min(100).max(3000),
        quality: Joi.number().min(1).max(100),
        format: Joi.string().valid("jpg", "jpeg", "png", "webp"),
        crop: Joi.string().valid("fill", "fit", "scale", "crop"),
      }).optional(),
      metadata: Joi.object().optional(),
    }).optional(),
  }),

  // Banner upload validation
  uploadBanner: Joi.object({
    body: Joi.object({
      transformation: Joi.object({
        width: Joi.number().min(300).max(5000),
        height: Joi.number().min(100).max(2000),
        quality: Joi.number().min(1).max(100),
        format: Joi.string().valid("jpg", "jpeg", "png", "webp"),
        crop: Joi.string().valid("fill", "fit", "scale", "crop"),
      }).optional(),
      metadata: Joi.object().optional(),
    }).optional(),
  }),

  // Category image upload validation
  uploadCategoryImage: Joi.object({
    body: Joi.object({
      transformation: Joi.object({
        width: Joi.number().min(100).max(1000),
        height: Joi.number().min(100).max(1000),
        quality: Joi.number().min(1).max(100),
        format: Joi.string().valid("jpg", "jpeg", "png", "webp"),
        crop: Joi.string().valid("fill", "fit", "scale", "crop"),
      }).optional(),
      metadata: Joi.object().optional(),
    }).optional(),
  }),

  // Delete file validation
  deleteFile: Joi.object({
    params: Joi.object({
      publicId: Joi.string().required(),
    }),
    query: Joi.object({
      resourceType: Joi.string()
        .valid("image", "video", "raw", "auto")
        .optional(),
    }),
  }),

  // Delete multiple files validation
  deleteMultiple: Joi.object({
    body: Joi.object({
      publicIds: Joi.array().items(Joi.string()).min(1).max(100).required(),
    }),
    query: Joi.object({
      resourceType: Joi.string()
        .valid("image", "video", "raw", "auto")
        .optional(),
    }),
  }),

  // Get file info validation
  getFileInfo: Joi.object({
    params: Joi.object({
      publicId: Joi.string().required(),
    }),
  }),

  // Generate signed URL validation
  generateSignedUrl: Joi.object({
    body: Joi.object({
      folder: Joi.string().optional(),
      fileName: Joi.string().optional(),
      contentType: Joi.string().optional(),
      transformation: Joi.object().optional(),
      resourceType: Joi.string()
        .valid("image", "video", "raw", "auto")
        .optional(),
      expiresAt: Joi.date().greater("now").optional(),
    }),
  }),

  // Transform image validation
  transformImage: Joi.object({
    params: Joi.object({
      publicId: Joi.string().required(),
    }),
    body: Joi.object({
      transformation: Joi.object({
        width: Joi.number().min(1).max(5000),
        height: Joi.number().min(1).max(5000),
        quality: Joi.number().min(1).max(100),
        format: Joi.string().valid("jpg", "jpeg", "png", "webp", "gif", "svg"),
        crop: Joi.string().valid(
          "fill",
          "fit",
          "scale",
          "crop",
          "thumb",
          "face"
        ),
        gravity: Joi.string().valid("center", "north", "south", "east", "west"),
        background: Joi.string().optional(),
        opacity: Joi.number().min(0).max(100),
        radius: Joi.number().min(0),
        border: Joi.string().optional(),
        effect: Joi.string().optional(),
      }).required(),
    }),
  }),

  // Switch provider validation (admin only)
  switchProvider: Joi.object({
    body: Joi.object({
      providerName: Joi.string().valid("cloudinary", "aws", "local").required(),
      providerConfig: Joi.object().optional(),
    }),
  }),

  // Custom upload validation
  customUpload: Joi.object({
    body: Joi.object({
      userType: Joi.string().valid("user", "seller", "admin").optional(),
      category: Joi.string().optional(),
      fileName: Joi.string().optional(),
      transformation: Joi.object().optional(),
      metadata: Joi.object().optional(),
    }),
    params: Joi.object({
      userId: Joi.string().optional(),
    }),
  }),

  // Bulk upload validation
  bulkUpload: Joi.object({
    body: Joi.object({
      userType: Joi.string().valid("user", "seller", "admin").optional(),
      category: Joi.string().optional(),
      transformation: Joi.object().optional(),
      metadata: Joi.object().optional(),
    }),
    params: Joi.object({
      userId: Joi.string().optional(),
    }),
  }),
};

// Validation middleware functions
const validateUploadAvatar = validateRequest(uploadSchemas.uploadAvatar);
const validateUploadProductImages = validateRequest(
  uploadSchemas.uploadProductImages
);
const validateUploadBanner = validateRequest(uploadSchemas.uploadBanner);
const validateUploadCategoryImage = validateRequest(
  uploadSchemas.uploadCategoryImage
);
const validateDeleteFile = validateRequest(uploadSchemas.deleteFile);
const validateDeleteMultiple = validateRequest(uploadSchemas.deleteMultiple);
const validateGetFileInfo = validateRequest(uploadSchemas.getFileInfo);
const validateGenerateSignedUrl = validateRequest(
  uploadSchemas.generateSignedUrl
);
const validateTransformImage = validateRequest(uploadSchemas.transformImage);
const validateSwitchProvider = validateRequest(uploadSchemas.switchProvider);
const validateCustomUpload = validateRequest(uploadSchemas.customUpload);
const validateBulkUpload = validateRequest(uploadSchemas.bulkUpload);

module.exports = {
  // Schemas
  uploadSchemas,

  // Validation middleware
  validateUploadAvatar,
  validateUploadProductImages,
  validateUploadBanner,
  validateUploadCategoryImage,
  validateDeleteFile,
  validateDeleteMultiple,
  validateGetFileInfo,
  validateGenerateSignedUrl,
  validateTransformImage,
  validateSwitchProvider,
  validateCustomUpload,
  validateBulkUpload,
};
