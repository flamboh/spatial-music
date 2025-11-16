import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  songs: defineTable({
    title: v.string(),
    audioStorageId: v.id("_storage"),
    imageStorageId: v.id("_storage"),
    artist: v.string(),
    album: v.string(),
  }).index("by_title", ["title"]),
  pins: defineTable({
    latitude: v.number(),
    longitude: v.number(),
    comment: v.string(),
    songId: v.id("songs"),
  }).index("by_song_id", ["songId"]),
});
