import { Product } from '../models/product.model';
import { IProduct } from '../models/product.model';

export class ProductRepository {
  async create(data: Partial<IProduct>) {
    return await Product.create(data);
  }

  async findById(id: string) {
    return await Product.findById(id)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('reviews.user', 'fullName');
  }

  async find(query: any = {}, options: any = {}) {
    const { sort = '-createdAt', limit = 10, skip = 0, select = '-__v' } = options;
    
    return await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select(select)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug');
  }

  async count(query: any = {}) {
    return await Product.countDocuments(query);
  }

  async findByIdAndUpdate(id: string, data: Partial<IProduct>) {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async findByIdAndDelete(id: string) {
    return await Product.findByIdAndDelete(id);
  }

  async findSimilarProducts(productId: string, category: string, gender: string, type: string) {
    return await Product.find({
      _id: { $ne: productId },
      category,
      gender,
      type,
      isActive: true,
    })
      .limit(4)
      .select('name price offerPrice images ratings');
  }
} 