const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const userSchema = require("../models/UserModel")
const orderSchema = require("../models/OrderModel")
dotenv.config();

const userRegister = async (req, res) => {

    try {
        const { firstname,lastname,phone, email, img, password } = req.body;
        const existinguser = await userSchema.findOne({ email });

        if (existinguser) {
            return res.status(409).json({ message: "email already in use" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new userSchema({

            firstname,
            lastname,
            phone,
            email,
            password: hashedPassword,
            img
        })
        const createdUser = await user.save()
        const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
            expiresIn: "9999 years",
        })
        return res.status(200).json({
            message: "user created",
            data: createdUser, token
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            data: error
        });
    }

}
const getUser = async (req, res) => {

    try {
        const user = await userSchema.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "User fetched successfully", data: user });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            data: error
        });
    }
}
const updateUser = async (req, res) => {

    try {
        // const { name , email } = req.body
        const updateduser = await userSchema.findByIdAndUpdate(req.params.id, req.body)

        if (updateduser != null) {

            res.status(200).json({
                message: "User updated successfully...",
                // data : updateduser,
                flag: 1
            })

        } else {

            res.status(404).json({
                message: "User not found !!!",
                flag: -1
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Error in server !!!",
            data: error.message,
            flag: -1
        })
    }
}

const userlogin = async (req, res) => {

    try {
        const { email, password } = req.body;
        const existingUser = await userSchema.findOne({ email });
        if (!existingUser) {
            return next(createError(404, "user not found"));
        }

        const isPasswordCorrect = await bcrypt.compareSync(
            password,
            existingUser.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "invalid password" });
        }

        const token = jwt.sign({ id: existingUser._id }, process.env.JWT, {
            expiresIn: "9999 years",
        })
        return res.status(200).json({
            message: "user logged in",
            data: token, user: existingUser
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            data: error.message
        });
    }

}

const deleteuser = async (req, res) => {

    try {
        const { id } = req.params;
        const deleteduser = await userSchema.findByIdAndDelete(id)
        if (!deleteduser) {
            res.status(404).json({ message: "user not found" })
        }
        res.status(200).json({
            message: "user deleted",
            data: deleteduser
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            data: error.message
        });
    }
}

const addtoCart = async (req, res) => {

    try {

        const { productId, quantity, color, size } = req.body;
        const userJWT = req.user;
        const user = await userSchema.findById(userJWT.id);
        const existingCartItemIndex = user.cart.findIndex((item) =>
            item?.product?.equals(productId) &&
            item?.color === color &&
            item?.size === size
        );
        if (existingCartItemIndex !== -1) {

            user.cart[existingCartItemIndex].quantity += quantity;
        } else {

            user.cart.push({ product: productId, quantity, color, size });
        }
        await user.save();

        return res
            .status(200)
            .json({
                message: "Product added to cart successfully",
                user
            });


    } catch (error) {
        console.log(error)

    }
}

const removeFromCart = async (req, res) => {

    try {

        const { productId, quantity, color, size } = req.body;
        const userJWT = req.user;
        const user = await userSchema.findById(userJWT.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
        }
        const productIndex = user.cart.findIndex((item) =>
            item.product.equals(productId) &&
            item?.color === color &&
            item?.size === size
        );
        if (productIndex !== -1) {
            if (quantity && quantity > 0) {
                user.cart[productIndex].quantity -= quantity;
                if (user.cart[productIndex].quantity <= 0) {
                    user.cart.splice(productIndex, 1);
                }
            } else {
                user.cart.splice(productIndex, 1);
            }

            await user.save();
            return res
                .status(200)
                .json({
                    message: "Product quantity updated in cart",
                    user
                });
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {

        console.log(error)
    }
}

const getAllCartItems = async (req, res) => {

    try {
        const userJWT = req.user;
        const user = await userSchema.findById(userJWT.id).populate({
            path: "cart.product",
            model: "Products",
        });
        const cartItems = user.cart;
        return res.status(200).json(cartItems);
    } catch (error) {
        console.log(error)
    }
}

const placeOrder = async (req, res) => {
    try {
        const { products, address, totalAmount, subtotal, shipping, tax, discount } = req.body;
        const userJWT = req.user; // set by verifyToken middleware

        // find logged-in user
        const user = await userSchema.findById(userJWT.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // create new orde
        const order = new orderSchema({
            products,
            user: user._id,
            total_amount: parseFloat(totalAmount),
            address,
            subtotal,
            shipping,
            tax,
            discount,
        });

        const savedOrder = await order.save();

        await userSchema.findByIdAndUpdate(
            userJWT.id,
            {
                $push: { orders: savedOrder._id },
                $set: { cart: [] }
            },
            { new: true } // return updated doc
        );

        return res.status(200).json({
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("❌ Place order error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


const getAllOrders = async (req, res) => {
    try {
        // const user = req.user;
        console.log(req.user)
        const userId = req.user._id || req.user.id;
        const orders = await orderSchema.find({ user: userId }).populate({
            path: "products.product", // path to populate inside the array
            model: "Products",        // make sure this matches your Products model
        })
        return res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};

const addToFavorites = async (req, res) => {
    try {
        const { productId } = req.body;
        // console.log(productId);
        const userJWT = req.user;
        const user = await userSchema.findById(userJWT.id);

        if (!user.favourites.includes(productId)) {
            user.favourites.push(productId);
            await user.save();
        }

        return res
            .status(200)
            .json({
                message: "Product added to favorites successfully",
                user
            });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            data: err.message
        })
    }

}


const removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.body;
        const userJWT = req.user;
        const user = await userSchema.findById(userJWT.id);

        user.favourites = user.favourites.filter((fav) => !fav.equals(productId));
        await user.save();
        return res
            .status(200)
            .json({
                message: "Product removed from favorites successfully", user
            });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            data: err.message
        })
    }
};

const getUserFavourites = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userSchema.findById(userId).populate("favourites").exec();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.favourites);
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error",
            data: err
        })
    }
};


module.exports = {
    userRegister,
    deleteuser,
    userlogin,
    addtoCart,
    removeFromCart,
    getAllCartItems,
    placeOrder,
    getAllOrders,
    addToFavorites,
    removeFromFavorites,
    getUserFavourites,
    updateUser,
    getUser
}