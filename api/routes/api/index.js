const router = require('express').Router();
router.use('/reports', require('./reports'));
router.use('/routes', require('./routes'));
router.use('/service-updates', require('./serviceUpdates'));
router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

module.exports = router;
