const router = require("express").Router();
const {
  models: { Goal, Budget },
} = require("../db");
const { isLoggedIn } = require("../middleware");

module.exports = router;

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const response = await Goal.findAll({
      where: {
        userId: req.user.id,
      },
    });
    const goals = JSON.stringify(response);
    res.send(goals);
  } catch (err) {
    next(err);
  }
});

router.post("/", isLoggedIn, async (req, res, next) => {
  try {
    res
      .send(await Goal.create({ ...req.body, userId: req.user.id }))
      .status(201);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const goal = await Goal.findByPk(req.params.id);

    const budget = await Budget.findOne({
      where: {
        userId: req.user.id,
      },
    });

    const newTarget = goal.target - req.body.applied * 1;
    const newBudget = budget.amount - req.body.applied * 1;

    if (newTarget <= 0) {
      res.send(
        await Promise.all([
          goal.update({ target: 0, reached: true }),
          budget.update({ amount: newBudget }),
        ])
      );
    } else {
      res.send(
        await Promise.all([
          goal.update({ target: newTarget }),
          budget.update({ amount: newBudget }),
        ])
      );
    }
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const goal = await Goal.findByPk(req.params.id);
    await goal.destroy();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});
