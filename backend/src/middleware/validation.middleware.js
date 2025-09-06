const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    phone: Joi.string().pattern(/^\d{10}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10 digits',
      'any.required': 'Phone number is required'
    }),
    role: Joi.string().valid('user', 'admin', 'superadmin').default('user').messages({
      'any.only': 'Role must be user, admin, or superadmin'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    })
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    }),
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    })
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'any.required': 'Refresh token is required'
    })
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters'
    }),
    lastName: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters'
    }),
    phone: Joi.string().pattern(/^\d{10}$/).optional().messages({
      'string.pattern.base': 'Phone number must be 10 digits'
    }),
    email: Joi.string().email().optional().messages({
      'string.email': 'Please enter a valid email address'
    }),
    language: Joi.string().valid('en', 'hi').optional().messages({
      'any.only': 'Language must be either English (en) or Hindi (hi)'
    }),
    theme: Joi.string().valid('light', 'dark').optional().messages({
      'any.only': 'Theme must be either light or dark'
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Please confirm your new password'
      })
  }),

  updatePG: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional().messages({
      'string.min': 'PG name must be at least 2 characters long',
      'string.max': 'PG name cannot exceed 100 characters'
    }),
    description: Joi.string().max(500).trim().allow('').optional().messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    address: Joi.string().min(10).max(200).trim().optional().messages({
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address cannot exceed 200 characters'
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
    email: Joi.string().email().lowercase().optional().messages({
      'string.email': 'Please enter a valid email address'
    })
  }),

  notificationPreferences: Joi.object({
    emailNotifications: Joi.boolean().default(true),
    smsNotifications: Joi.boolean().default(false),
    pushNotifications: Joi.boolean().default(true),
    paymentReminders: Joi.boolean().default(true),
    maintenanceUpdates: Joi.boolean().default(true),
    newResidentAlerts: Joi.boolean().default(true),
    systemUpdates: Joi.boolean().default(true)
  }),

  emailVerificationQuery: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    }),
    firstName: Joi.string().required().messages({
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Last name is required'
    })
  }),

  passwordResetQuery: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required'
    })
  }),

  pg: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'PG name is required',
      'string.min': 'PG name must be at least 2 characters long',
      'string.max': 'PG name cannot exceed 100 characters'
    }),
    description: Joi.string().max(500).optional().messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    address: Joi.object({
      street: Joi.string().required().messages({
        'string.empty': 'Street address is required'
      }),
      city: Joi.string().required().messages({
        'string.empty': 'City is required'
      }),
      state: Joi.string().required().messages({
        'string.empty': 'State is required'
      }),
      pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
        'string.empty': 'Pincode is required',
        'string.pattern.base': 'Pincode must be 6 digits'
      }),
      landmark: Joi.string().optional()
    }).required(),
    contact: Joi.object({
      phone: Joi.string().pattern(/^\d{10}$/).required().messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Phone number must be 10 digits'
      }),
      email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please enter a valid email'
      }),
      alternatePhone: Joi.string().pattern(/^\d{10}$/).optional().messages({
        'string.pattern.base': 'Alternate phone number must be 10 digits'
      })
    }).required(),
    property: Joi.object({
      type: Joi.string().valid('Gents PG', 'Ladies PG', 'Coliving PG', 'PG', 'Hostel', 'Apartment', 'Independent').default('PG').messages({
        'any.only': 'Please select a valid property type'
      }),
      roomTypes: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('Single', 'Double', 'Triple', 'Dormitory'),
          price: Joi.number().min(0),
          count: Joi.number().integer().min(0)
        })
      ).optional(),
      amenities: Joi.array().items(
        Joi.string().valid('WiFi', 'AC', 'Food', 'Laundry', 'Cleaning', 'Security', 'Parking', 'Gym', 'TV', 'Refrigerator', 'Geyser', 'Furnished')
      ).optional()
    }).required()
  })
};

// Onboarding validation schemas
const onboardingStepSchema = Joi.object({
  stepId: Joi.string().valid(
    'profile_completion',
    'pg_configuration',
    'security_setup',
    'feature_tour',
    'first_resident',
    'payment_setup'
  ).required(),
  data: Joi.any().optional() // Allow any type of data for different steps
});

const profileUpdateSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  address: Joi.string().min(10).max(200).required()
});

const pgConfigurationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  sharingTypes: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().optional(),
      cost: Joi.number().min(0).required()
    })
  ).min(1).required()
});

