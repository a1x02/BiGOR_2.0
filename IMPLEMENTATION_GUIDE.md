# Руководство по реализации образовательной системы BiGOR 2.0

## Этапы разработки

### Этап 1: Базовая инфраструктура (1-2 недели)

- [x] Настройка Next.js проекта
- [x] Интеграция с Convex
- [x] Настройка аутентификации Clerk
- [x] Базовая схема базы данных
- [x] Основные UI компоненты

### Этап 2: Модуль редакторов (2-3 недели)

- [ ] Интерфейс создания курсов
- [ ] Редактор лекций с BlockNote
- [ ] Управление контентом (публикация, архивация)
- [ ] Загрузка файлов и изображений
- [ ] Предварительный просмотр

### Этап 3: Модуль гостевого доступа (1-2 недели)

- [ ] Каталог опубликованных курсов
- [ ] Фильтрация и поиск
- [ ] Просмотр лекций
- [ ] Аналитика просмотров

### Этап 4: Модуль студентов (2-3 недели)

- [ ] Регистрация и профиль студента
- [ ] Создание коллекций
- [ ] Добавление лекций в коллекции
- [ ] Отслеживание прогресса

### Этап 5: Тестирование и оптимизация (1-2 недели)

- [ ] Unit тесты
- [ ] Integration тесты
- [ ] Производительность
- [ ] Безопасность

## Структура папок

```
app/
├── (editor)/           # Модуль редакторов
│   ├── courses/        # Управление курсами
│   ├── lectures/       # Редактор лекций
│   └── analytics/      # Аналитика
├── (public)/           # Гостевой доступ
│   ├── courses/        # Каталог курсов
│   ├── lectures/       # Просмотр лекций
│   └── search/         # Поиск
├── (student)/          # Модуль студентов
│   ├── profile/        # Профиль
│   ├── collections/    # Коллекции
│   └── progress/       # Прогресс
└── api/                # API endpoints

components/
├── editor/             # Компоненты редактора
├── public/             # Компоненты публичного доступа
├── student/            # Компоненты студента
└── shared/             # Общие компоненты

convex/
├── courses.ts          # Функции для курсов
├── lectures.ts         # Функции для лекций
├── students.ts         # Функции для студентов
└── analytics.ts        # Аналитика
```

## Ключевые компоненты для реализации

### 1. Course Creator Component

```typescript
// components/editor/CourseCreator.tsx
interface CourseCreatorProps {
  onCourseCreated: (courseId: string) => void;
}

export const CourseCreator = ({ onCourseCreated }: CourseCreatorProps) => {
  // Форма создания курса
  // Валидация данных
  // Интеграция с Convex
};
```

### 2. Lecture Editor Component

```typescript
// components/editor/LectureEditor.tsx
interface LectureEditorProps {
  courseId: string;
  lectureId?: string;
  onSave: (lecture: Lecture) => void;
}

export const LectureEditor = ({
  courseId,
  lectureId,
  onSave,
}: LectureEditorProps) => {
  // BlockNote редактор
  // Автосохранение
  // Предварительный просмотр
};
```

### 3. Course Catalog Component

```typescript
// components/public/CourseCatalog.tsx
interface CourseCatalogProps {
  filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
  };
}

export const CourseCatalog = ({ filters }: CourseCatalogProps) => {
  // Список курсов
  // Фильтрация
  // Пагинация
};
```

### 4. Collection Builder Component

```typescript
// components/student/CollectionBuilder.tsx
interface CollectionBuilderProps {
  collectionId?: string;
  onSave: (collection: StudentCollection) => void;
}

export const CollectionBuilder = ({
  collectionId,
  onSave,
}: CollectionBuilderProps) => {
  // Создание/редактирование коллекции
  // Добавление лекций
  // Drag & drop для порядка
};
```

## API Endpoints

### Courses API

```typescript
// app/api/courses/route.ts
export async function GET(request: Request) {
  // Получение списка курсов с фильтрацией
}

export async function POST(request: Request) {
  // Создание нового курса
}
```

### Lectures API

```typescript
// app/api/courses/[courseId]/lectures/route.ts
export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  // Получение лекций курса
}

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  // Создание новой лекции
}
```

### Students API

```typescript
// app/api/students/collections/route.ts
export async function GET(request: Request) {
  // Получение коллекций студента
}

export async function POST(request: Request) {
  // Создание новой коллекции
}
```

## Хуки для работы с данными

### useCourses Hook

```typescript
// hooks/use-courses.ts
export const useCourses = () => {
  const createCourse = useMutation(api.courses.create);
  const updateCourse = useMutation(api.courses.update);
  const deleteCourse = useMutation(api.courses.remove);
  const publishCourse = useMutation(api.courses.togglePublish);

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    publishCourse,
  };
};
```

