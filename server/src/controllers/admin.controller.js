import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

export async function dashboard(req, res, next) {
  try {
    const [users, pendingItems, verifiedItems, matchedItems, pendingClaims] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ status: "pending" }),
      Item.countDocuments({ status: "verified" }),
      Item.countDocuments({ status: "matched" }),
      Claim.countDocuments({ status: "pending" })
    ]);

    res.json({
      stats: { users, pendingItems, verifiedItems, matchedItems, pendingClaims }
    });
  } catch (error) {
    next(error);
  }
}
