const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tags = await Tag.findAll({
      include: {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock'],
        through: { attributes: [] }, // Exclude ProductTag attributes
      },
    });
    res.status(200).json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: {
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock'],
        through: { attributes: [] }, // Exclude ProductTag attributes
      },
    });

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad request' });
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const [numAffectedRows, updatedTags] = await Tag.update(req.body, {
      where: { id: req.params.id },
      returning: true, // Get the updated tag data
    });

    if (numAffectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(200).json(updatedTags[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad request' });
  }
});

router.delete('/:id', async (req, res) => {
  // delete a tag by its `id` value
  try {
    const numAffectedRows = await Tag.destroy({
      where: { id: req.params.id },
    });

    if (numAffectedRows === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