const securitySetupSchema = Joi.object({
  newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

const firstResidentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  roomNumber: Joi.string().required(),
  rentAmount: Joi.number().positive().required()
});

const paymentSetupSchema = Joi.object({
  paymentMethod: Joi.string().valid('cash', 'bank_transfer', 'upi', 'card').required(),
  bankDetails: Joi.object({
    accountNumber: Joi.string().when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    ifscCode: Joi.string().when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.required()
    }),
    bankName: Joi.string().when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.required()
    })
  }).optional(),
  upiId: Joi.string().when('paymentMethod', {
    is: 'upi',
    then: Joi.required()
  }).optional()
});

// Floor validation schema
const floorSchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Floor name is required',
    'string.min': 'Floor name must be at least 2 characters',
    'string.max': 'Floor name must be less than 50 characters'
  }),
  totalRooms: Joi.number().integer().min(1).max(100).required().messages({
    'number.base': 'Total rooms must be a number',
    'number.integer': 'Total rooms must be a whole number',
    'number.min': 'Total rooms must be at least 1',
    'number.max': 'Total rooms cannot exceed 100'
  }),
  branchId: Joi.string().optional().messages({
    'string.empty': 'Branch ID is required'
  })
});

// Room validation schema
const roomSchema = Joi.object({
  floorId: Joi.string().required().messages({
    'string.empty': 'Floor is required'
  }),
  roomNumber: Joi.string().required().min(1).max(20).messages({
    'string.empty': 'Room number is required',
    'string.min': 'Room number must be at least 1 character',
    'string.max': 'Room number must be less than 20 characters'
  }),
  numberOfBeds: Joi.number().integer().min(1).max(10).required().messages({
    'number.base': 'Number of beds must be a number',
    'number.integer': 'Number of beds must be a whole number',
    'number.min': 'Number of beds must be at least 1',
    'number.max': 'Number of beds cannot exceed 10'
  }),
  sharingType: Joi.string().valid('1-sharing', '2-sharing', '3-sharing', '4-sharing').required().messages({
    'string.empty': 'Sharing type is required',
    'any.only': 'Invalid sharing type'
  }),
  cost: Joi.number().min(0).required().messages({
    'number.base': 'Cost must be a number',
    'number.min': 'Cost cannot be negative'
  }),
  branchId: Joi.string().optional().messages({
    'string.empty': 'Branch ID is required'
  }),
  bedNumbers: Joi.array().items(Joi.string().max(10)).optional().messages({
    'array.base': 'Bed numbers must be an array',
    'string.max': 'Bed number must be less than 10 characters'
  })
});

