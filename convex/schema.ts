import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    formulas: v.optional(
      v.array(
        v.object({
          id: v.string(),
          formula: v.string(),
          position: v.number(),
        })
      )
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  dictionary: defineTable({
    word: v.string(),
    userId: v.string(),
  })
    .index("by_user", ["userId"]),
});
