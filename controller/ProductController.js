const productSchema = require("../models/ProductModel")
const mongoose = require("mongoose")


const addProducts = async (req, res, next) => {

    try {
        const productsData = req.body;

        if (!Array.isArray(productsData)) {
            return res.status(400).json({ message: "Invalid data format. Expected an array of products." });
        }

        const createdproducts = [];

        for (const productInfo of productsData) {
            const { title, name, desc, img, price, sizes, category, color, brand } = productInfo;

            const product = new productSchema({
                title,
                name,
                desc,
                img,
                price,
                sizes,
                category,
                color,
                brand
            });
            const createdproduct = await product.save();

            createdproducts.push(createdproduct);
        }

        return res
            .status(201)
            .json({
                message: "Products added successfully",
                createdproducts
            });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            data: err.message
        })
    }
};

const getproducts = async (req, res, next) => {
    try {
        let { categories, minPrice, maxPrice, sizes, search, color } = req.query;

        const filter = {};

        // Categories
        if (categories?.length) {
            filter.categories = { $in: categories };
        }
        // Price range
        if (minPrice || maxPrice) {
            filter["price.org"] = {};
            if (minPrice) filter["price.org"]["$gte"] = parseFloat(minPrice);
            if (maxPrice) filter["price.org"]["$lte"] = parseFloat(maxPrice);
        }

        // Sizes
        if (sizes) {
            sizes = sizes.split(",").filter(s => s.trim() !== "");
            if (sizes.length > 0) {
                filter.sizes = { $in: sizes };
            }
        }

        // Colors
        if (color) {
            color = color.split(",").filter(c => c.trim() !== "");
            if (color.length > 0) {
                filter.color = { $in: color };
            }
        }

        // Search (title or description)
        if (search) {
            filter.$or = [
                { title: { $regex: new RegExp(search, "i") } },
                { desc: { $regex: new RegExp(search, "i") } },
            ];
        }

        const products = await productSchema.find(filter);
        return res.status(200).json(products);

    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            data: err.message,
        });
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const product = await productSchema.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            data: err.message
        })
    }
};

const deleteProductById = async (req, res, next) => {

    try {

        const id = req.params.id;
        const deletedproduct = await productSchema.findByIdAndDelete(id)
        res.status(200).json({
            message: "product deleted"
        })

    } catch (error) {
        console.log(error.message)
    }

}

module.exports = {
    addProducts,
    getproducts,
    getProductById,
    deleteProductById
}
