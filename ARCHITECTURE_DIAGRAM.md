# Диаграмма связей образовательной системы BiGOR 2.0

## Общая архитектура системы

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App] --> B[Editor Module - УЖЕ РЕАЛИЗОВАН]
        A --> C[Public Module - НОВЫЙ]
        A --> D[Student Module - НОВЫЙ]
        A --> E[Shared Components]
    end

    subgraph "Backend Layer"
        F[Convex Functions] --> G[Database - Documents]
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

## Структура базы данных (ОБНОВЛЕННАЯ)

```mermaid
erDiagram
    DOCUMENTS {
        string _id PK
        string title
        string userId FK
        boolean isArchived
        string parentDocument FK "null=курс, courseId=лекция"
        string content
        string coverImage
        string icon
        boolean isPublished
        array formulas
        string description "для курсов"
        string category "для курсов"
        string difficulty "для курсов"
        number estimatedDuration "для курсов"
        array tags "для курсов"
        number order "для лекций"
        number duration "для лекций"
        array attachments "для лекций"
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
        string lectureId FK "ссылка на documents"
        number order
        number addedAt
    }

    COURSE_ENROLLMENTS {
        string _id PK
        string studentId FK
        string courseId FK "ссылка на documents"
        number enrolledAt
        number completedAt
        number progress
    }

    LECTURE_PROGRESS {
        string _id PK
        string studentId FK
        string lectureId FK "ссылка на documents"
        boolean isCompleted
        number completedAt
        number timeSpent
    }

    COURSE_VIEWS {
        string _id PK
        string courseId FK "ссылка на documents"
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
    DOCUMENTS ||--o{ DOCUMENTS : "parentDocument (курс->лекции)"
    STUDENTS ||--o{ STUDENT_COLLECTIONS : "studentId"
    STUDENT_COLLECTIONS ||--o{ COLLECTION_LECTURES : "collectionId"
    DOCUMENTS ||--o{ COLLECTION_LECTURES : "lectureId"
    STUDENTS ||--o{ COURSE_ENROLLMENTS : "studentId"
    DOCUMENTS ||--o{ COURSE_ENROLLMENTS : "courseId"
    STUDENTS ||--o{ LECTURE_PROGRESS : "studentId"
    DOCUMENTS ||--o{ LECTURE_PROGRESS : "lectureId"
    DOCUMENTS ||--o{ COURSE_VIEWS : "courseId"
    STUDENTS ||--o{ COURSE_VIEWS : "viewerId"
    STUDENTS ||--o{ DICTIONARY : "userId"
```

## Поток данных в системе (ОБНОВЛЕННЫЙ)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Convex
    participant D as Database
    participant E as External

    %% Редактор создает курс (уже реализовано)
    U->>F: Создать курс
    F->>C: documents.create() (parentDocument=null)
    C->>D: INSERT documents
    D-->>C: course_id
    C-->>F: course_data
    F-->>U: Курс создан

    %% Редактор добавляет лекцию (уже реализовано)
    U->>F: Добавить лекцию
    F->>C: documents.create() (parentDocument=courseId)
    C->>D: INSERT documents
    D-->>C: lecture_id
    C-->>F: lecture_data
    F-->>U: Лекция добавлена

    %% Редактор публикует курс (уже реализовано)
    U->>F: Опубликовать курс
    F->>C: documents.update() (isPublished=true)
    C->>D: UPDATE documents
    D-->>C: success
    C-->>F: updated_course
    F-->>U: Курс опубликован

    %% Гость просматривает курсы (новый функционал)
    U->>F: Просмотр курсов
    F->>C: education.getPublishedCourses()
    C->>D: SELECT documents WHERE parentDocument=null AND isPublished=true
    D-->>C: courses_list
    C-->>F: courses_data
    F-->>U: Список курсов

    %% Студент создает коллекцию (новый функционал)
    U->>F: Создать коллекцию
    F->>C: students.createCollection()
    C->>D: INSERT student_collections
    D-->>C: collection_id
    C-->>F: collection_data
    F-->>U: Коллекция создана

    %% Студент добавляет лекцию в коллекцию (новый функционал)
    U->>F: Добавить лекцию в коллекцию
    F->>C: students.addLectureToCollection()
    C->>D: INSERT collection_lectures
    D-->>C: success
    C-->>F: success
    F-->>U: Лекция добавлена
```

## Модули и их взаимодействие (ОБНОВЛЕННОЕ)

```mermaid
graph LR
    subgraph "Editor Module - УЖЕ РЕАЛИЗОВАН"
        A1[Document Creator]
        A2[BlockNote Editor]
        A3[Document Manager]
        A4[Publish/Archive]
    end

    subgraph "Public Module - НОВЫЙ"
        B1[Course Catalog]
        B2[Lecture Viewer]
        B3[Search & Filter]
        B4[Guest Access]
    end

    subgraph "Student Module - НОВЫЙ"
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

