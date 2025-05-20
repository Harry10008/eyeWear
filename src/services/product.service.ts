import { ProductRepository } from '../repositories/product.repository';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async createProduct(data: any) {
    logger.info('Creating new product', { body: data });
    const product = await this.productRepository.create(data);
    logger.info('Product created successfully', { productId: product._id });
    return product;
  }

  async getProducts(query: any = {}, options: any = {}) {
    logger.info('Fetching products with filters', { query });
    
    // Handle search
    if (query.search) {
      query.$text = { $search: query.search };
      delete query.search;
    }

    // Handle filters
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Handle sorting
    if (query.sort) {
      options.sort = query.sort.split(',').join(' ');
      delete query.sort;
    }

    // Handle field limiting
    if (query.fields) {
      options.select = query.fields.split(',').join(' ');
      delete query.fields;
    }

    // Handle pagination
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    options.skip = (page - 1) * limit;
    options.limit = limit;

    const [products, total] = await Promise.all([
      this.productRepository.find(parsedQuery, options),
      this.productRepository.count(parsedQuery)
    ]);

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getProduct(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async updateProduct(id: string, data: any) {
    const product = await this.productRepository.findByIdAndUpdate(id, data);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async deleteProduct(id: string) {
    const product = await this.productRepository.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async addReview(productId: string, userId: string, rating: number, comment: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Initialize reviews array if it doesn't exist
    if (!product.reviews) {
      product.reviews = [];
    }

    // Check if user has already reviewed
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    // Add review
    product.reviews.push({
      user: new mongoose.Types.ObjectId(userId),
      rating,
      comment,
      createdAt: new Date(),
    });

    await product.save();
    return product;
  }

  async getRecommendations(productId: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return await this.productRepository.findSimilarProducts(
      productId,
      product.category.toString(),
      product.gender,
      product.type
    );
  }
} 