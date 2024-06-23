// routes/products.js
import { Router } from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all products or filter by category
const getProducts = async (req, res, next) => {
  try {
    // Pagination 
    const {
      page = 1,
      limit = 10,
      sortBy,
      sortOrder = 'asc',
    } = req.query;
    const sort = sortBy ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 } : {};

    // Filter by category (optional)
    const { category } = req.query;
    const productsFilter = category ? { category } : {};

    // Get product(s)
    const products = await Product.find(productsFilter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
    const totalProducts = await Product.countDocuments(productsFilter);
    res.json({ total: totalProducts, products });
  } catch (error) {
    next(error);
  }
};
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};
const updateProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
const deleteProductById = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};


const productRouter = Router();


productRouter.use(auth);

productRouter.route('/')
  .post(createProduct)
  .get(getProducts);

// Get a single product by ID
productRouter.route('/:id')
  .get(getProductById)
  .put(updateProductById)
  .delete(deleteProductById);

export default productRouter;