import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/product.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Create new product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Creating new product', { body: req.body });
    const product = await Product.create(req.body);
    logger.info('Product created successfully', { productId: product._id });
    res.status(201).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    logger.error('Error creating product', { error });
    next(error);
  }
};

// Get all products with filtering, sorting, and pagination
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Fetching products with filters', { query: req.query });
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle search
    let query = Product.find();
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search as string },
      });
    }

    // Handle filters
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    query = query.find(JSON.parse(queryStr));

    // Handle sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Handle field limiting
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query with population
    const products = await query
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');

    const total = await Product.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { products },
    });
  } catch (error) {
    logger.error('Error fetching products', { error });
    next(error);
  }
};

// Get single product
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'fullName');

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Add review to product
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Initialize reviews array if it doesn't exist
    if (!product.reviews) {
      product.reviews = [];
    }

    // Check if user has already reviewed
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === req.user!._id.toString()
    );

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    // Add review
    product.reviews.push({
      user: req.user!._id,
      rating,
      comment,
      createdAt: new Date(),
    });

    await product.save();

    res.status(201).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// Get product recommendations
export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Find similar products based on category, gender, and type
    const recommendations = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      gender: product.gender,
      type: product.type,
      isActive: true,
    })
      .limit(4)
      .select('name price offerPrice images ratings');

    res.status(200).json({
      status: 'success',
      data: { recommendations },
    });
  } catch (error) {
    next(error);
  }
}; 