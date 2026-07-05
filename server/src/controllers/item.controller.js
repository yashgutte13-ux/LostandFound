import Item from "../models/Item.js";
import User from "../models/User.js";
import { createColorSignature } from "../utils/imageSignature.js";
import { overallMatchScore } from "../utils/matching.js";
import { notifyUser } from "../utils/notifications.js";

async function findBestMatch(item) {
  const oppositeType = item.type === "lost" ? "found" : "lost";
  const candidates = await Item.find({
    type: oppositeType,
    status: { $in: ["verified", "matched"] },
    _id: { $ne: item._id }
  }).populate("reporter");

  return candidates
    .map((candidate) => ({ candidate, score: overallMatchScore(item, candidate) }))
    .filter((match) => match.score >= 62)
    .sort((a, b) => b.score - a.score)[0];
}

export async function createItem(req, res, next) {
  try {
    const image = req.file
      ? {
          url: `/uploads/${req.file.filename}`,
          filename: req.file.filename,
          colorSignature: createColorSignature(req.file)
        }
      : undefined;

    const item = await Item.create({
      ...req.body,
      image,
      reporter: req.user._id
    });

    const admins = await User.find({ role: "admin" });
    await Promise.all(admins.map((admin) => notifyUser({
      user: admin,
      title: "New report awaiting verification",
      message: `${req.user.name} reported a ${item.type} item: ${item.title}.`,
      link: "/admin"
    })));

    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
}

export async function listItems(req, res, next) {
  try {
    const { type, status, mine, q } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (mine === "true") filter.reporter = req.user._id;
    if (q) filter.$text = { $search: q };

    const items = await Item.find(filter)
      .populate("reporter", "name email phone department")
      .populate("matchedItem", "title type location image status")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function getItem(req, res, next) {
  try {
    const item = await Item.findById(req.params.id)
      .populate("reporter", "name email phone department")
      .populate("matchedItem");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (error) {
    next(error);
  }
}

export async function verifyItem(req, res, next) {
  try {
    const { status = "verified", adminNotes = "" } = req.body;
    const item = await Item.findById(req.params.id).populate("reporter");
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = status;
    item.adminNotes = adminNotes;
    await item.save();

    if (status === "verified") {
      const best = await findBestMatch(item);
      if (best) {
        item.status = "matched";
        item.matchedItem = best.candidate._id;
        item.matchScore = best.score;
        best.candidate.status = "matched";
        best.candidate.matchedItem = item._id;
        best.candidate.matchScore = best.score;
        await Promise.all([item.save(), best.candidate.save()]);

        await notifyUser({
          user: item.reporter,
          title: "Possible match found",
          message: `Your ${item.type} report "${item.title}" has a ${best.score}% match.`,
          link: `/items/${item._id}`
        });
        await notifyUser({
          user: best.candidate.reporter,
          title: "Possible match found",
          message: `Your ${best.candidate.type} report "${best.candidate.title}" has a ${best.score}% match.`,
          link: `/items/${best.candidate._id}`
        });
      } else {
        await notifyUser({
          user: item.reporter,
          title: "Report verified",
          message: `Your report "${item.title}" is now visible for matching.`,
          link: `/items/${item._id}`
        });
      }
    }

    res.json({ item });
  } catch (error) {
    next(error);
  }
}
