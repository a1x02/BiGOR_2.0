# Диаграмма связей образовательной системы BiGOR 2.0

## Общая архитектура системы

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[Editor Module]
        A --> C[Public Module]
        A --> D[Student Module]
        A --> E[Shared Components]
    end

    subgraph "Backend Layer"
        F[Convex Functions] --> G[Database]
        F --> H[File Storage]
        F --> I[Authentication]
    end

    subgraph "External Services"
        J[Clerk Auth]
        K[EdgeStore]
        L[Vercel Hosting]
    end

    B --> F
    C --> F
    D --> F
    I --> J
    H --> K
    A --> L
```

## Структура базы данных

```mermaid
erDiagram
    DOCUMENTS {
        string _id PK
        string title
        string userId FK
        boolean isArchived
        string parentDocument FK
        string content
        string coverImage
        string icon
        boolean isPublished
        array formulas
    }

    COURSES {
        string _id PK
        string title
        string description
        string authorId FK
        string coverImage
        boolean isPublished
        boolean isArchived
        string category
        string difficulty
        number estimatedDuration
        array tags
        number createdAt
        number updatedAt
    }

    LECTURES {
        string _id PK
        string title
        string content
        string courseId FK
        number order
        number duration
        boolean isPublished
        boolean isArchived
        array attachments
        number createdAt
        number updatedAt
    }

    STUDENTS {
        string _id PK
        string userId FK
        string email
        string name
        string avatar
        object preferences
        number createdAt
    }

    STUDENT_COLLECTIONS {
        string _id PK
        string studentId FK
        string title
        string description
        boolean isPublic
        number createdAt
        number updatedAt
    }

    COLLECTION_LECTURES {
        string _id PK
        string collectionId FK
        string lectureId FK
        number order
        number addedAt
    }

    COURSE_ENROLLMENTS {
        string _id PK
        string studentId FK
        string courseId FK
        number enrolledAt
        number completedAt
        number progress
    }

    LECTURE_PROGRESS {
        string _id PK
        string studentId FK
        string lectureId FK
        boolean isCompleted
        number completedAt
        number timeSpent
    }

    COURSE_VIEWS {
        string _id PK
        string courseId FK
        string viewerId FK
        number viewedAt
        string userAgent
        string ipAddress
    }

    DICTIONARY {
        string _id PK
        string word
        string userId FK
    }

    %% Связи между таблицами
    DOCUMENTS ||--o{ DOCUMENTS : "parentDocument"
    COURSES ||--o{ LECTURES : "courseId"
    STUDENTS ||--o{ STUDENT_COLLECTIONS : "studentId"
    STUDENT_COLLECTIONS ||--o{ COLLECTION_LECTURES : "collectionId"
    LECTURES ||--o{ COLLECTION_LECTURES : "lectureId"
    STUDENTS ||--o{ COURSE_ENROLLMENTS : "studentId"
    COURSES ||--o{ COURSE_ENROLLMENTS : "courseId"
    STUDENTS ||--o{ LECTURE_PROGRESS : "studentId"
    LECTURES ||--o{ LECTURE_PROGRESS : "lectureId"
    COURSES ||--o{ COURSE_VIEWS : "courseId"
    STUDENTS ||--o{ COURSE_VIEWS : "viewerId"
    STUDENTS ||--o{ DICTIONARY : "userId"
```

## Поток данных в системе

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Convex
    participant D as Database
    participant E as External

    %% Редактор создает курс
    U->>F: Создать курс
    F->>C: courses.create()
    C->>D: INSERT courses
    D-->>C: course_id
    C-->>F: course_data
    F-->>U: Курс создан

    %% Редактор добавляет лекцию
    U->>F: Добавить лекцию
    F->>C: lectures.create()
    C->>D: INSERT lectures
    D-->>C: lecture_id
    C-->>F: lecture_data
    F-->>U: Лекция добавлена

    %% Редактор публикует курс
    U->>F: Опубликовать курс
    F->>C: courses.togglePublish()
    C->>D: UPDATE courses
    D-->>C: success
    C-->>F: updated_course
    F-->>U: Курс опубликован

    %% Гость просматривает курсы
    U->>F: Просмотр курсов
    F->>C: courses.getPublished()
    C->>D: SELECT courses
    D-->>C: courses_list
    C-->>F: courses_data
    F-->>U: Список курсов

    %% Студент создает коллекцию
    U->>F: Создать коллекцию
    F->>C: students.createCollection()
    C->>D: INSERT student_collections
    D-->>C: collection_id
    C-->>F: collection_data
    F-->>U: Коллекция создана

    %% Студент добавляет лекцию в коллекцию
    U->>F: Добавить лекцию в коллекцию
    F->>C: students.addLectureToCollection()
    C->>D: INSERT collection_lectures
    D-->>C: success
    C-->>F: success
    F-->>U: Лекция добавлена
```

## Модули и их взаимодействие

```mermaid
graph LR
    subgraph "Editor Module"
        A1[Course Creator]
        A2[Lecture Editor]
        A3[Content Manager]
        A4[Analytics Dashboard]
    end

    subgraph "Public Module"
        B1[Course Catalog]
        B2[Lecture Viewer]
        B3[Search & Filter]
        B4[Guest Access]
    end

    subgraph "Student Module"
        C1[Profile Management]
        C2[Collection Builder]
        C3[Progress Tracker]
        C4[Learning Dashboard]
    end

    subgraph "Shared Components"
        D1[Authentication]
        D2[Navigation]
        D3[UI Components]
        D4[File Upload]
    end

    A1 --> D1
    A2 --> D3
    A3 --> D4
    B1 --> D2
    B2 --> D3
    C1 --> D1
    C2 --> D3
    C3 --> D2
```

## Поток аутентификации (ИСПРАВЛЕННЫЙ)

```mermaid
flowchart TD
    A[Пользователь] --> B{Тип пользователя?}

    B -->|Редактор| C[Editor Module]
    B -->|Студент| D[Student Module]
    B -->|Гость| E[Public Module]

    C --> F[Создание курсов]
    C --> G[Редактирование лекций]
    C --> H[Управление контентом]

    D --> I[Профиль студента]
    D --> J[Мои коллекции]
    D --> K[Прогресс обучения]
    D --> L[Просмотр курсов]
    D --> M[Чтение лекций]
    D --> N[Поиск контента]

    E --> L
    E --> M
    E --> N

    F --> O[Convex Backend]
    G --> O
    H --> O
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O

    %% Показываем что студент имеет доступ к функциям гостя
    D -.->|Доступ к| L
    D -.->|Доступ к| M
    D -.->|Доступ к| N
```

## Иерархия доступа пользователей

```mermaid
graph TB
    subgraph "Уровни доступа"
        A[Гость] --> B[Студент]
        B --> C[Редактор]
    end

    subgraph "Функции гостя"
        D[Просмотр курсов]
        E[Чтение лекций]
        F[Поиск контента]
        G[Фильтрация]
    end

    subgraph "Дополнительные функции студента"
        H[Создание профиля]
        I[Создание коллекций]
        J[Добавление лекций в коллекции]
        K[Отслеживание прогресса]
        L[Персональные настройки]
    end

    subgraph "Функции редактора"
        M[Создание курсов]
        N[Редактирование лекций]
        O[Публикация контента]
        P[Аналитика и статистика]
        Q[Управление файлами]
    end

    A --> D
    A --> E
    A --> F
    A --> G

    B --> D
    B --> E
    B --> F
    B --> G
    B --> H
    B --> I
    B --> J
    B --> K
    B --> L

    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J
    C --> K
    C --> L
    C --> M
    C --> N
    C --> O
    C --> P
    C --> Q
```

## Архитектура безопасности

```mermaid
graph TB
    subgraph "Security Layers"
        A[Frontend Validation]
        B[API Authentication]
        C[Authorization Checks]
        D[Data Validation]
    end

    subgraph "Authentication Flow"
        E[User Login] --> F[Clerk Auth]
        F --> G[JWT Token]
        G --> H[Convex Auth]
        H --> I[User Context]
    end

    subgraph "Authorization Rules"
        J[Course Owner Check]
        K[Student Profile Check]
        L[Public Content Check]
        M[Collection Access Check]
    end

    A --> B
    B --> C
    C --> D
    I --> J
    I --> K
    I --> L
    I --> M
```

## Процесс создания и изучения курса

```mermaid
flowchart LR
    subgraph "Course Creation"
        A1[Editor Login] --> A2[Create Course]
        A2 --> A3[Add Lectures]
        A3 --> A4[Edit Content]
        A4 --> A5[Publish Course]
    end

    subgraph "Course Discovery"
        B1[Guest Access] --> B2[Browse Courses]
        B2 --> B3[View Course Details]
        B3 --> B4[Read Lectures]
    end

    subgraph "Student Learning"
        C1[Student Login] --> C2[Create Collection]
        C2 --> C3[Add Lectures to Collection]
        C3 --> C4[Study Progress]
        C4 --> C5[Track Completion]
    end

    A5 --> B1
    B4 --> C1
    C5 --> A1
```

## Технологическая архитектура

```mermaid
graph TB
    subgraph "Client Side"
        A[Next.js App]
        B[React Components]
        C[BlockNote Editor]
        D[Tailwind CSS]
    end

    subgraph "Server Side"
        E[Convex Functions]
        F[Database]
        G[File Storage]
        H[Auth Service]
    end

    subgraph "External Services"
        I[Clerk]
        J[EdgeStore]
        K[Vercel]
    end

    A --> E
    B --> E
    C --> E
    E --> F
    E --> G
    E --> H
    H --> I
    G --> J
    A --> K
```

## Матрица доступа пользователей

```mermaid
graph LR
    subgraph "Функции системы"
        A[Просмотр курсов]
        B[Чтение лекций]
        C[Поиск контента]
        D[Создание коллекций]
        E[Отслеживание прогресса]
        F[Создание курсов]
        G[Редактирование лекций]
        H[Публикация контента]
    end

    subgraph "Гость"
        I[✓ Просмотр]
        J[✓ Чтение]
        K[✓ Поиск]
        L[✗ Коллекции]
        M[✗ Прогресс]
        N[✗ Создание]
        O[✗ Редактирование]
        P[✗ Публикация]
    end

    subgraph "Студент"
        Q[✓ Просмотр]
        R[✓ Чтение]
        S[✓ Поиск]
        T[✓ Коллекции]
        U[✓ Прогресс]
        V[✗ Создание]
        W[✗ Редактирование]
        X[✗ Публикация]
    end

    subgraph "Редактор"
        Y[✓ Просмотр]
        Z[✓ Чтение]
        AA[✓ Поиск]
        BB[✓ Коллекции]
        CC[✓ Прогресс]
        DD[✓ Создание]
        EE[✓ Редактирование]
        FF[✓ Публикация]
    end

    A --> I
    A --> Q
    A --> Y

    B --> J
    B --> R
    B --> Z

    C --> K
    C --> S
    C --> AA

    D --> L
    D --> T
    D --> BB

    E --> M
    E --> U
    E --> CC

    F --> N
    F --> V
    F --> DD

    G --> O
    G --> W
    G --> EE

    H --> P
    H --> X
    H --> FF
```
