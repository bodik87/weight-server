import User from "../models/User.js";

// Create product
export const createProduct = async (req, res) => {
  const { username, product } = req.body;

  if (!username || !product) {
    return res.status(400).json({ message: "Can not create new product" });
  }

  const foundUser = await User.findOne({ username: username }).exec();
  if (foundUser) {
    try {
      foundUser.userData.products.push(product);
      foundUser.save();
      const { userData } = foundUser;
      res.json({
        userData,
        message: `New product ${product.title} created`,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: `Can not !!! create new product - ${err}` });
    }
  } else {
    return res.status(400).json({ message: `User not founded` });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { username, updatedProduct } = req.body;

  if (!username || !updatedProduct) {
    return res.status(400).json({ message: "Can not update product" });
  }

  const foundUser = await User.findOne({ username: username }).exec();

  if (foundUser) {
    try {
      const updatedProducts = await Promise.all(
        foundUser.userData.products.map(async (product) => {
          if (product.id === updatedProduct.id) {
            return await updatedProduct;
          } else {
            return await product;
          }
        })
      );

      foundUser.userData.products = updatedProducts;
      foundUser.save();
      const { userData } = foundUser;
      res.json({
        userData,
        message: `Product updated`,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: `Can not update product - ${err}` });
    }
  } else {
    return res.status(400).json({ message: `User not founded` });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { username, id } = req.body;

  if (!username || !id) {
    return res.status(400).json({ message: "Can not delete product" });
  }

  const foundUser = await User.findOne({ username: username }).exec();

  if (foundUser) {
    try {
      const updatedProducts = await Promise.all(
        foundUser.userData.products.filter((product) => product.id !== id)
      );

      foundUser.userData.products = updatedProducts;
      foundUser.save();
      const { userData } = foundUser;
      res.json({
        userData,
        message: `Product deleted`,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: `Can not delete product - ${err}` });
    }
  } else {
    return res.status(400).json({ message: `Product not founded` });
  }
};
