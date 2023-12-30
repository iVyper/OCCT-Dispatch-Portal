const router = require('express').Router();
const { Route } = require('../../db/models');

router.get('/', async (req, res, next) => {
  try {
    const routes = await Route.findAll({
      order: [['name', 'ASC']],
    });
    res.json(routes);
  } catch (error) {
    next(error);
  }
});
router.delete('/:routeId', async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const routeId = req.params.routeId;
    const routeToDelete = await Route.findByPk(routeId);

    if (!routeToDelete) {
      return res.status(404).json({ error: 'Route not found' });
    }

    await routeToDelete.destroy();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, color } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    const existingRoute = await Route.findOne({
      where: { name: name.trim() },
    });

    if (existingRoute) {
      return res.status(409).json({ error: 'Route name already exists' });
    }

    if (!color.startsWith('#')) {
      return res.status(400).json({ error: "Color must start with '#'" });
    }

    const newRoute = await Route.create({
      name: name.trim(),
      color: color.trim(),
    });
    res.status(201).json(newRoute);
  } catch (error) {
    next(error);
  }
});

router.put('/update/:routeId', async (req, res, next) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const routeId = req.params.routeId;
    const { name, color } = req.body;
    const routeToUpdate = await Route.findByPk(routeId);

    if (!routeToUpdate) {
      return res.status(404).json({ error: 'Route not found' });
    }

    if (name !== undefined && name.trim() !== '') {
      routeToUpdate.name = name.trim();
    }

    if (color !== undefined && color.trim() !== '') {
      if (!color.trim().startsWith('#')) {
        return res.status(400).json({ error: 'Color must start with #' });
      }

      routeToUpdate.color = color.trim();
    }

    await routeToUpdate.save();
    res.status(200).json(routeToUpdate);
  } catch (error) {
    next(error);
  }
});
router.put('/update/enabled/:routeId', async (req, res, next) => {
  try {
    const routeId = req.params.routeId;

    const routeToUpdate = await Route.findByPk(routeId);

    if (!routeToUpdate) {
      return res.status(404).json({ error: 'Route not found' });
    }
    routeToUpdate.enabled = !routeToUpdate.enabled;

    await routeToUpdate.save();
    res.status(200).json(routeToUpdate);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