## Поток аутентификации (ОБНОВЛЕННЫЙ)

```mermaid
flowchart TD
    A[Пользователь] --> B{Тип пользователя?}

    B -->|Редактор| C[Editor Module - УЖЕ РЕАЛИЗОВАН]
    B -->|Студент| D[Student Module - НОВЫЙ]
    B -->|Гость| E[Public Module - НОВЫЙ]

    C --> F[Создание документов]
    C --> G[Редактирование с BlockNote]
    C --> H[Управление контентом]
    C --> I[Публикация/архивация]

    D --> J[Профиль студента]
    D --> K[Мои коллекции]
    D --> L[Прогресс обучения]
    D --> M[Просмотр курсов]
    D --> N[Чтение лекций]
    D --> O[Поиск контента]

    E --> M
    E --> N
    E --> O

    F --> P[Convex Backend]
    G --> P
    H --> P
    I --> P
    J --> P
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P

    %% Показываем что студент имеет доступ к функциям гостя
    D -.->|Доступ к| M
    D -.->|Доступ к| N
    D -.->|Доступ к| O
```

## Иерархия доступа пользователей (ОБНОВЛЕННАЯ)

```mermaid
graph TB
    subgraph "Уровни доступа"
        A[Гость] --> B[Студент]
        B --> C[Редактор]
    end

    subgraph "Функции гостя - НОВЫЕ"
        D[Просмотр опубликованных курсов]
        E[Чтение опубликованных лекций]
        F[Поиск контента]
        G[Фильтрация по категориям]
    end

    subgraph "Дополнительные функции студента - НОВЫЕ"
        H[Создание профиля]
        I[Создание коллекций]
        J[Добавление лекций в коллекции]
        K[Отслеживание прогресса]
        L[Персональные настройки]
    end

    subgraph "Функции редактора - УЖЕ РЕАЛИЗОВАНЫ"
        M[Создание документов-курсов]
        N[Редактирование с BlockNote]
        O[Публикация контента]
        P[Архивация документов]
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
        J[Document Owner Check]
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

## Процесс создания и изучения курса (ОБНОВЛЕННЫЙ)

```mermaid
flowchart LR
    subgraph "Course Creation - УЖЕ РЕАЛИЗОВАНО"
        A1[Editor Login] --> A2[Create Document (Course)]
        A2 --> A3[Add Child Documents (Lectures)]
        A3 --> A4[Edit with BlockNote]
        A4 --> A5[Publish Course]
    end

    subgraph "Course Discovery - НОВЫЙ"
        B1[Guest Access] --> B2[Browse Published Courses]
        B2 --> B3[View Course Details]
        B3 --> B4[Read Published Lectures]
    end

    subgraph "Student Learning - НОВЫЙ"
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
        C[BlockNote Editor - УЖЕ РЕАЛИЗОВАН]
        D[Tailwind CSS]
    end

    subgraph "Server Side"
        E[Convex Functions]
        F[Database - Documents]
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

## Матрица доступа пользователей (ОБНОВЛЕННАЯ)

```mermaid
graph LR
    subgraph "Функции системы"
        A[Просмотр курсов]
        B[Чтение лекций]
        C[Поиск контента]
        D[Создание коллекций]
        E[Отслеживание прогресса]
        F[Создание документов]
        G[Редактирование с BlockNote]
        H[Публикация контента]
    end

    subgraph "Гость"
        I[✓ Просмотр опубликованных]
        J[✓ Чтение опубликованных]
        K[✓ Поиск]
        L[✗ Коллекции]
        M[✗ Прогресс]
        N[✗ Создание]
        O[✗ Редактирование]
        P[✗ Публикация]
    end

    subgraph "Студент"
        Q[✓ Просмотр опубликованных]
        R[✓ Чтение опубликованных]
        S[✓ Поиск]
        T[✓ Коллекции]
        U[✓ Прогресс]
        V[✗ Создание]
        W[✗ Редактирование]
        X[✗ Публикация]
    end

    subgraph "Редактор"
        Y[✓ Просмотр всех]
        Z[✓ Чтение всех]
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

## Структура документов в системе

```mermaid
graph TD
    subgraph "Иерархия документов"
        A[Корневые документы - КУРСЫ] --> B[Вложенные документы - ЛЕКЦИИ]
        B --> C[Вложенные документы - ПОДЛЕКЦИИ]
    end

    subgraph "Пример структуры"
        D[Курс: "Основы программирования"] --> E[Лекция 1: "Введение в Python"]
        D --> F[Лекция 2: "Переменные и типы данных"]
        D --> G[Лекция 3: "Условия и циклы"]
        E --> H[Подлекция 1.1: "Установка Python"]
        E --> I[Подлекция 1.2: "Первая программа"]
    end

    subgraph "Поля документов"
        J[Общие поля: title, userId, isArchived, isPublished]
        K[Поля курсов: description, category, difficulty, tags]
        L[Поля лекций: order, duration, attachments]
    end
```
