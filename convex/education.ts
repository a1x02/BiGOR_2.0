import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Получение всех курсов (корневые документы)
export const getCourses = query({
  args: {
    authorId: v.optional(v.string()),
    publishedOnly: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = args.authorId || identity?.subject;

    if (!userId) {
      throw new Error("Not authenticated");
    }

    let documentsQuery = ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", undefined)
      )
      .filter((q) => q.eq(q.field("isArchived"), false));

    if (args.publishedOnly) {
      documentsQuery = documentsQuery.filter((q) =>
        q.eq(q.field("isPublished"), true)
      );
    }

    if (args.category) {
      documentsQuery = documentsQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    const courses = await documentsQuery.order("desc").collect();
    return courses;
  },
});

// Получение всех опубликованных курсов для гостевого доступа
export const getPublishedCourses = query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let coursesQuery = ctx.db
      .query("documents")
      .filter((q) =>
        q.and(
          q.eq(q.field("parentDocument"), undefined),
          q.eq(q.field("isArchived"), false),
          q.eq(q.field("isPublished"), true)
        )
      );

    if (args.category) {
      coursesQuery = coursesQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    if (args.difficulty) {
      coursesQuery = coursesQuery.filter((q) =>
        q.eq(q.field("difficulty"), args.difficulty)
      );
    }

    const courses = await coursesQuery.order("desc").take(args.limit || 50);

    return courses;
  },
});

// Получение лекций курса (вложенные документы)
export const getCourseLectures = query({
  args: {
    courseId: v.id("documents"),
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let lecturesQuery = ctx.db
      .query("documents")
      .filter((q) =>
        q.and(
          q.eq(q.field("parentDocument"), args.courseId),
          q.eq(q.field("isArchived"), false)
        )
      );

    if (args.publishedOnly) {
      lecturesQuery = lecturesQuery.filter((q) =>
        q.eq(q.field("isPublished"), true)
      );
    }

    const lectures = await lecturesQuery.order("asc").collect();

    // Сортируем по полю order, если оно есть
    return lectures.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  },
});

// Создание курса (корневой документ)
export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const course = await ctx.db.insert("documents", {
      title: args.title,
      description: args.description,
      category: args.category,
      difficulty: args.difficulty,
      estimatedDuration: args.estimatedDuration,
      tags: args.tags,
      parentDocument: undefined, // корневой документ = курс
      userId,
      isArchived: false,
      isPublished: false,
    });

    return course;
  },
});

// Создание лекции (вложенный документ)
export const createLecture = mutation({
  args: {
    title: v.string(),
    courseId: v.id("documents"),
    order: v.optional(v.number()),
    duration: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Проверяем, что курс принадлежит пользователю
    const course = await ctx.db.get(args.courseId);
    if (
      !course ||
      course.userId !== userId ||
      course.parentDocument !== undefined
    ) {
      throw new Error("Unauthorized or invalid course");
    }

    const lecture = await ctx.db.insert("documents", {
      title: args.title,
      order: args.order,
      duration: args.duration,
      attachments: args.attachments,
      parentDocument: args.courseId, // вложенный документ = лекция
      userId,
      isArchived: false,
      isPublished: false,
    });

    return lecture;
  },
});

// Обновление курса
export const updateCourse = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const existingCourse = await ctx.db.get(args.id);

    if (!existingCourse) {
      throw new Error("Course not found");
    }

    if (
      existingCourse.userId !== userId ||
      existingCourse.parentDocument !== undefined
    ) {
      throw new Error("Unauthorized or not a course");
    }

    const { id, ...updateData } = args;

    const course = await ctx.db.patch(args.id, updateData);
    return course;
  },
});

// Обновление лекции
export const updateLecture = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    order: v.optional(v.number()),
    duration: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const existingLecture = await ctx.db.get(args.id);

    if (!existingLecture) {
      throw new Error("Lecture not found");
    }

    if (
      existingLecture.userId !== userId ||
      existingLecture.parentDocument === undefined
    ) {
      throw new Error("Unauthorized or not a lecture");
    }

    const { id, ...updateData } = args;

    const lecture = await ctx.db.patch(args.id, updateData);
    return lecture;
  },
});

// Публикация/отмена публикации курса
export const toggleCoursePublish = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const existingCourse = await ctx.db.get(args.id);

    if (!existingCourse) {
      throw new Error("Course not found");
    }

    if (
      existingCourse.userId !== userId ||
      existingCourse.parentDocument !== undefined
    ) {
      throw new Error("Unauthorized or not a course");
    }

    const course = await ctx.db.patch(args.id, {
      isPublished: !existingCourse.isPublished,
    });

    return course;
  },
});

// Публикация/отмена публикации лекции
export const toggleLecturePublish = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const existingLecture = await ctx.db.get(args.id);

    if (!existingLecture) {
      throw new Error("Lecture not found");
    }

    if (
      existingLecture.userId !== userId ||
      existingLecture.parentDocument === undefined
    ) {
      throw new Error("Unauthorized or not a lecture");
    }

    const lecture = await ctx.db.patch(args.id, {
      isPublished: !existingLecture.isPublished,
    });

    return lecture;
  },
});

// Получение категорий курсов
export const getCourseCategories = query({
  handler: async (ctx) => {
    const courses = await ctx.db
      .query("documents")
      .filter((q) =>
        q.and(
          q.eq(q.field("parentDocument"), undefined),
          q.eq(q.field("isArchived"), false),
          q.eq(q.field("isPublished"), true)
        )
      )
      .collect();

    const categories = [
      ...new Set(courses.map((course) => course.category).filter(Boolean)),
    ];
    return categories;
  },
});

// Отслеживание просмотра курса
export const trackCourseView = mutation({
  args: {
    courseId: v.id("documents"),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const viewerId = identity?.subject;

    await ctx.db.insert("courseViews", {
      courseId: args.courseId,
      viewerId,
      viewedAt: Date.now(),
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    });

    return { success: true };
  },
});
