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

const getproducts = async (req, res) => {
    try {
        let { categories, minPrice, maxPrice, sizes, search, color } = req.query;
        const filter = {};

        // 🟢 Categories
        if (categories?.length) {
            const categoryArray = Array.isArray(categories)
                ? categories
                : categories.split(",").map(c => c.trim()).filter(Boolean);

            if (categoryArray.length) {
                filter.category = { $in: categoryArray };
            }
        }

        // 🟢 Price range
        if (minPrice || maxPrice) {
            filter["price.org"] = {};
            if (minPrice) filter["price.org"]["$gte"] = parseFloat(minPrice);
            if (maxPrice) filter["price.org"]["$lte"] = parseFloat(maxPrice);
        }

        // 🟢 Sizes (ensure proper match for array)
        if (sizes?.length) {
            const sizeArray = Array.isArray(sizes)
                ? sizes
                : sizes.split(",").map(s => s.trim()).filter(Boolean);

            if (sizeArray.length) {
                // Match if product has *any* of these sizes in its array
                filter.sizes = { $elemMatch: { $in: sizeArray } };
            }
        }

        // 🟢 Colors (ensure proper match for array)
        if (color?.length) {
            const colorArray = Array.isArray(color)
                ? color
                : color.split(",").map(c => c.trim()).filter(Boolean);

            if (colorArray.length) {
                // Match if product has *any* of these colors in its array
                filter.color = { $elemMatch: { $in: colorArray } };
            }
        }

        // 🟢 Search (optional)
        if (search?.trim()) {
            const searchRegex = new RegExp(search.trim(), "i");
            filter.$or = [
                { title: { $regex: searchRegex } },
                { desc: { $regex: searchRegex } },
                { name: { $regex: searchRegex } }
            ];
        }

        // 🔍 Fetch products
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
