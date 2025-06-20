import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Создание или обновление профиля студента
export const createOrUpdate = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        language: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Проверяем, существует ли уже студент
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStudent) {
      // Обновляем существующего студента
      const student = await ctx.db.patch(existingStudent._id, {
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        preferences: args.preferences,
      });

      return student;
    } else {
      // Создаем нового студента
      const student = await ctx.db.insert("students", {
        userId,
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        preferences: args.preferences,
        createdAt: Date.now(),
      });

      return student;
    }
  },
});

// Получение профиля студента
export const getProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const student = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return student;
  },
});

// Создание коллекции лекций
export const createCollection = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Проверяем, что студент существует
    const student = await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!student) {
      throw new Error("Student profile not found");
    }

    const collection = await ctx.db.insert("studentCollections", {
      studentId: userId,
      title: args.title,
      description: args.description,
      isPublic: args.isPublic,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return collection;
  },
});

// Получение коллекций студента
export const getCollections = query({
  args: {
    studentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = args.studentId || identity.subject;

    const collections = await ctx.db
      .query("studentCollections")
      .withIndex("by_student", (q) => q.eq("studentId", userId))
      .order("desc")
      .collect();

    return collections;
  },
});

// Получение публичных коллекций
export const getPublicCollections = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("studentCollections")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take(args.limit || 20);

    return collections;
  },
});

// Добавление лекции в коллекцию
export const addLectureToCollection = mutation({
  args: {
    collectionId: v.id("studentCollections"),
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Проверяем, что коллекция принадлежит студенту
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.studentId !== userId) {
      throw new Error("Unauthorized");
    }

    // Проверяем, что лекция опубликована
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture || !lecture.isPublished) {
      throw new Error("Lecture not available");
    }

    // Проверяем, что лекция еще не добавлена в коллекцию
    const existing = await ctx.db
      .query("collectionLectures")
      .withIndex("by_collection", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .filter((q) => q.eq(q.field("lectureId"), args.lectureId))
      .first();

    if (existing) {
      throw new Error("Lecture already in collection");
    }

    // Получаем максимальный порядок в коллекции
    const maxOrder = await ctx.db
      .query("collectionLectures")
      .withIndex("by_collection", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .order("desc")
      .first();

    const order = maxOrder ? maxOrder.order + 1 : 1;

    const collectionLecture = await ctx.db.insert("collectionLectures", {
      collectionId: args.collectionId,
      lectureId: args.lectureId,
      order,
      addedAt: Date.now(),
    });

    return collectionLecture;
  },
});

// Удаление лекции из коллекции
export const removeLectureFromCollection = mutation({
  args: {
    collectionId: v.id("studentCollections"),
    lectureId: v.id("lectures"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Проверяем, что коллекция принадлежит студенту
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.studentId !== userId) {
      throw new Error("Unauthorized");
    }

    // Находим и удаляем связь
    const collectionLecture = await ctx.db
      .query("collectionLectures")
      .withIndex("by_collection", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .filter((q) => q.eq(q.field("lectureId"), args.lectureId))
      .first();

    if (collectionLecture) {
      await ctx.db.delete(collectionLecture._id);
    }

    return { success: true };
  },
});

// Получение лекций коллекции
export const getCollectionLectures = query({
  args: {
    collectionId: v.id("studentCollections"),
  },
  handler: async (ctx, args) => {
    const collectionLectures = await ctx.db
      .query("collectionLectures")
      .withIndex("by_collection_order", (q) =>
        q.eq("collectionId", args.collectionId)
      )
      .order("asc")
      .collect();

    // Получаем данные лекций
    const lectures = await Promise.all(
      collectionLectures.map(async (cl) => {
        const lecture = await ctx.db.get(cl.lectureId);
        return {
          ...cl,
          lecture,
        };
      })
    );

    return lectures.filter((item) => item.lecture); // Фильтруем удаленные лекции
  },
});

// Обновление коллекции
export const updateCollection = mutation({
  args: {
    id: v.id("studentCollections"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingCollection = await ctx.db.get(args.id);

    if (!existingCollection) {
      throw new Error("Collection not found");
    }

    if (existingCollection.studentId !== userId) {
      throw new Error("Unauthorized");
    }

    const { id, ...updateData } = args;

    const collection = await ctx.db.patch(args.id, {
      ...updateData,
      updatedAt: Date.now(),
    });

    return collection;
  },
});

// Удаление коллекции
export const removeCollection = mutation({
  args: { id: v.id("studentCollections") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingCollection = await ctx.db.get(args.id);

    if (!existingCollection) {
      throw new Error("Collection not found");
    }

    if (existingCollection.studentId !== userId) {
      throw new Error("Unauthorized");
    }

    // Удаляем все связи с лекциями
    const collectionLectures = await ctx.db
      .query("collectionLectures")
      .withIndex("by_collection", (q) => q.eq("collectionId", args.id))
      .collect();

    for (const cl of collectionLectures) {
      await ctx.db.delete(cl._id);
    }

    // Удаляем коллекцию
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
