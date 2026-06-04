import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getAll,
  create,
  update,
  remove,
  toggle,
  runNow,
} from "../controllers/recurringTransaction.controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/",           getAll);
router.post("/",          create);
router.put("/:id",        update);
router.delete("/:id",     remove);
router.patch("/:id/toggle", toggle);
router.post("/:id/run",   runNow);

export default router;
