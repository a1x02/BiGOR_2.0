import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const getWords = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const words = await ctx.db
      .query("dictionary")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return words;
  },
});

export const addWord = mutation({
  args: { word: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const word = await ctx.db.insert("dictionary", {
      word: args.word,
      userId,
    });

    return word;
  },
});

export const updateWord = mutation({
  args: { id: v.id("dictionary"), word: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingWord = await ctx.db.get(args.id);

    if (!existingWord) {
      throw new Error("Word not found");
    }

    if (existingWord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const word = await ctx.db.patch(args.id, {
      word: args.word,
    });

    return word;
  },
});

export const deleteWord = mutation({
  args: { id: v.id("dictionary") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingWord = await ctx.db.get(args.id);

    if (!existingWord) {
      throw new Error("Word not found");
    }

    if (existingWord.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
}); 