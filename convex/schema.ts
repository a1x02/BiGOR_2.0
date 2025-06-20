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
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    duration: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"])
    .index("by_published", ["isPublished"])
    .index("by_category", ["category"]),

  dictionary: defineTable({
    word: v.string(),
    userId: v.string(),
  }).index("by_user", ["userId"]),

  students: defineTable({
    userId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        language: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  studentCollections: defineTable({
    studentId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_student", ["studentId"]),

  collectionLectures: defineTable({
    collectionId: v.id("studentCollections"),
    lectureId: v.id("documents"),
    order: v.number(),
    addedAt: v.number(),
  })
    .index("by_collection", ["collectionId"])
    .index("by_collection_order", ["collectionId", "order"]),

  courseEnrollments: defineTable({
    studentId: v.string(),
    courseId: v.id("documents"),
    enrolledAt: v.number(),
    completedAt: v.optional(v.number()),
    progress: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_course", ["courseId"]),

  lectureProgress: defineTable({
    studentId: v.string(),
    lectureId: v.id("documents"),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    timeSpent: v.optional(v.number()),
  })
    .index("by_student", ["studentId"])
    .index("by_lecture", ["lectureId"]),

  courseViews: defineTable({
    courseId: v.id("documents"),
    viewerId: v.optional(v.string()),
    viewedAt: v.number(),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  })
    .index("by_course", ["courseId"])
    .index("by_viewer", ["viewerId"]),
});
