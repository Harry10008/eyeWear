import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { protect } from '../middleware/auth';

const router = Router();
const cartController = new CartController();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           example: "60d21b4667d0d8992e610c85"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         selectedLens:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [single-vision, bifocal, progressive]
 *               example: "single-vision"
 *             power:
 *               type: string
 *               example: "-2.50"
 *         selectedFrame:
 *           type: object
 *           properties:
 *             size:
 *               type: string
 *               example: "medium"
 *             color:
 *               type: string
 *               example: "black"
 *     Cart:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               product:
 *                 $ref: '#/components/schemas/Product'
 *               selectedLens:
 *                 type: object
 *               selectedFrame:
 *                 type: object
 *         total:
 *           type: number
 *         itemCount:
 *           type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management endpoints
 */

// Protect all cart routes
router.use(protect);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Product not found
 */
router.post('/add', cartController.addToCart);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Cart item not found
 */
router.patch('/items/:itemId', cartController.updateCartItem);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Cart item not found
 */
router.delete('/items/:itemId', cartController.removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart cleared successfully"
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.delete('/clear', cartController.clearCart);

/**
 * @swagger
 * /api/cart/validate:
 *   post:
 *     summary: Validate cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart validation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   example: true
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       isValid:
 *                         type: boolean
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/validate', cartController.validateCart);

export default router; 