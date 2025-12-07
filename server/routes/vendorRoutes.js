const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');

// POST /api/vendors - Create vendor
router.post('/', vendorController.createVendor);

// GET /api/vendors - Get all vendors
router.get('/', vendorController.getAllVendors);

// PUT /api/vendors/:id - Update vendor
router.put('/:id', vendorController.updateVendor);

// DELETE /api/vendors/:id - Delete vendor
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;
