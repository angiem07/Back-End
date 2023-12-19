const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// Centralized error handling function
const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: 'Internal server error' });
};

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
        { model: Category, attributes: ['id', 'category_name'] },
        { model: Tag, as: 'product_tags', attributes: ['id', 'tag_name'] },
      ],
    });
    res.json(products);
  } catch (error) {
    handleError(res, error);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'product_name', 'price', 'stock'],
      include: [
        { model: Category, attributes: ['id', 'category_name'] },
        { model: Tag, as: 'product_tags', attributes: ['id', 'tag_name'] },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'Product id not found.' });
      return;
    }

    res.json(product);
  } catch (error) {
    handleError(res, error);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(200).json(product);
  } catch (error) {
    handleError(res, error, 400);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const [numAffectedRows] = await Product.update(req.body, {
      where: { id: req.params.id },
    });

    if (numAffectedRows === 0) {
      res.status(404).json({ message: 'Product id not found.' });
      return;
    }

    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });

    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => ({ product_id: req.params.id, tag_id }));

    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    handleError(res, error, 400);
  }
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const numAffectedRows = await Product.destroy({
      where: { id: req.params.id },
    });

    if (numAffectedRows === 0) {
      res.status(404).json({ message: 'Product id not found.' });
      return;
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
