const router = require('express').Router()
const userController = require("../controller/UserController")
const verifytoken = require("../middleware/VerifyUser")
const multer = require('multer');
const path = require('path');


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // make sure uploads/ exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

router.post("/user",userController.userRegister)
router.get("/user/:id",userController.getUser)
router.delete("/user/:id",userController.deleteuser)
router.put("/user/:id",userController.updateUser)
router.post("/profile/:id", userController.upload.single("image"), userController.uploadProfileImage);
router.post("/user/login",userController.userlogin)

router.post("/cart",verifytoken.verifyToken, userController.addtoCart)
router.patch("/cart",verifytoken.verifyToken,userController.removeFromCart)
router.get("/cart",verifytoken.verifyToken,userController.getAllCartItems)

router.post("/order",verifytoken.verifyToken,userController.placeOrder)
router.get("/order",verifytoken.verifyToken,userController.getAllOrders)

router.get("/favorite",verifytoken.verifyToken,userController.getUserFavourites)
router.post("/favorite",verifytoken.verifyToken,userController.addToFavorites)
router.patch("/favorite",verifytoken.verifyToken,userController.removeFromFavorites)


module.exports=router