// Resident validation schema
const residentSchema = Joi.object({
  // Basic Information
  firstName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 50 characters'
  }),
  lastName: Joi.string().required().min(2).max(50).messages({
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 50 characters'
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please enter a valid email address'
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Phone number must be 10 digits'
  }),
  alternatePhone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Alternate phone number must be 10 digits'
  }),
  dateOfBirth: Joi.date().required().messages({
    'date.base': 'Date of birth is required',
    'any.required': 'Date of birth is required'
  }),
  gender: Joi.string().valid('male', 'female', 'other').required().messages({
    'string.empty': 'Gender is required',
    'any.only': 'Gender must be male, female, or other'
  }),
  
  // Address Information
  permanentAddress: Joi.object({
    street: Joi.string().required().messages({
      'string.empty': 'Street address is required'
    }),
    city: Joi.string().required().messages({
      'string.empty': 'City is required'
    }),
    state: Joi.string().required().messages({
      'string.empty': 'State is required'
    }),
    pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.empty': 'Pincode is required',
      'string.pattern.base': 'Pincode must be 6 digits'
    })
  }).required(),
  
  // Work Details (Optional)
  workDetails: Joi.object({
    company: Joi.string().allow('').optional().messages({
      'string.empty': 'Company name must be a valid string'
    }),
    designation: Joi.string().allow('').optional().messages({
      'string.empty': 'Designation must be a valid string'
    }),
    workAddress: Joi.string().allow('').optional().messages({
      'string.empty': 'Work address must be a valid string'
    })
  }).optional(),
  
  // Emergency Contact
  emergencyContact: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Emergency contact name is required'
    }),
    relationship: Joi.string().required().messages({
      'string.empty': 'Relationship is required'
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
      'string.empty': 'Emergency contact phone is required',
      'string.pattern.base': 'Emergency contact phone must be 10 digits'
    }),
    address: Joi.string().allow('').optional().messages({
      'string.empty': 'Emergency contact address must be a valid string'
    })
  }).required(),
  
  // PG and Branch Association
  pgId: Joi.string().optional().messages({
    'string.empty': 'PG ID must be a valid string'
  }),
  branchId: Joi.string().optional().messages({
    'string.empty': 'Branch ID must be a valid string'
  }),
  
  // Room Assignment
  roomId: Joi.string().optional().messages({
    'string.empty': 'Room ID must be a valid string'
  }),
  roomNumber: Joi.string().optional().messages({
    'string.empty': 'Room number must be a valid string'
  }),
  bedNumber: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Bed number must be a number',
    'number.integer': 'Bed number must be a whole number',
    'number.min': 'Bed number must be at least 1'
  }),
  
  // Status and Dates
  status: Joi.string().valid('active', 'inactive', 'moved_out', 'pending').default('pending').messages({
    'any.only': 'Status must be active, inactive, moved_out, or pending'
  }),
  checkInDate: Joi.date().required().messages({
    'date.base': 'Check-in date is required',
    'any.required': 'Check-in date is required'
  }),
  checkOutDate: Joi.date().optional().messages({
    'date.base': 'Please enter a valid check-out date'
  }),
  contractStartDate: Joi.date().required().messages({
    'date.base': 'Contract start date is required',
    'any.required': 'Contract start date is required'
  }),
  contractEndDate: Joi.date().optional().messages({
    'date.base': 'Please enter a valid contract end date'
  }),
  
  // Documents (Optional)
  documents: Joi.object({
    idProof: Joi.string().optional().messages({
      'string.empty': 'ID proof must be a valid string'
    }),
    addressProof: Joi.string().optional().messages({
      'string.empty': 'Address proof must be a valid string'
    }),
    workId: Joi.string().optional().messages({
      'string.empty': 'Work ID must be a valid string'
    }),
    photo: Joi.string().optional().messages({
      'string.empty': 'Photo must be a valid string'
    })
  }).optional(),
  
  // Additional Information
  dietaryRestrictions: Joi.string().max(200).optional().messages({
    'string.max': 'Dietary restrictions cannot exceed 200 characters'
  }),
  medicalConditions: Joi.string().max(500).optional().messages({
    'string.max': 'Medical conditions cannot exceed 500 characters'
  }),
  specialRequirements: Joi.string().max(500).optional().messages({
    'string.max': 'Special requirements cannot exceed 500 characters'
  }),
  
  // Notes
  notes: Joi.string().max(1000).optional().messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  
  // System fields (optional, added by backend)
  createdBy: Joi.string().optional(),
  updatedBy: Joi.string().optional(),
  isActive: Joi.boolean().optional()
});

// Branch validation schema
const branchSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'string.empty': 'Branch name is required',
    'string.min': 'Branch name must be at least 2 characters',
    'string.max': 'Branch name must be less than 100 characters'
  }),
  address: Joi.object({
    street: Joi.string().required().messages({
      'string.empty': 'Street address is required'
    }),
    city: Joi.string().required().messages({
      'string.empty': 'City is required'
    }),
    state: Joi.string().required().messages({
      'string.empty': 'State is required'
    }),
    pincode: Joi.string().required().pattern(/^\d{6}$/).messages({
      'string.empty': 'Pincode is required',
      'string.pattern.base': 'Pincode must be 6 digits'
    }),
    landmark: Joi.string().optional()
  }).required(),
  maintainer: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Maintainer name is required'
    }),
    mobile: Joi.string().required().pattern(/^\d{10}$/).messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits'
    }),
    email: Joi.string().required().email().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email'
    })
  }).required(),
  contact: Joi.object({
    phone: Joi.string().required().pattern(/^\d{10}$/).messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be 10 digits'
    }),
    email: Joi.string().required().email().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email'
    }),
    alternatePhone: Joi.string().optional().pattern(/^\d{10}$/).messages({
      'string.pattern.base': 'Alternate phone number must be 10 digits'
    })
  }).required(),
  capacity: Joi.object({
    totalRooms: Joi.number().integer().min(0).default(0).messages({
      'number.base': 'Total rooms must be a number',
      'number.integer': 'Total rooms must be a whole number',
      'number.min': 'Total rooms cannot be negative'
    }),
    totalBeds: Joi.number().integer().min(0).default(0).messages({
      'number.base': 'Total beds must be a number',
      'number.integer': 'Total beds must be a whole number',
      'number.min': 'Total beds cannot be negative'
    }),
    availableRooms: Joi.number().integer().min(0).default(0).messages({
      'number.base': 'Available rooms must be a number',
      'number.integer': 'Available rooms must be a whole number',
      'number.min': 'Available rooms cannot be negative'
    })
  }).optional(),
  amenities: Joi.array().items(Joi.string().valid('WiFi', 'AC', 'Food', 'Laundry', 'Cleaning', 'Security', 'Parking', 'Gym', 'TV', 'Refrigerator', 'Geyser', 'Furnished')).optional(),
  status: Joi.string().valid('active', 'inactive', 'maintenance', 'full').default('active').messages({
    'any.only': 'Invalid status'
  })
});

