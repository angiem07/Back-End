const router = require('express').Router();
const { Category, Product } = require('../../models');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: 'Internal server error' });
};

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'category_name'],
      include: [
        {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock'],
        },
      ],
    });
    res.status(200).json(categories);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const category = await Category.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'category_name'],
      include: [
        {
          model: Product,
          attributes: ['id', 'product_name', 'price', 'stock'],
        },
      ],
    });

    if (!category) {
      res.status(404).json({ message: 'Category id not found.' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create({
      category_name: req.body.category_name,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const [numAffectedRows] = await Category.update(
      { category_name: req.body.category_name },
      { where: { id: req.params.id } }
    );

    if (numAffectedRows === 0) {
      res.status(404).json({ message: 'Category id not found.' });
      return;
    }

    res.status(200).json({ message: 'Category updated successfully.' });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const numAffectedRows = await Category.destroy({ where: { id: req.params.id } });

    if (numAffectedRows === 0) {
      res.status(404).json({ message: 'Category id not found.' });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;