import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  songs: defineTable({
    title: v.string(),
    storageId: v.id("_storage"),
    artist: v.string(),
    album: v.string(),
  }),
  pins: defineTable({
    latitude: v.number(),
    longitude: v.number(),
    comment: v.string(),
    songId: v.id("songs"),
  }),
});