### useLectures Hook

```typescript
// hooks/use-lectures.ts
export const useLectures = (courseId: string) => {
  const lectures = useQuery(api.lectures.getByCourse, { courseId });
  const createLecture = useMutation(api.lectures.create);
  const updateLecture = useMutation(api.lectures.update);

  return {
    lectures,
    createLecture,
    updateLecture,
  };
};
```

### useStudentCollections Hook

```typescript
// hooks/use-student-collections.ts
export const useStudentCollections = () => {
  const collections = useQuery(api.students.getCollections);
  const createCollection = useMutation(api.students.createCollection);
  const addLecture = useMutation(api.students.addLectureToCollection);

  return {
    collections,
    createCollection,
    addLecture,
  };
};
```

## Стилизация и UI

### Tailwind CSS классы

```css
/* Общие стили для карточек курсов */
.course-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200;
}

/* Стили для редактора */
.editor-container {
  @apply border border-gray-200 dark:border-gray-700 rounded-lg p-4;
}

/* Стили для навигации */
.nav-item {
  @apply px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors;
}
```

### Темная тема

```typescript
// components/theme-provider.tsx
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
};
```

## Безопасность

### Валидация данных

```typescript
// lib/validations/course.ts
import { z } from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Слишком длинное название"),
  description: z.string().max(500, "Описание слишком длинное").optional(),
  category: z.string().min(1, "Категория обязательна"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedDuration: z
    .number()
    .min(1, "Длительность должна быть больше 0")
    .optional(),
  tags: z.array(z.string()).max(10, "Максимум 10 тегов").optional(),
});
```

### Проверка прав доступа

```typescript
// lib/auth/permissions.ts
export const checkCoursePermission = async (
  courseId: string,
  userId: string,
): Promise<boolean> => {
  const course = await convex.query(api.courses.getById, { id: courseId });
  return course?.authorId === userId;
};
```

## Производительность

### Оптимизация запросов

```typescript
// Использование индексов в Convex
export const getPublishedCourses = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("courses")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .filter((q) => q.eq(q.field("isArchived"), false));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    return await query.take(20);
  },
});
```

### Кэширование

```typescript
// lib/cache.ts
export const cacheCourse = (courseId: string, courseData: any) => {
  localStorage.setItem(
    `course_${courseId}`,
    JSON.stringify({
      data: courseData,
      timestamp: Date.now(),
    }),
  );
};
```

## Тестирование

### Unit тесты

```typescript
// __tests__/components/CourseCreator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseCreator } from '@/components/editor/CourseCreator';

describe('CourseCreator', () => {
  it('should create a course with valid data', async () => {
    const mockOnCourseCreated = jest.fn();
    render(<CourseCreator onCourseCreated={mockOnCourseCreated} />);

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Test Course' },
    });

    fireEvent.click(screen.getByText('Создать курс'));

    expect(mockOnCourseCreated).toHaveBeenCalled();
  });
});
```

### Integration тесты

```typescript
// __tests__/api/courses.test.ts
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

describe("Courses API", () => {
  it("should create and retrieve a course", async () => {
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    const courseId = await client.mutation(api.courses.create, {
      title: "Test Course",
      description: "Test Description",
    });

    const course = await client.query(api.courses.getById, { id: courseId });
    expect(course.title).toBe("Test Course");
  });
});
```

## Развертывание

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...
CONVEX_DEPLOY_KEY=...
EDGESTORE_ACCESS_KEY=...
EDGESTORE_SECRET_KEY=...
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key",
    "NEXT_PUBLIC_CONVEX_URL": "@convex-url",
    "CONVEX_DEPLOY_KEY": "@convex-deploy-key"
  }
}
```

## Мониторинг и аналитика

### Error Tracking

```typescript
// lib/error-tracking.ts
export const trackError = (error: Error, context?: any) => {
  console.error("Error:", error, context);
  // Интеграция с Sentry или другим сервисом
};
```

### Analytics

```typescript
// lib/analytics.ts
export const trackCourseView = (courseId: string, userId?: string) => {
  // Отправка данных в аналитику
  fetch("/api/analytics/course-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, userId }),
  });
};
```

## Рекомендации по разработке

1. **Начните с базовой функциональности** - создайте простой CRUD для курсов
2. **Используйте TypeScript** - для лучшей типизации и отладки
3. **Тестируйте на каждом этапе** - пишите тесты параллельно с кодом
4. **Следите за производительностью** - используйте React DevTools и Lighthouse
5. **Документируйте код** - комментируйте сложную логику
6. **Используйте Git Flow** - для организованной работы с ветками
7. **Регулярно деплойте** - для быстрого получения обратной связи

## Полезные ресурсы

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [BlockNote Documentation](https://www.blocknotejs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
