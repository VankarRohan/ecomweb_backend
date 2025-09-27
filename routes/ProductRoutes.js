const express = require('express')
const router = require("express").Router()
const productController = require("../controller/ProductController")

router.post("/add",productController.addProducts)
router.get("/",productController.getproducts)
router.get("/:id",productController.getProductById)
router.delete("/:id",productController.deleteProductById)

module.exports = router