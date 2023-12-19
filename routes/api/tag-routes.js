const router = require('express').Router();
const { Tag, Product } = require('../../models');

// Centralized error handling function
const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: 'Internal server error' });
};

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.findAll({
      attributes: ['id', 'tag_name'],
      include: [
        {
          model: Product,
          as: 'product_tags',
          attributes: ['id', 'product_name', 'price', 'stock'],
        },
      ],
    });
    res.json(tags);
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findOne({
      where: { id: req.params.id },
      attributes: ['id', 'tag_name'],
      include: [
        {
          model: Product,
          as: 'product_tags',
          attributes: ['id', 'product_name', 'price', 'stock'],
        },
      ],
    });

    if (!tag) {
      res.status(404).json({ message: 'Tag id not found.' });
      return;
    }

    res.json(tag);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create({
      tag_name: req.body.tag_name,
    });
    res.json(newTag);
  } catch (error) {
    handleError(res, error, 400);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [numAffectedRows] = await Tag.update(
      { tag_name: req.body.tag_name },
      { where: { id: req.params.id } }
    );

    if (numAffectedRows === 0) {
      res.status(404).json({
        message: 'Tag id not found. Catergory could not be udated.',
      });
      return;
    }

    res.json({ message: 'Tag updated successfully.' });
  } catch (error) {
    handleError(res, error, 400);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const numAffectedRows = await Tag.destroy({
      where: { id: req.params.id },
    });

    if (numAffectedRows === 0) {
      res.status(404).json({ message: 'Tag id not found.' });
      return;
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
