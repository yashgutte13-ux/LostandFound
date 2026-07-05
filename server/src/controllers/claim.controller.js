import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import { notifyUser } from "../utils/notifications.js";

export async function createClaim(req, res, next) {
  try {
    const item = await Item.findById(req.body.item).populate("reporter");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const claim = await Claim.create({
      item: item._id,
      claimant: req.user._id,
      proof: req.body.proof
    });

    await notifyUser({
      user: item.reporter,
      title: "New claim submitted",
      message: `${req.user.name} submitted ownership proof for "${item.title}".`,
      link: `/items/${item._id}`
    });

    res.status(201).json({ claim });
  } catch (error) {
    next(error);
  }
}

export async function listClaims(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { claimant: req.user._id };
    const claims = await Claim.find(filter)
      .populate("item", "title type status image location")
      .populate("claimant", "name email phone department")
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (error) {
    next(error);
  }
}

export async function reviewClaim(req, res, next) {
  try {
    const { status, adminNotes = "" } = req.body;
    const claim = await Claim.findById(req.params.id)
      .populate("claimant")
      .populate("item");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    claim.status = status;
    claim.adminNotes = adminNotes;
    await claim.save();

    if (status === "approved") {
      claim.item.status = "claimed";
      await claim.item.save();
    }

    await notifyUser({
      user: claim.claimant,
      title: `Claim ${status}`,
      message: `Your claim for "${claim.item.title}" was ${status}.`,
      link: `/items/${claim.item._id}`
    });

    res.json({ claim });
  } catch (error) {
    next(error);
  }
}
