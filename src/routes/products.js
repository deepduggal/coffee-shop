// routes/products.js
import { Router } from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';
import role from '../middleware/role.js'
import validateProduct from '../middleware/validateProduct.js'
import cloudUpload from '../middleware/cloudinaryUpload.js';

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const image = req.file.path;
    console.log(req.file, image)
    const product = new Product({ name, description, price, category, stock, imageUrl: image });
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
    const { name, description, price, category, stock } = req.body;
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.imageUrl;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, stock, imageUrl },
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
  .post(role(['admin']), cloudUpload.single('image'), validateProduct, createProduct)
  .get(getProducts);

// Get a single product by ID
productRouter.route('/:id')
  .get(getProductById)
  .put(cloudUpload.single('image'), validateProduct, updateProductById)
  .delete(deleteProductById);

export default productRouter;