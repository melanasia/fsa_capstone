const router = require("express").Router();
const {
  models: { Budget },
} = require("../db");
const { isLoggedIn } = require("../middleware");

module.exports = router;


router.get("/", isLoggedIn, async (req, res, next) => {
    try {
      const response = await Budget.findAll({
        where: {
          userId: req.user.id,
        },
      });
      const budget = JSON.stringify(response);
      res.send(budget);
    } catch (err) {
      next(err);
    }
});

router.post("/", isLoggedIn, async (req, res, next) => {
    try {
      res
        .send(await Budget.create({ ...req.body, userId: req.user.id }))
        .status(201);
    } catch (err) {
      next(err);
    }
  });