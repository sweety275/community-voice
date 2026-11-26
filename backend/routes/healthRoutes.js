import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Community Voice backend is running!",
    project: "Community Voice"
  });
});

export default router;