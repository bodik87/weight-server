import User from "../models/User.js";

// Create meal
export const createMeal = async (req, res) => {
  const { username, meal } = req.body;

  if (!username || !meal) {
    return res.status(400).json({ message: "Can not create new meal" });
  }

  const foundUser = await User.findOne({ username: username }).exec();

  if (foundUser) {
    try {
      foundUser.userData.meals.push(meal);
      const { userData } = await foundUser.save();
      res.json({
        userData,
        message: `New meal created`,
      });
    } catch (err) {
      return res
        .status(400)
        .json({ message: `Can not create new meal - ${err}` });
    }
  } else {
    return res.status(400).json({ message: `User not founded` });
  }
};

// Update meal
export const updateMeal = async (req, res) => {
  const { username, updatedMeal } = req.body;

  if (!username || !updatedMeal) {
    return res.status(400).json({ message: "Can not update meal" });
  }

  const foundUser = await User.findOne({ username: username }).exec();

  if (foundUser) {
    try {
      const updatedMeals = await Promise.all(
        foundUser.userData.meals.map(async (meal) => {
          if (meal.id === updatedMeal.id) {
            return await updatedMeal;
          } else {
            return await meal;
          }
        })
      );

      foundUser.userData.meals = updatedMeals;
      foundUser.save();
      const { userData } = foundUser;
      res.json({
        userData,
        message: `Meal updated`,
      });
    } catch (err) {
      return res.status(400).json({ message: `Can not update meal- ${err}` });
    }
  } else {
    return res.status(400).json({ message: `User not founded` });
  }
};

// Delete meal
export const deleteMeal = async (req, res) => {
  const { username, id } = req.body;

  if (!username || !id) {
    return res.status(400).json({ message: "Can not update meal" });
  }

  const foundUser = await User.findOne({ username: username }).exec();

  if (foundUser) {
    try {
      const updatedMeals = await Promise.all(
        foundUser.userData.meals.filter((meal) => meal.id !== id)
      );

      foundUser.userData.meals = updatedMeals;
      foundUser.save();
      const { userData } = foundUser;
      res.json({
        userData,
        message: `Meal updated`,
      });
    } catch (err) {
      return res.status(400).json({ message: `Can not update meal - ${err}` });
    }
  } else {
    return res.status(400).json({ message: `User not founded` });
  }
};
