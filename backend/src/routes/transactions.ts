import { Router } from "express";
import Transaction from "../models/Transaction.js";
import { AuthRequest, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const type = req.query.type as string | undefined;
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  const query: Record<string, unknown> = { user: req.user!.userId };
  if (type === "income" || type === "expense") query.type = type;
  if (category) query.category = category;
  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    query.date = dateFilter;
  }
  if (search) {
    const rx = new RegExp(search, "i");
    query.$or = [{ category: rx }, { source: rx }, { note: rx }];
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return res.json({ transactions });
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { type, amount, category, source, note, date } = req.body;

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ error: "Type must be income or expense." });
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0." });
    }
    if (!category || !String(category).trim()) {
      return res.status(400).json({ error: "Category is required." });
    }

    const transaction = await Transaction.create({
      user: req.user!.userId,
      type,
      amount: amt,
      category: String(category).trim(),
      source: source ? String(source).trim() : "",
      note: note ? String(note).trim() : "",
      date: date ? new Date(date) : new Date(),
    });

    return res.status(201).json({ transaction });
  } catch (e) {
    console.error("create transaction error", e);
    return res.status(500).json({ error: "Could not save entry. Please try again." });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const update: Record<string, unknown> = {};
    const body = req.body;

    if (body.type === "income" || body.type === "expense") update.type = body.type;
    if (body.amount !== undefined) {
      const amt = Number(body.amount);
      if (!amt || amt <= 0) {
        return res.status(400).json({ error: "Amount must be greater than 0." });
      }
      update.amount = amt;
    }
    if (body.category !== undefined) update.category = String(body.category).trim();
    if (body.source !== undefined) update.source = String(body.source).trim();
    if (body.note !== undefined) update.note = String(body.note).trim();
    if (body.date !== undefined) update.date = new Date(body.date);

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.userId },
      update,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: "Entry not found." });
    }

    return res.json({ transaction });
  } catch (e) {
    console.error("update transaction error", e);
    return res.status(500).json({ error: "Update failed." });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const deleted = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user!.userId,
  });

  if (!deleted) {
    return res.status(404).json({ error: "Entry not found." });
  }

  return res.json({ ok: true });
});

export default router;