// Document validation schemas
const documentUploadSchema = Joi.object({
  documentType: Joi.string().required().valid(
    'allocation_letter',
    'id_proof',
    'address_proof',
    'income_proof',
    'rent_agreement',
    'medical_certificate',
    'character_certificate',
    'college_id',
    'office_id',
    'other'
  ),
  description: Joi.string().max(500).optional(),
  tags: Joi.string().optional(),
  expiryDate: Joi.date().optional()
});

const documentMetadataSchema = Joi.object({
  description: Joi.string().max(500).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  expiryDate: Joi.date().optional(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected').optional(),
  verificationNotes: Joi.string().max(1000).optional()
});

// Generic validation function
const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log('🔍 Validating request body:', req.body);
    const { error } = schema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    console.log('✅ Validation passed');
    next();
  };
};

// Validation middleware
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found',
        statusCode: 500
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        statusCode: 400
      });
    }

    req.body = value;
    next();
  };
};

// Validation middleware functions
const validateOnboardingStep = (req, res, next) => {
  const { error } = onboardingStepSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid onboarding step data',
      error: error.details[0].message
    });
  }
  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { error } = profileUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid profile data',
      error: error.details[0].message
    });
  }
  next();
};

const validatePGConfiguration = (req, res, next) => {
  const { error } = pgConfigurationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid PG configuration data',
      error: error.details[0].message
    });
  }
  next();
};

const validateSecuritySetup = (req, res, next) => {
  const { error } = securitySetupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid security setup data',
      error: error.details[0].message
    });
  }
  next();
};

const validateFirstResident = (req, res, next) => {
  const { error } = firstResidentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid resident data',
      error: error.details[0].message
    });
  }
  next();
};

const validatePaymentSetup = (req, res, next) => {
  const { error } = paymentSetupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment setup data',
      error: error.details[0].message
    });
  }
  next();
};

const validateDocumentUpload = (req, res, next) => {
  const { error } = documentUploadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

const validateDocumentMetadata = (req, res, next) => {
  const { error } = documentMetadataSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

// Floor validation middleware
const validateFloor = (req, res, next) => {
  const { error } = floorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

// Room validation middleware
const validateRoom = (req, res, next) => {
  const { error } = roomSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

// Resident validation middleware
const validateResident = (req, res, next) => {
  console.log('🔍 Validating resident data:', JSON.stringify(req.body, null, 2));
  
  const { error } = residentSchema.validate(req.body);
  if (error) {
    console.log('❌ Validation error:', error.details[0].message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  
  console.log('✅ Validation passed');
  next();
};

// Branch validation middleware
const validateBranch = (req, res, next) => {
  const { error } = branchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.details[0].message
    });
  }
  next();
};

// Export validation functions
module.exports = {
  validateRegister: validate('register'),
  validateLogin: validate('login'),
  validateForgotPassword: validate('forgotPassword'),
  validateResetPassword: validate('resetPassword'),
  validateVerifyEmail: validate('verifyEmail'),
  validateResendVerification: validate('resendVerification'),
  validateRefreshToken: validate('refreshToken'),
  validateUpdateProfile: validate('updateProfile'),
  validateChangePassword: validateRequest(schemas.changePassword),
  validateUpdatePG: validateRequest(schemas.updatePG),
  validateNotificationPreferences: validateRequest(schemas.notificationPreferences),
  validateEmailVerificationQuery: validate('emailVerificationQuery'),
  validatePasswordResetQuery: validate('passwordResetQuery'),
  validatePG: validate('pg'),
  validateOnboardingStep,
  validateProfileUpdate,
  validatePGConfiguration,
  validateSecuritySetup,
  validateFirstResident,
  validatePaymentSetup,
  validateDocumentUpload,
  validateDocumentMetadata,
  validateFloor,
  validateRoom,
  validateResident,
  validateBranch,
  // Export schemas for direct use
  schemas,
  validateRequest
}; 