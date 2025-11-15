import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pins").collect();
  },
});

export const createPin = mutation({
  args: {
    id: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const newPinId = await ctx.db.insert("pins", {
      latitude: args.latitude,
      longitude: args.longitude,
      comment: args.comment,
    });
    return newPinId;
  },
});
