import { v } from "convex/values";
import { query } from "./_generated/server";

export const getAllSongs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("songs").collect();
  },
});

export const getSong = query({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAudioUrl = query({
  args: { id: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.id);
  },
});

export const getImageUrls = query({
  args: { ids: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls: Record<string, string> = {};
    for (const id of args.ids) {
      urls[id] = await ctx.storage.getUrl(id);
    }
    return urls;
  },
});
