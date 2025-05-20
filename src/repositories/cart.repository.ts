import { Cart } from '../models/cart.model';
import { ICart } from '../models/cart.model';

export class CartRepository {
  async create(data: Partial<ICart>) {
    return await Cart.create(data);
  }

  async findById(id: string) {
    return await Cart.findById(id)
      .populate('user', 'fullName email')
      .populate('items.product', 'name price offerPrice images');
  }

  async findByUser(userId: string) {
    return await Cart.findOne({ user: userId })
      .populate('user', 'fullName email')
      .populate('items.product', 'name price offerPrice images');
  }

  async findByIdAndUpdate(id: string, data: Partial<ICart>) {
    return await Cart.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async findByIdAndDelete(id: string) {
    return await Cart.findByIdAndDelete(id);
  }
} 