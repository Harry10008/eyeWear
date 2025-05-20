import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const productService = new ProductService();

// Create new product
export const createProduct = catchAsync(async (req: Request, res: Response) => {
  logger.info('Creating new product', { body: req.body });
  const product = await productService.createProduct(req.body);
  logger.info('Product created successfully', { productId: product._id });
  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

// Get all products with filtering, sorting, and pagination
export const getProducts = catchAsync(async (req: Request, res: Response) => {
  logger.info('Fetching products with filters', { query: req.query });
  const { products, total, totalPages, currentPage } = await productService.getProducts(req.query);
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    total,
    totalPages,
    currentPage,
    data: { products },
  });
});

// Get single product
export const getProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getProduct(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

// Update product
export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

// Delete product
export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add review to product
export const addReview = catchAsync(async (req: Request, res: Response) => {
  const { rating, comment } = req.body;
  const product = await productService.addReview(
    req.params.id,
    req.user!._id,
    rating,
    comment
  );
  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

// Get product recommendations
export const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const recommendations = await productService.getRecommendations(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { recommendations },
  });
}); 