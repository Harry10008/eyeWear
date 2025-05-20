import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Create new category
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.create(req.body);
    logger.info('Category created', { categoryId: category._id });
    res.status(201).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories with tree structure
export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.find()
      .populate({
        path: 'subcategories',
        select: 'name slug description image isActive order',
      })
      .sort('order');

    // Build tree structure
    const tree = categories.filter((category) => !category.parent);
    logger.info('Categories retrieved', { count: categories.length });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories: tree },
    });
  } catch (error) {
    next(error);
  }
};

// Get single category with subcategories and products
export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate({
        path: 'subcategories',
        select: 'name slug description image isActive order',
      })
      .populate({
        path: 'products',
        select: 'name price offerPrice images ratings',
        match: { isActive: true },
        options: { limit: 8 },
      });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    logger.info('Category retrieved', { categoryId: category._id });
    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Update category
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    logger.info('Category updated', { categoryId: category._id });
    res.status(200).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// Delete category
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has subcategories
    const hasSubcategories = await Category.exists({ parent: category._id });
    if (hasSubcategories) {
      throw new AppError(
        'Cannot delete category with subcategories. Please delete subcategories first.',
        400
      );
    }

    // Check if category has products
    const hasProducts = await Product.exists({ category: category._id });
    if (hasProducts) {
      throw new AppError(
        'Cannot delete category with products. Please remove or reassign products first.',
        400
      );
    }

    await category.deleteOne();
    logger.info('Category deleted', { categoryId: category._id });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get category products with filtering and pagination
export const getCategoryProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Add category filter
    const query = Product.find({
      ...queryObj,
      category: category._id,
      isActive: true,
    });

    // Handle sorting
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query.sort(sortBy);
    } else {
      query.sort('-createdAt');
    }

    // Handle field limiting
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query.select(fields);
    } else {
      query.select('-__v');
    }

    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    query.skip(skip).limit(limit);

    // Execute query
    const products = await query;
    const total = await Product.countDocuments({
      category: category._id,
      isActive: true,
    });

    logger.info('Category products retrieved', { 
      categoryId: category._id,
      count: products.length,
      page,
      limit
    });

    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// Update category order
export const updateCategoryOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      throw new AppError('Orders must be an array', 400);
    }

    // Update each category's order
    await Promise.all(
      orders.map(({ id, order }) =>
        Category.findByIdAndUpdate(id, { order }, { new: true })
      )
    );

    logger.info('Category order updated', { 
      count: orders.length,
      categoryIds: orders.map(o => o.id)
    });

    res.status(200).json({
      status: 'success',
      message: 'Category order updated successfully',
    });
  } catch (error) {
    next(error);
  }
}; 