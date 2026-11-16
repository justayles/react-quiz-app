import type { Question } from '../types';

export const prismaQuestions = [
  {
    id: 'prisma-001',
    tech: 'prisma',
    topic: 'schema',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'Where does @relation(fields, references) belong, and what do the two arguments name?',
    options: [
      'On the model that stores the foreign key. fields lists that local column, and references lists the field it points at on the other model.',
      'On the model that does not store the foreign key. fields lists the other model primary key, and references lists the list field.',
      'On both sides of the relation. Each side repeats the same fields and references so Prisma can check them.',
      'Only inside @@map. fields renames the column in the database, and references renames the table.',
    ],
    correctIndex: 0,
    explanation: {
      answer: '@relation(fields, references) belongs on the model that stores the foreign key.',
      why: 'A foreign key is the column that points at a row in another table. In the Prisma schema that column is a scalar field, such as authorId, on the model that stores it. @relation(fields, references) sits on that same side: fields names the local column, and references names the field it points at, usually id on the other model. The other side of a one-to-many relation is only a list, such as posts Post[], and that list does not repeat fields or references. Prisma uses the pair to create the database foreign key and the client types.',
      wrong: [
        {
          option: 'On the model that does not store the foreign key. fields lists the other model primary key, and references lists the list field.',
          reason: 'The list side is easy to treat as the owner because it names the collection. The arguments describe the column that is actually stored, so they go on the model that holds that column.',
        },
        {
          option: 'On both sides of the relation. Each side repeats the same fields and references so Prisma can check them.',
          reason: 'Both models take part in the relation, so repeating the attribute looks thorough. Prisma accepts fields and references only on the side that stores the foreign key.',
        },
        {
          option: 'Only inside @@map. fields renames the column in the database, and references renames the table.',
          reason: '@@map and @map do rename the table or column in the database. @relation(fields, references) describes which local column points at which field, and it is not a rename.',
        },
      ],
      example: {
        lang: 'ts',
        source: "model User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId Int\n}",
      },
      remember: 'Put @relation(fields, references) on the side that stores the foreign key.',
    },
  },
  {
    id: 'prisma-002',
    tech: 'prisma',
    topic: 'schema',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'Deleting a user should keep the posts and clear their author. prisma validate rejects this schema. What is wrong?',
    code: {
      lang: 'ts',
      source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id], onDelete: SetNull)\n  authorId Int\n}",
    },
    options: [
      'SetNull is the default for every relation, so naming it makes the foreign key required and validation fails.',
      'onDelete: SetNull requires an optional foreign key. authorId is a required Int, so the database cannot store null when the user disappears.',
      'SetNull deletes the posts and then nulls the user id. The list side on User must say onDelete: SetNull instead.',
      'The relation is missing references. SetNull only works when references is omitted and fields points at the primary key.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'SetNull is illegal here because authorId is required, so it cannot be cleared.',
      why: 'onDelete says what the database should do to dependent rows when the parent row is deleted. SetNull means write null into the foreign key and keep the post. A foreign key is the column that points at the parent, and a required Int cannot hold null, so Prisma rejects SetNull unless that column is optional. author and authorId both need the question mark. Cascade would delete the posts instead, and Restrict would block the user delete while posts still exist. Those are different actions from the one this schema asked for.',
      wrong: [
        {
          option: 'SetNull is the default for every relation, so naming it makes the foreign key required and validation fails.',
          reason: 'Naming an action does not change whether the column is required. The failure is that SetNull needs a column that is allowed to be null, and this authorId is not.',
        },
        {
          option: 'SetNull deletes the posts and then nulls the user id. The list side on User must say onDelete: SetNull instead.',
          reason: 'SetNull keeps the dependent rows and clears the foreign key. It does not delete posts, and the action belongs on the side that stores authorId.',
        },
        {
          option: 'The relation is missing references. SetNull only works when references is omitted and fields points at the primary key.',
          reason: 'The fields and references pair is already present and points authorId at User.id. The referential action is the part that does not match a required column.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int     @id @default(autoincrement())\n  title    String\n  author   User?   @relation(fields: [authorId], references: [id], onDelete: SetNull)\n  authorId Int?\n}",
      },
      example: {
        lang: 'ts',
        source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int     @id @default(autoincrement())\n  title    String\n  author   User?   @relation(fields: [authorId], references: [id], onDelete: SetNull)\n  authorId Int?\n}",
      },
      remember: 'onDelete: SetNull is valid only when the foreign key is optional.',
    },
  },
  {
    id: 'prisma-003',
    tech: 'prisma',
    topic: 'schema',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Note.updatedAt is DateTime? with @updatedAt and no @default. This create does not pass updatedAt. What is created.updatedAt immediately after the insert?',
    code: {
      lang: 'ts',
      source: "const created = await prisma.note.create({\n  data: {\n    title: 'Draft',\n  },\n  select: {\n    title: true,\n    updatedAt: true,\n  },\n});",
    },
    options: [
      'The current time. @updatedAt writes the timestamp on create and again on every update.',
      'The call throws, because a DateTime field must be present in data even when it is optional.',
      'Null. @updatedAt changes the field when the row is updated, and create leaves it empty unless the field also has a default.',
      'The field is omitted from the result. select skips a timestamp that the insert did not set.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'created.updatedAt is null. @updatedAt does not fill the value on create.',
      why: '@updatedAt tells Prisma Client to set that column to the current time when a row is updated. It does not run on create. This field is optional and has no default, so the insert stores null and the selected result is null. A default is a value used when the write omits the field. Adding @default(now()) as well makes create store the current time, and @updatedAt still refreshes it on a later update. The create call is valid because the field is optional, so Prisma does not require it in data.',
      wrong: [
        {
          option: 'The current time. @updatedAt writes the timestamp on create and again on every update.',
          reason: 'The attribute name sounds like it stamps the row at every write, including the first one. Create does not set it unless you also give the field a default.',
        },
        {
          option: 'The call throws, because a DateTime field must be present in data even when it is optional.',
          reason: 'A required DateTime without a default does have to be supplied. This field is DateTime?, so omitting it is allowed and stores null.',
        },
        {
          option: 'The field is omitted from the result. select skips a timestamp that the insert did not set.',
          reason: 'select returns every field you named, including one whose value is null. A null column is still part of the result object.',
        },
      ],
      example: {
        lang: 'ts',
        source: "const created = await prisma.note.create({\n  data: {\n    title: 'Draft',\n  },\n  select: {\n    title: true,\n    updatedAt: true,\n  },\n});\n\nconst stamp = created.updatedAt;",
      },
      remember: '@updatedAt changes on update. It is not set on create unless the field also has a default.',
    },
  },
  {
    id: 'prisma-004',
    tech: 'prisma',
    topic: 'schema',
    kind: 'concept',
    difficulty: 'expert',
    prompt: 'What is the difference between an implicit many-to-many and an explicit many-to-many?',
    options: [
      'An implicit many-to-many is a join model with its own foreign keys. An explicit one is two list fields, and Prisma hides the join table.',
      'An implicit many-to-many stores a foreign-key scalar on both models. An explicit one cannot have extra columns, so the join is done with a raw query.',
      'They generate the same client API. Explicit only means you added @relation(fields, references) on one of the list fields.',
      'An implicit many-to-many is two list fields and no foreign-key scalar. Prisma manages the join table. An explicit many-to-many is a join model you write, with a foreign key to each side.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Implicit many-to-many is two lists and no foreign-key scalar. Explicit many-to-many is a join model.',
      why: 'A many-to-many relation means one post can link to many tags and one tag can link to many posts. The database stores those links in a join table, a table whose rows are pairs of ids. An implicit relation is only two list fields, such as tags Tag[] and posts Post[], and neither model has a foreign-key scalar for the other. A foreign key is a column that points at another row. Prisma creates the join table for you, and you cannot add your own columns to it. An explicit relation uses a join model you write, with a foreign key to each side, when the link needs its own fields such as assignedAt.',
      wrong: [
        {
          option: 'An implicit many-to-many is a join model with its own foreign keys. An explicit one is two list fields, and Prisma hides the join table.',
          reason: 'The two shapes are real, but this swaps them. The implicit form is the one where you do not write the join model.',
        },
        {
          option: 'An implicit many-to-many stores a foreign-key scalar on both models. An explicit one cannot have extra columns, so the join is done with a raw query.',
          reason: 'A scalar foreign key on both models is not how either many-to-many is written. The explicit form exists so the join model can hold extra columns.',
        },
        {
          option: 'They generate the same client API. Explicit only means you added @relation(fields, references) on one of the list fields.',
          reason: 'Adding fields and references on a list field does not turn the relation into a join model. The explicit form is a third model that stores both foreign keys.',
        },
      ],
      example: {
        lang: 'ts',
        source: "model Post {\n  id   Int       @id @default(autoincrement())\n  tags PostTag[]\n}\nmodel Tag {\n  id    Int       @id @default(autoincrement())\n  posts PostTag[]\n}\nmodel PostTag {\n  post   Post @relation(fields: [postId], references: [id])\n  postId Int\n  tag    Tag  @relation(fields: [tagId], references: [id])\n  tagId  Int\n  @@id([postId, tagId])\n}",
      },
      remember: 'Implicit many-to-many is two lists and no foreign-key scalar. Explicit many-to-many is a join model.',
    },
  },
  {
    id: 'prisma-005',
    tech: 'prisma',
    topic: 'schema',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'This one-to-many schema does not validate. What is placed on the wrong side?',
    code: {
      lang: 'ts',
      source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[] @relation(fields: [id], references: [authorId])\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User\n  authorId Int\n}",
    },
    options: [
      'fields and references are on User, which does not store the foreign key. They belong on Post, the model that stores authorId.',
      'authorId must be removed. A list field on User is enough, and the foreign key is created from the list name.',
      'The list should be on Post and the scalar authorId should be on User, because the parent stores the foreign key.',
      'references must name the list field posts. Pointing references at id makes Prisma look for a column called id on Post.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'fields and references are on the list side. They belong on Post, next to authorId.',
      why: 'A foreign key is the column that points at the parent row. Post stores that column as authorId, so @relation(fields, references) goes on Post: fields names authorId, and references names User.id. User only has a list of posts. That list does not store a column for each post, so it cannot own fields and references. Putting them on User makes the schema describe a key that User does not hold. Move the attribute to the author field and leave posts as Post[].',
      wrong: [
        {
          option: 'authorId must be removed. A list field on User is enough, and the foreign key is created from the list name.',
          reason: 'A one-to-many relation needs a real foreign-key column on the many side. Dropping authorId would remove the link the list is supposed to follow.',
        },
        {
          option: 'The list should be on Post and the scalar authorId should be on User, because the parent stores the foreign key.',
          reason: 'The parent is the one side, and the many side stores the foreign key. Post is the many side, so authorId stays on Post.',
        },
        {
          option: 'references must name the list field posts. Pointing references at id makes Prisma look for a column called id on Post.',
          reason: 'references names a field on the other model, the field the foreign key points at. That is User.id, not the list field.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId Int\n}",
      },
      example: {
        lang: 'ts',
        source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId Int\n}",
      },
      remember: 'fields and references go on the model that stores the foreign key, not on the list side.',
    },
  },
  {
    id: 'prisma-006',
    tech: 'prisma',
    topic: 'schema',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'A user has many posts. Deleting a user must also delete the posts for that user. The posts must not remain with an empty author, and the delete must not be refused because posts exist. Which onDelete action on the post relation matches that?',
    options: [
      'Restrict. It deletes the dependent posts first, then allows the user delete.',
      'Cascade. It deletes the dependent post rows when the parent user is deleted.',
      'SetNull. It deletes the posts and then writes null into the user primary key.',
      'Omit onDelete. Every relation defaults to Cascade, so the posts are already removed with the user.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Cascade deletes the dependent posts when the user is deleted.',
      why: 'onDelete is the rule the database follows for child rows when the parent row is deleted. A child row here is a post whose foreign key points at the user. Cascade follows that key and deletes those posts, so nothing is left pointing at the missing user and the user delete is not blocked. Restrict does the opposite: it blocks the user delete while a post still points at that user. SetNull keeps the posts and writes null into the foreign key, which also requires that column to be optional. Leaving the action off does not mean Cascade.',
      wrong: [
        {
          option: 'Restrict. It deletes the dependent posts first, then allows the user delete.',
          reason: 'Restrict is the blocking action, not the deleting one. While posts still reference the user, Restrict prevents the user delete.',
        },
        {
          option: 'SetNull. It deletes the posts and then writes null into the user primary key.',
          reason: 'SetNull does not delete posts and it does not change the user id. It clears the foreign key on the posts that remain.',
        },
        {
          option: 'Omit onDelete. Every relation defaults to Cascade, so the posts are already removed with the user.',
          reason: 'Cascade is not the automatic action for every relation. If the posts must be deleted with the user, the relation needs onDelete: Cascade.',
        },
      ],
      example: {
        lang: 'ts',
        source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)\n  authorId Int\n}",
      },
      remember: 'Cascade deletes dependent rows. Restrict blocks the parent delete. SetNull clears an optional foreign key.',
    },
  },
  {
    id: 'prisma-007',
    tech: 'prisma',
    topic: 'schema',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'The User model uses @@map("users") and the email field uses @map("email_address"). What is true of this client call?',
    code: {
      lang: 'ts',
      source: "const user = await prisma.user.findUnique({\n  where: { email: 'ada@example.com' },\n  select: { email: true },\n});",
    },
    options: [
      'It fails because the client model is named users and the where key must be email_address.',
      'It fails because findUnique cannot filter on a field that has @map. Use findFirst with the database column name.',
      'It is a valid client call. The client still uses the model name user and the field name email. @map and @@map change only the names in the database.',
      'It succeeds only when the where key is email_address. select can keep using email because select reads the client names.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The call is valid. Mapping changes the SQL names, not the Prisma Client API.',
      why: '@map renames one column in the database, and @@map renames the table. They do not rename the model or the field in Prisma Client. The client still calls prisma.user, and the field is still email, even though the SQL table is users and the SQL column is email_address. Prisma writes those database names into the query it sends. Using users or email_address in the client call would be a type error, because those identifiers are not the schema names.',
      wrong: [
        {
          option: 'It fails because the client model is named users and the where key must be email_address.',
          reason: 'Those are the database names. The client API keeps the model and field names from the schema, which are User and email.',
        },
        {
          option: 'It fails because findUnique cannot filter on a field that has @map. Use findFirst with the database column name.',
          reason: '@map does not change which client operation you use or which key you pass. email stays a unique client field, so findUnique can filter on it.',
        },
        {
          option: 'It succeeds only when the where key is email_address. select can keep using email because select reads the client names.',
          reason: 'where and select use the same client field names. The mapped column name is not a client key in either place.',
        },
      ],
      example: {
        lang: 'ts',
        source: "// model User {\n//   id    Int    @id @default(autoincrement())\n//   email String @unique @map(\"email_address\")\n//   @@map(\"users\")\n// }\n\nconst user = await prisma.user.findUnique({\n  where: { email: 'ada@example.com' },\n  select: { email: true },\n});",
      },
      remember: '@map and @@map rename the database column or table. The client still uses the model and field names.',
    },
  },
  {
    id: 'prisma-008',
    tech: 'prisma',
    topic: 'schema',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'A post has both an author and an editor, and each is a User. prisma validate rejects this schema. What is missing?',
    code: {
      lang: 'ts',
      source: "model User {\n  id    Int    @id @default(autoincrement())\n  posts Post[]\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(fields: [authorId], references: [id])\n  authorId Int\n  editor   User   @relation(fields: [editorId], references: [id])\n  editorId Int\n}",
    },
    options: [
      'editorId must be optional. Two required foreign keys to the same model are not allowed in one schema.',
      'The editor relation must omit fields and references. Only the first relation to User is allowed to store a foreign key.',
      'posts must use @@id so Prisma can store both foreign keys in one column on User.',
      'The two relations are ambiguous. Each pair needs the same relation name, and User needs a back-relation field for each pair.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Two relations between User and Post need names, and User needs one list field for each.',
      why: 'A relation name is the shared label that tells Prisma which fields form one link. Post has two foreign keys to User, authorId and editorId, so there are two relations. User has only one list, posts, and neither side sets a name, so Prisma cannot tell which Post field that list matches. Give both sides of the author link the same name, such as Written, and both sides of the editor link another name, such as Edited. User then has two list fields, one for each name. The fields and references already sit on the correct side, the side that stores each foreign key.',
      wrong: [
        {
          option: 'editorId must be optional. Two required foreign keys to the same model are not allowed in one schema.',
          reason: 'Both foreign keys can be required. The schema fails because the two relations are not disambiguated, not because there are two of them.',
        },
        {
          option: 'The editor relation must omit fields and references. Only the first relation to User is allowed to store a foreign key.',
          reason: 'Each foreign key needs its own fields and references. Removing them from editor would delete the information Prisma uses to link editorId to User.id.',
        },
        {
          option: 'posts must use @@id so Prisma can store both foreign keys in one column on User.',
          reason: '@@id marks the primary key of a model. It does not merge two relations, and the foreign keys stay on Post.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "model User {\n  id      Int    @id @default(autoincrement())\n  written Post[] @relation(\"Written\")\n  edited  Post[] @relation(\"Edited\")\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(\"Written\", fields: [authorId], references: [id])\n  authorId Int\n  editor   User   @relation(\"Edited\", fields: [editorId], references: [id])\n  editorId Int\n}",
      },
      example: {
        lang: 'ts',
        source: "model User {\n  id      Int    @id @default(autoincrement())\n  written Post[] @relation(\"Written\")\n  edited  Post[] @relation(\"Edited\")\n}\n\nmodel Post {\n  id       Int    @id @default(autoincrement())\n  title    String\n  author   User   @relation(\"Written\", fields: [authorId], references: [id])\n  authorId Int\n  editor   User   @relation(\"Edited\", fields: [editorId], references: [id])\n  editorId Int\n}",
      },
      remember: 'Two relations between the same models need a shared name on each pair and a field on both sides.',
    },
  },
  {
    id: 'prisma-009',
    tech: 'prisma',
    topic: 'queries',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'name is an ordinary String. email is @unique. id is the primary key. What is wrong with this lookup?',
    code: {
      lang: 'ts',
      source: "const user = await prisma.user.findUnique({\n  where: {\n    name: 'Ada',\n  },\n});",
    },
    options: [
      'findUnique can filter only on a unique field or a compound unique. name is neither, so this is a type error. Use findFirst for a non-unique filter.',
      'findUnique rejects String fields. Filter on id, or change name to Int, because unique lookups must be numeric.',
      'The where needs select: { name: true }. findUnique ignores a filter until the same field is selected.',
      'This is valid, but a missing name throws P2025. findFirst is only for queries that include a relation.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'name is not unique, so it cannot be the where of findUnique. Use findFirst.',
      why: 'findUnique is the query that looks up one row through a unique constraint. A unique constraint is a rule that a value, or a combination of values, appears on at most one row. The where argument must be a unique field, such as id or email, or a compound unique. A compound unique is declared with @@unique, and the client key joins those field names with an underscore, so @@unique([email, tenantId]) is filtered with where: { email_tenantId: { email, tenantId } }. name has no such constraint, so this where is a type error. findFirst runs a normal filter and returns the first match or null.',
      wrong: [
        {
          option: 'findUnique rejects String fields. Filter on id, or change name to Int, because unique lookups must be numeric.',
          reason: 'A unique String such as email is a valid findUnique filter. The problem is that name is not unique, not that its type is String.',
        },
        {
          option: 'The where needs select: { name: true }. findUnique ignores a filter until the same field is selected.',
          reason: 'select chooses which fields come back. It is not required to make a where filter legal, and it cannot turn a non-unique field into a unique one.',
        },
        {
          option: 'This is valid, but a missing name throws P2025. findFirst is only for queries that include a relation.',
          reason: 'The call is not a valid findUnique. findFirst is the non-unique lookup, and it does not require a relation. P2025 is the not-found error from delete and update, not from this filter.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "const user = await prisma.user.findFirst({\n  where: {\n    name: 'Ada',\n  },\n  select: {\n    id: true,\n    email: true,\n  },\n});",
      },
      example: {
        lang: 'ts',
        source: "const user = await prisma.user.findFirst({\n  where: {\n    name: 'Ada',\n  },\n  select: {\n    id: true,\n    email: true,\n  },\n});",
      },
      remember: 'findUnique accepts a unique field or a compound unique. Use findFirst for any other filter.',
    },
  },
  {
    id: 'prisma-010',
    tech: 'prisma',
    topic: 'queries',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'A user with id 7 might not exist. What is the shape of this result?',
    code: {
      lang: 'ts',
      source: "const user = await prisma.user.findUnique({\n  where: { id: 7 },\n  select: {\n    email: true,\n  },\n});",
    },
    options: [
      'When the row exists, the object includes id and email, because select keeps the where field. When the row is missing, the call throws P2025.',
      'When the row exists, the object has email and not the other scalars. When the row is missing, the result is null. findUnique does not throw for a missing row.',
      'When the row exists, the object has every scalar plus email. When the row is missing, the result is an object whose fields are all null.',
      'When the row exists, the object is { email, posts: [] }, because select adds empty relations. When the row is missing, email is null and posts is [].',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'A found row has only email. A missing row makes user null, and findUnique does not throw.',
      why: 'select lists the fields you want back, and Prisma leaves every other scalar off the object. A scalar is a single value such as id, email, or name, as opposed to a relation. This select names only email, so id is not in the result even though it was used to find the row. include would be different: it returns all scalar fields and also the relations you name. findUnique returns null when no row matches. It does not throw. The not-found error P2025 comes from operations that require a row, such as delete and update.',
      wrong: [
        {
          option: 'When the row exists, the object includes id and email, because select keeps the where field. When the row is missing, the call throws P2025.',
          reason: 'The where field is not added to the result unless you also select it. A missing findUnique row is null, not P2025.',
        },
        {
          option: 'When the row exists, the object has every scalar plus email. When the row is missing, the result is an object whose fields are all null.',
          reason: 'Returning every scalar is what include does, not select. A missing row is null, not an object full of nulls.',
        },
        {
          option: 'When the row exists, the object is { email, posts: [] }, because select adds empty relations. When the row is missing, email is null and posts is [].',
          reason: 'select does not invent relations. posts appears only if you select or include it, and a missing user is null rather than a partial object.',
        },
      ],
      example: {
        lang: 'ts',
        source: "const user = await prisma.user.findUnique({\n  where: { id: 7 },\n  select: {\n    email: true,\n  },\n});\n\nconst email = user?.email ?? null;",
      },
      remember: 'select returns only the chosen fields. findUnique returns null when the row is missing.',
    },
  },
  {
    id: 'prisma-011',
    tech: 'prisma',
    topic: 'queries',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'Post.authorId is a required foreign key to User.id. No user has id 999. What does this create do?',
    code: {
      lang: 'ts',
      source: "await prisma.post.create({\n  data: {\n    title: 'Hello',\n    authorId: 999,\n  },\n});",
    },
    options: [
      'It returns the new post with author set to null, because a missing user is stored as an empty relation.',
      'It throws P2002, the unique constraint failure, because authorId is an id and ids must be unique across tables.',
      'It throws P2003, the foreign key failure, because 999 does not point at a user row.',
      'It throws P2025, the required-record failure, because create uses the same not-found rule as delete.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The insert throws P2003 because the foreign key does not match a user.',
      why: 'A foreign key is a column that must match a row in another table. authorId is that column, and 999 is not a User.id, so the database rejects the insert. Prisma reports that rejection as P2003, the foreign key failure. P2002 is a different code: it means a unique constraint failed, such as inserting an email that is already stored. P2025 means a required record was not found by an operation such as delete, update, or connect. This create does not use those operations. It writes the scalar authorId, and the database checks the key.',
      wrong: [
        {
          option: 'It returns the new post with author set to null, because a missing user is stored as an empty relation.',
          reason: 'A required foreign key cannot be stored as null, and a bad id is not turned into an empty relation. The database rejects the insert.',
        },
        {
          option: 'It throws P2002, the unique constraint failure, because authorId is an id and ids must be unique across tables.',
          reason: 'P2002 is for a duplicate unique value in this table. authorId is not failing uniqueness here. It fails because the parent user row does not exist.',
        },
        {
          option: 'It throws P2025, the required-record failure, because create uses the same not-found rule as delete.',
          reason: 'P2025 is for a record Prisma needed and could not find, such as the target of delete or update. A scalar foreign key that the database rejects is P2003.',
        },
      ],
      example: {
        lang: 'ts',
        source: "await prisma.post.create({\n  data: {\n    title: 'Hello',\n    authorId: 999,\n  },\n});\n\n// No User row has id 999.\n// The database rejects the foreign key.\n// Prisma reports P2003.",
      },
      remember: 'P2003 is a foreign key failure. P2002 is a unique constraint failure. P2025 means a required record was not found.',
    },
  },
  {
    id: 'prisma-012',
    tech: 'prisma',
    topic: 'queries',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The caller wants the email and the posts for that user. What is wrong with this query?',
    code: {
      lang: 'ts',
      source: "const user = await prisma.user.findUnique({\n  where: { id: 7 },\n  select: {\n    email: true,\n  },\n  include: {\n    posts: true,\n  },\n});",
    },
    options: [
      'Nothing. include adds posts, and select limits the scalars, so the result is email plus posts.',
      'Nothing at runtime. TypeScript allows both, and Prisma ignores select when include is present.',
      'Nest include under select, as in select: { email: true, include: { posts: true } }. That is how the two options combine.',
      'select and include cannot be used on the same query level. Use include for every scalar plus posts, or name posts inside select.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'select and include are mutually exclusive on the same object. Pick one at this level.',
      why: 'select returns only the fields you list. include returns every scalar field, meaning every non-relation value on the model, plus the relations you name. Prisma cannot apply both rules to one result, so passing them together on the same object is a type error and a client validation error. To get all user scalars and the posts, use include: { posts: true }. To get only email and the posts, put both inside select: { email: true, posts: true }. A nested select is allowed on the relation, as in include: { posts: { select: { title: true } } }. That nested object is a different level.',
      wrong: [
        {
          option: 'Nothing. include adds posts, and select limits the scalars, so the result is email plus posts.',
          reason: 'The two options look complementary, but they are alternate ways to shape one result. Prisma does not merge them on the same object.',
        },
        {
          option: 'Nothing at runtime. TypeScript allows both, and Prisma ignores select when include is present.',
          reason: 'TypeScript rejects the combination, and the client also rejects it if the types are bypassed. select is not dropped in favor of include.',
        },
        {
          option: 'Nest include under select, as in select: { email: true, include: { posts: true } }. That is how the two options combine.',
          reason: 'include is not a key inside select. Name the relation inside select, or use include at the top and omit select.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "const user = await prisma.user.findUnique({\n  where: { id: 7 },\n  include: {\n    posts: true,\n  },\n});",
      },
      example: {
        lang: 'ts',
        source: "const user = await prisma.user.findUnique({\n  where: { id: 7 },\n  include: {\n    posts: true,\n  },\n});",
      },
      remember: 'Do not pass include and select on the same query level. include returns all scalars plus the named relations.',
    },
  },
  {
    id: 'prisma-013',
    tech: 'prisma',
    topic: 'queries',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'No user has id 7. What does this delete do?',
    code: {
      lang: 'ts',
      source: "const user = await prisma.user.delete({\n  where: {\n    id: 7,\n  },\n});",
    },
    options: [
      'It throws P2025, because delete requires the row and the row is missing. It does not return null.',
      'It returns null, the same result findUnique gives for a missing row.',
      'It returns { count: 0 } and does not throw, the same result deleteMany gives when zero rows match.',
      'It throws P2003, because a delete that finds nothing is reported as a foreign key failure.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'delete throws P2025 when the unique where matches nothing.',
      why: 'delete and update require exactly one existing row, and their where must be a unique field or a compound unique. If that row is missing, Prisma throws P2025, the code for a required record that was not found. The call does not return null. deleteMany and updateMany are the bulk forms. They return { count }, the number of rows changed, and they do not throw when the count is zero. A foreign key failure is P2003, which is not what a missing delete target produces.',
      wrong: [
        {
          option: 'It returns null, the same result findUnique gives for a missing row.',
          reason: 'findUnique uses null for a missing row. delete requires the row, so a miss is an exception rather than null.',
        },
        {
          option: 'It returns { count: 0 } and does not throw, the same result deleteMany gives when zero rows match.',
          reason: 'That count result belongs to deleteMany and updateMany. delete does not return a count when the row is missing. It throws.',
        },
        {
          option: 'It throws P2003, because a delete that finds nothing is reported as a foreign key failure.',
          reason: 'P2003 means a foreign key pointed at a row that does not exist. The code for a delete whose own target is missing is P2025.',
        },
      ],
      example: {
        lang: 'ts',
        source: "const user = await prisma.user.delete({\n  where: {\n    id: 7,\n  },\n});\n\n// No row has id 7.\n// Prisma throws P2025.",
      },
      remember: 'delete and update throw P2025 when the row is missing. deleteMany and updateMany return a count and do not throw.',
    },
  },
  {
    id: 'prisma-014',
    tech: 'prisma',
    topic: 'queries',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'No user is named Ada. name is not unique. What does this updateMany return, and does it throw?',
    code: {
      lang: 'ts',
      source: "const result = await prisma.user.updateMany({\n  where: {\n    name: 'Ada',\n  },\n  data: {\n    name: 'Ada Lovelace',\n  },\n});",
    },
    options: [
      'It throws P2025, the same not-found error as update, because the filter matched zero rows.',
      'It returns { count: 0 } and does not throw. updateMany reports how many rows changed.',
      'It returns null. That is how Prisma represents a filter that matched nothing.',
      'It throws a type error at runtime because updateMany where must be a unique field, and name is not unique.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The result is { count: 0 }, and updateMany does not throw.',
      why: 'updateMany changes every row that matches a normal filter. The filter does not have to be unique, so name is a legal where field here even though findUnique would reject it. The return value is { count }, how many rows were updated. Zero matches is a successful result with count 0, not an error. update is the single-row form: its where must be unique, and a missing row throws P2025. updateMany does not use that rule. deleteMany follows the same count rule as updateMany.',
      wrong: [
        {
          option: 'It throws P2025, the same not-found error as update, because the filter matched zero rows.',
          reason: 'P2025 is for update and delete, which require one row. updateMany treats zero matches as a count, not as a missing required record.',
        },
        {
          option: 'It returns null. That is how Prisma represents a filter that matched nothing.',
          reason: 'findUnique returns null for a miss. updateMany returns an object with a count, including when that count is zero.',
        },
        {
          option: 'It throws a type error at runtime because updateMany where must be a unique field, and name is not unique.',
          reason: 'The unique-where rule belongs to update, delete, and findUnique. updateMany is the form that accepts a non-unique filter.',
        },
      ],
      example: {
        lang: 'ts',
        source: "const result = await prisma.user.updateMany({\n  where: {\n    name: 'Ada',\n  },\n  data: {\n    name: 'Ada Lovelace',\n  },\n});\n\nconst changed = result.count;",
      },
      remember: 'updateMany and deleteMany return { count } and do not throw when zero rows match.',
    },
  },
  {
    id: 'prisma-015',
    tech: 'prisma',
    topic: 'queries',
    kind: 'code-output',
    difficulty: 'advanced',
    prompt: 'User.email is @unique, and ada@example.com is already stored. What does this create throw?',
    code: {
      lang: 'ts',
      source: "await prisma.user.create({\n  data: {\n    email: 'ada@example.com',\n    name: 'Ada',\n  },\n});",
    },
    options: [
      'Nothing. create returns the existing user when the unique value is already stored, like an upsert.',
      'P2025. Prisma treats a duplicate unique value as a required record that was not found.',
      'P2002. The email violates the unique constraint.',
      'P2003. email is checked as a foreign key, and a duplicate means the referenced row already exists.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The create throws P2002, the unique constraint failure.',
      why: 'A unique constraint is a database rule that a value appears on at most one row. email has that rule, and ada@example.com is already present, so the insert is rejected. Prisma surfaces that rejection as P2002. It does not convert create into an update. upsert is the separate operation that updates when the unique value exists and creates when it does not. P2025 means a required record was not found, which is what delete and update throw for a missing row. P2003 means a foreign key pointed at a missing parent row. This email does not point at another table.',
      wrong: [
        {
          option: 'Nothing. create returns the existing user when the unique value is already stored, like an upsert.',
          reason: 'create does not update an existing row. If you want update-or-insert on a unique field, call upsert.',
        },
        {
          option: 'P2025. Prisma treats a duplicate unique value as a required record that was not found.',
          reason: 'P2025 is the not-found code. A value that is already present is the opposite problem, and its code is P2002.',
        },
        {
          option: 'P2003. email is checked as a foreign key, and a duplicate means the referenced row already exists.',
          reason: 'P2003 is a foreign key failure, a column pointing at a parent that is not there. A duplicate email is a unique constraint failure, P2002.',
        },
      ],
      example: {
        lang: 'ts',
        source: "await prisma.user.create({\n  data: {\n    email: 'ada@example.com',\n    name: 'Ada',\n  },\n});\n\n// email is @unique and already stored.\n// Prisma throws P2002.",
      },
      remember: 'P2002 is a unique constraint failure. A duplicate email on create throws P2002.',
    },
  },
  {
    id: 'prisma-016',
    tech: 'prisma',
    topic: 'queries',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'A post links to many tags. The editor submits the full list that should remain: the existing tags with id 2 and id 5. Previous links must go away. The tag rows themselves must stay in the database. Which nested write does that?',
    options: [
      'connect: [{ id: 2 }, { id: 5 }] adds those tags and leaves any previous tags linked.',
      'disconnect: [{ id: 2 }, { id: 5 }] removes only those two tags. disconnect is also valid when the relation is required.',
      'delete: [{ id: 2 }, { id: 5 }] clears the list by deleting every tag row that is not in the list.',
      'set: [{ id: 2 }, { id: 5 }] replaces the full list. Tags that are not in the list are disconnected, not deleted.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'set replaces the to-many list. Missing tags are unlinked, and the tag rows remain.',
      why: 'A nested write changes related rows as part of the parent update. connect adds existing rows and needs a unique where, such as id, because Prisma has to know exactly which row to link. It does not remove links that were already there. disconnect removes specific links. It is valid only when the relation is optional, so a required to-one such as author User cannot be disconnected, because that would set the foreign key to null. set is the to-many operation that installs a new full list: linked rows not in the list are disconnected, and the tag records stay in the table. Nested delete would delete the related rows themselves, which this editor did not ask for.',
      wrong: [
        {
          option: 'connect: [{ id: 2 }, { id: 5 }] adds those tags and leaves any previous tags linked.',
          reason: 'connect only adds. After it runs, tags that were already linked are still linked, so the list is not replaced.',
        },
        {
          option: 'disconnect: [{ id: 2 }, { id: 5 }] removes only those two tags. disconnect is also valid when the relation is required.',
          reason: 'disconnect removes the records you name. It does not make them the new full list. On a required to-one relation, disconnect is invalid.',
        },
        {
          option: 'delete: [{ id: 2 }, { id: 5 }] clears the list by deleting every tag row that is not in the list.',
          reason: 'Nested delete deletes the related rows you identify. It is not the operation that swaps the link list while keeping every tag row.',
        },
      ],
      example: {
        lang: 'ts',
        source: "await prisma.post.update({\n  where: { id: 4 },\n  data: {\n    tags: {\n      set: [{ id: 2 }, { id: 5 }],\n    },\n  },\n});",
      },
      remember: 'set replaces a to-many list. connect adds by a unique where. disconnect requires an optional relation.',
    },
  },
  {
    id: 'prisma-017',
    tech: 'prisma',
    topic: 'queries',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    versionNote: 'Prisma 6 imports the Prisma helper from @prisma/client, while Prisma 7 imports it from the generated client path. Tagged $queryRaw and Prisma.join behave the same in both.',
    prompt: 'rawIds comes from the request query string. What is wrong with this raw query, and what is the safe raw fix?',
    code: {
      lang: 'ts',
      source: "const rawIds = url.searchParams.getAll('id');\nconst list = rawIds.join(',');\nconst users = await prisma.$queryRawUnsafe(\n  'SELECT id, email FROM users WHERE id IN (' + list + ')',\n);",
    },
    options: [
      'The ids are concatenated into the SQL string passed to $queryRawUnsafe, which can allow SQL injection. Use the tagged form of $queryRaw so values stay parameters. Build a dynamic IN list with Prisma.join, not by joining strings.',
      '$queryRawUnsafe parameterizes every string you concatenate, so this IN list is safe. The tagged form of $queryRaw is the unsafe one because it inserts raw text.',
      'Prisma.join is only for the array form of $transaction. This query is safe because join inserts commas between values the database will treat as parameters.',
      'The call cannot compile because $queryRawUnsafe rejects IN. The only legal fix is findMany, and a parameterized raw query is not possible.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Concatenating request text into $queryRawUnsafe can let that text run as SQL. Parameterize it instead.',
      why: 'SQL injection means the database executes user text as SQL instead of treating it as a value. $queryRawUnsafe takes a finished string, so gluing rawIds into the IN list gives the database whatever the caller sent. $queryRaw used as a tagged template works the other way: a tagged template is a function call that receives the SQL text and the inserted values separately, and Prisma sends those values as parameters. A parameter is a bound value, not part of the SQL text. For a dynamic IN list, pass Prisma.join(rawIds) in that tagged form rather than joining the strings yourself. The example calls the same Prisma.sql function a tagged template calls, with the text parts and Prisma.join as the value. A findMany filter of id: { in: ids } is a safe ORM query for this list, but it is not the only legal fix.',
      wrong: [
        {
          option: '$queryRawUnsafe parameterizes every string you concatenate, so this IN list is safe. The tagged form of $queryRaw is the unsafe one because it inserts raw text.',
          reason: 'This swaps the two APIs. The tagged form parameterizes values. $queryRawUnsafe runs the string you built, so concatenation is the unsafe path.',
        },
        {
          option: 'Prisma.join is only for the array form of $transaction. This query is safe because join inserts commas between values the database will treat as parameters.',
          reason: 'String join only builds text. The database does not turn that text into parameters. Prisma.join belongs in the tagged $queryRaw form, not in $transaction.',
        },
        {
          option: 'The call cannot compile because $queryRawUnsafe rejects IN. The only legal fix is findMany, and a parameterized raw query is not possible.',
          reason: 'IN is legal SQL, and a parameterized raw query is legal too. findMany with an in filter is a safe alternative for this particular list, not the only fix.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import { Prisma } from '@prisma/client';\n\nconst rawIds = url.searchParams.getAll('id');\n\nconst users = await prisma.$queryRaw(\n  Prisma.sql(\n    ['SELECT id, email FROM users WHERE id IN (', ')'],\n    Prisma.join(rawIds),\n  ),\n);",
      },
      example: {
        lang: 'ts',
        source: "import { Prisma } from '@prisma/client';\n\nconst rawIds = url.searchParams.getAll('id');\n\nconst users = await prisma.$queryRaw(\n  Prisma.sql(\n    ['SELECT id, email FROM users WHERE id IN (', ')'],\n    Prisma.join(rawIds),\n  ),\n);",
      },
      remember: 'Tagged $queryRaw parameterizes values. Do not concatenate input into $queryRawUnsafe. Use Prisma.join for a dynamic IN list.',
    },
  },
  {
    id: 'prisma-018',
    tech: 'prisma',
    topic: 'queries',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    versionNote: 'Prisma 6 imports PrismaClient from @prisma/client and calls new PrismaClient() with no adapter, while Prisma 7 imports it from the generated path and passes a driver adapter. Both still need one client on globalThis in Next.js dev.',
    prompt: 'This factory is called from a Next.js dev server while files are saved and the module reloads. What goes wrong?',
    code: {
      lang: 'ts',
      source: "import { PrismaClient } from '@prisma/client';\n\nexport function getPrisma(): PrismaClient {\n  return new PrismaClient();\n}",
    },
    options: [
      'Each new PrismaClient closes the previous pool, so calling this on every request keeps the connection count at one.',
      'Each reload constructs another PrismaClient and opens another set of connections until the database refuses new ones. Store a single client on globalThis.',
      'PrismaClient already returns the process-wide instance, so this factory is a singleton with no extra connections.',
      'The extra clients appear only in production. Development reuses one client from the module cache, and globalThis is ignored there.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Reloading the module creates more clients and exhausts the database connections. Keep one client on globalThis.',
      why: 'A PrismaClient owns a connection pool, which is a set of database connections kept open for reuse. In Next.js development, saving a file re-evaluates the module. Each evaluation that calls new PrismaClient() opens another pool, and the old pools are not closed, so the database eventually runs out of connections. globalThis is the object that stays alive for the whole process, across those reloads. Store the client there and reuse it. The usual pattern assigns that global only when NODE_ENV is not production, because production loads the module once. Creating the client inside a function that always uses new does not reuse anything.',
      wrong: [
        {
          option: 'Each new PrismaClient closes the previous pool, so calling this on every request keeps the connection count at one.',
          reason: 'Constructing a client does not close an older client. The new pool is added to the ones already open.',
        },
        {
          option: 'PrismaClient already returns the process-wide instance, so this factory is a singleton with no extra connections.',
          reason: 'new PrismaClient() constructs a new client every time. Nothing in the constructor looks up an existing instance for you.',
        },
        {
          option: 'The extra clients appear only in production. Development reuses one client from the module cache, and globalThis is ignored there.',
          reason: 'Development is where the module cache is cleared on reload. That is the case that needs the globalThis store. Production is the one-time load.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import { PrismaClient } from '@prisma/client';\n\nconst globalForPrisma = globalThis as typeof globalThis & {\n  prisma?: PrismaClient;\n};\n\nexport const prisma =\n  globalForPrisma.prisma ?? new PrismaClient();\n\nif (process.env.NODE_ENV !== 'production') {\n  globalForPrisma.prisma = prisma;\n}",
      },
      example: {
        lang: 'ts',
        source: "import { PrismaClient } from '@prisma/client';\n\nconst globalForPrisma = globalThis as typeof globalThis & {\n  prisma?: PrismaClient;\n};\n\nexport const prisma =\n  globalForPrisma.prisma ?? new PrismaClient();\n\nif (process.env.NODE_ENV !== 'production') {\n  globalForPrisma.prisma = prisma;\n}",
      },
      remember: 'In Next.js dev, keep a single PrismaClient on globalThis so reloads do not open new pools.',
    },
  },
  {
    id: 'prisma-019',
    tech: 'prisma',
    topic: 'transactions',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'The payment row must store the id of the order created in the same transaction. What is wrong with the array form here?',
    code: {
      lang: 'ts',
      source: "const order = prisma.order.create({\n  data: { total: 20 },\n});\nconst payment = prisma.payment.create({\n  data: {\n    orderId: order.id,\n    amount: 20,\n  },\n});\nawait prisma.$transaction([order, payment]);",
    },
    options: [
      'Array items run from last to first, so the payment insert happens before the order exists. Reverse the array.',
      'The array is ignored. $transaction only accepts an interactive callback, so both writes run outside any transaction.',
      'The array form starts every promise immediately, so the payment is built before the order id exists. Create the order inside an interactive callback on tx, then use the returned id.',
      'order.id is already the new id because create returns the row synchronously. The failure is that a payment model cannot join a transaction.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The array form starts both promises immediately, so the payment cannot use the order id that does not exist yet.',
      why: 'A transaction is a group of writes that commit together or roll back together. The array form prisma.$transaction([query1, query2]) starts every promise immediately, as the array is built, so you cannot use the result of the first query to build the second. Here order is still a promise when payment is created, so order.id is not the new database id. The interactive form is prisma.$transaction(async (tx) => { ... }). Inside that callback you can await the order insert and pass its id to the payment insert. Those queries must use tx, the transaction client passed to the callback. Using the outer prisma client would run that query outside the transaction.',
      wrong: [
        {
          option: 'Array items run from last to first, so the payment insert happens before the order exists. Reverse the array.',
          reason: 'Order in the array is not the bug. The payment input is already fixed, without a real order id, before $transaction runs.',
        },
        {
          option: 'The array is ignored. $transaction only accepts an interactive callback, so both writes run outside any transaction.',
          reason: 'The array form is a real transaction API. It cannot express a later query that depends on an earlier result.',
        },
        {
          option: 'order.id is already the new id because create returns the row synchronously. The failure is that a payment model cannot join a transaction.',
          reason: 'create returns a promise, not the row. A payment can take part in a transaction. It has to be created after the order id is known, on tx.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "await prisma.$transaction(async (tx) => {\n  const order = await tx.order.create({\n    data: { total: 20 },\n  });\n  await tx.payment.create({\n    data: {\n      orderId: order.id,\n      amount: 20,\n    },\n  });\n});",
      },
      example: {
        lang: 'ts',
        source: "await prisma.$transaction(async (tx) => {\n  const order = await tx.order.create({\n    data: { total: 20 },\n  });\n  await tx.payment.create({\n    data: {\n      orderId: order.id,\n      amount: 20,\n    },\n  });\n});",
      },
      remember: 'The array form starts every promise immediately. Use the interactive callback when one query needs the previous result.',
    },
  },
  {
    id: 'prisma-020',
    tech: 'prisma',
    topic: 'transactions',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'If the profile insert throws, the user row is still in the database. Why did the transaction not roll it back?',
    code: {
      lang: 'ts',
      source: "await prisma.$transaction(async (tx) => {\n  const user = await prisma.user.create({\n    data: { email: 'ada@example.com' },\n  });\n  await tx.profile.create({\n    data: {\n      userId: user.id,\n      bio: 'Hi',\n    },\n  });\n});",
    },
    options: [
      'Both writes are inside the transaction because the callback is the boundary, no matter which client you call.',
      'tx is only a type alias of the outer prisma client, so the user insert has to use prisma for a nested create.',
      'The profile insert is the one outside the transaction. tx is a read-only preview, so every write must use prisma.',
      'The user insert uses the outer prisma client, so it is not part of the transaction. If the profile insert fails, the user stays. Use tx for every query that must commit or roll back together.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'The user insert used the outer client, so it was never enlisted in the transaction.',
      why: 'An interactive transaction gives you tx, a client bound to that transaction. A transaction is a group of queries that commit together or roll back together. Only queries made with tx are in the group. prisma.user.create talks to the database on the outer client, so the user row is committed on its own. When tx.profile.create throws, Prisma rolls back the transaction, but that rollback does not include the user insert. Move both creates onto tx. The same rule applies to reads that must see the transaction uncommitted writes: those reads use tx too.',
      wrong: [
        {
          option: 'Both writes are inside the transaction because the callback is the boundary, no matter which client you call.',
          reason: 'The callback does not capture every query in its body. The client object you call is what decides whether the query joins the transaction.',
        },
        {
          option: 'tx is only a type alias of the outer prisma client, so the user insert has to use prisma for a nested create.',
          reason: 'tx is a separate client scoped to the transaction. Nested creates belong on tx, not on the outer client.',
        },
        {
          option: 'The profile insert is the one outside the transaction. tx is a read-only preview, so every write must use prisma.',
          reason: 'tx can write. The profile insert is the query that is inside the transaction. The user insert is the one that escaped it.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "await prisma.$transaction(async (tx) => {\n  const user = await tx.user.create({\n    data: { email: 'ada@example.com' },\n  });\n  await tx.profile.create({\n    data: {\n      userId: user.id,\n      bio: 'Hi',\n    },\n  });\n});",
      },
      example: {
        lang: 'ts',
        source: "await prisma.$transaction(async (tx) => {\n  const user = await tx.user.create({\n    data: { email: 'ada@example.com' },\n  });\n  await tx.profile.create({\n    data: {\n      userId: user.id,\n      bio: 'Hi',\n    },\n  });\n});",
      },
      remember: 'Inside an interactive transaction, use tx for every query that must commit or roll back together.',
    },
  },
  {
    id: 'prisma-021',
    tech: 'prisma',
    topic: 'transactions',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'When do you need the interactive form of prisma.$transaction, and what are the default timeout and maxWait?',
    options: [
      'Use the interactive callback when the second query needs the first result. The array form starts every promise immediately and cannot do that. The default timeout is 5 seconds and the default maxWait is 2 seconds.',
      'Use the array form when the second query needs the first result. The interactive form cannot see earlier writes. Both limits default to 5 seconds.',
      'The two forms behave the same. timeout is how long to wait for a free connection and defaults to 2 seconds. maxWait is the query time limit and defaults to 5 seconds.',
      'Interactive transactions have no default timeout. maxWait defaults to 30 seconds and is the only limit Prisma applies.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Use the interactive callback for a dependent query. The defaults are a 5 second timeout and a 2 second maxWait.',
      why: 'The array form starts every promise immediately, so the second query is built before the first result exists. The interactive form awaits inside the callback and can use that result, as long as the queries go through tx. timeout is how long the interactive transaction may run before Prisma rolls it back. It defaults to 5 seconds, which is 5000 milliseconds. maxWait is how long Prisma will wait to obtain a connection from the pool before giving up. A connection pool is the set of reusable database connections. maxWait defaults to 2 seconds, which is 2000 milliseconds. The two options are separate: one limits the transaction once it has started, and the other limits the wait to start it.',
      wrong: [
        {
          option: 'Use the array form when the second query needs the first result. The interactive form cannot see earlier writes. Both limits default to 5 seconds.',
          reason: 'This swaps the two forms. The interactive callback is the one that can wait for a result and use it. maxWait defaults to 2 seconds, not 5.',
        },
        {
          option: 'The two forms behave the same. timeout is how long to wait for a free connection and defaults to 2 seconds. maxWait is the query time limit and defaults to 5 seconds.',
          reason: 'The forms are not interchangeable, and the two limits are swapped here. timeout defaults to 5 seconds. maxWait defaults to 2 seconds and is the wait for a connection.',
        },
        {
          option: 'Interactive transactions have no default timeout. maxWait defaults to 30 seconds and is the only limit Prisma applies.',
          reason: 'There is a default timeout of 5 seconds, and maxWait defaults to 2 seconds. Neither limit is 30 seconds.',
        },
      ],
      example: {
        lang: 'ts',
        source: "await prisma.$transaction(\n  async (tx) => {\n    const order = await tx.order.create({\n      data: { total: 20 },\n    });\n    await tx.payment.create({\n      data: {\n        orderId: order.id,\n        amount: 20,\n      },\n    });\n  },\n  { maxWait: 2000, timeout: 5000 },\n);",
      },
      remember: 'Interactive transactions can use an earlier result. The default timeout is 5 seconds and the default maxWait is 2 seconds.',
    },
  },
  {
    id: 'prisma-022',
    tech: 'prisma',
    topic: 'transactions',
    kind: 'code-output',
    difficulty: 'expert',
    prompt: 'Neither query uses the other result. User id 4 might be missing. What does this array transaction return?',
    code: {
      lang: 'ts',
      source: "const [user, published] = await prisma.$transaction([\n  prisma.user.findUnique({\n    where: { id: 4 },\n    select: { email: true },\n  }),\n  prisma.post.count({\n    where: { published: true },\n  }),\n]);",
    },
    options: [
      'It throws before either query, because the array form rejects work that does not pass the first result into the second.',
      'A two-element array in that order: the selected user or null, then the count. A missing user does not throw.',
      'An object { user, published }. findUnique throws P2025 when id 4 is missing, and the count is skipped.',
      'The count only. findUnique inside an array transaction is ignored because it does not change data.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'You get a two-element array: the user or null, then the count. A missing user does not throw.',
      why: 'The array form runs the given queries in one transaction and returns their results in the same order. These two queries are independent, so it is fine that the promises start immediately and neither one reads the other result. findUnique returns null when id 4 is missing. It does not throw P2025. That code is for delete and update, which require a row. post.count returns a number, including zero. If either query throws a real database error, the transaction rolls back. A null user is not that kind of error, so the count still comes back as the second element.',
      wrong: [
        {
          option: 'It throws before either query, because the array form rejects work that does not pass the first result into the second.',
          reason: 'The array form is for queries that do not need each other. It rejects nothing about independence. The dependent case is what it cannot express.',
        },
        {
          option: 'An object { user, published }. findUnique throws P2025 when id 4 is missing, and the count is skipped.',
          reason: 'The result is a positional array, not a named object. findUnique returns null for a missing row and does not throw P2025.',
        },
        {
          option: 'The count only. findUnique inside an array transaction is ignored because it does not change data.',
          reason: 'Reads are valid in the array. Both results are returned, and a read is not dropped because it does not write.',
        },
      ],
      example: {
        lang: 'ts',
        source: "const [user, published] = await prisma.$transaction([\n  prisma.user.findUnique({\n    where: { id: 4 },\n    select: { email: true },\n  }),\n  prisma.post.count({\n    where: { published: true },\n  }),\n]);\n\nconst email = user?.email ?? null;\nconst total = published;",
      },
      remember: 'The array form returns results in order and fits independent queries. findUnique still returns null when the row is missing.',
    },
  },
  {
    id: 'prisma-023',
    tech: 'prisma',
    topic: 'transactions',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'Creating an order and its payment must succeed or fail together. The payment needs the id of the order that was just created. Which approach is right?',
    options: [
      'The array form of $transaction. It waits for the order insert, then builds the payment from that id.',
      'Two separate awaits on the outer prisma client. If the payment insert throws, Prisma rolls the order back automatically.',
      'An interactive prisma.$transaction callback that creates the order with tx, reads the returned id, and creates the payment with tx.',
      'An interactive callback that creates the order with the outer prisma client and the payment with tx, so both writes share the transaction.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Use an interactive transaction and run both writes on tx, using the order id inside the callback.',
      why: 'A transaction commits every enlisted write or rolls them all back. The payment cannot be built until the order insert returns an id, so the array form does not fit: it starts every promise immediately, before that id exists. The interactive callback can await tx.order.create and pass order.id into tx.payment.create. If the payment insert throws, the order insert rolls back with it. Two ordinary awaits on the outer client are not a transaction, so a failed payment leaves the order in place. Creating the order with the outer prisma client inside the callback also leaves that insert outside the transaction, even if the payment uses tx.',
      wrong: [
        {
          option: 'The array form of $transaction. It waits for the order insert, then builds the payment from that id.',
          reason: 'The array form does not hand you the first result in time to build the second query. Both promises are started up front.',
        },
        {
          option: 'Two separate awaits on the outer prisma client. If the payment insert throws, Prisma rolls the order back automatically.',
          reason: 'Separate awaits are separate commits. Prisma does not roll back an earlier create just because a later create throws.',
        },
        {
          option: 'An interactive callback that creates the order with the outer prisma client and the payment with tx, so both writes share the transaction.',
          reason: 'Only tx is inside the transaction. The outer prisma.order.create commits on its own and stays if the payment fails.',
        },
      ],
      example: {
        lang: 'ts',
        source: "await prisma.$transaction(async (tx) => {\n  const order = await tx.order.create({\n    data: { total: 20 },\n  });\n  await tx.payment.create({\n    data: {\n      orderId: order.id,\n      amount: 20,\n    },\n  });\n});",
      },
      remember: 'Dependent writes belong in an interactive transaction, and every one of them uses tx.',
    },
  },
  {
    id: 'prisma-024',
    tech: 'prisma',
    topic: 'transactions',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'The author passed timeout: 5 to mean five seconds. The interactive transaction is rolled back almost immediately. What is wrong?',
    code: {
      lang: 'ts',
      source: "await prisma.$transaction(\n  async (tx) => {\n    const user = await tx.user.findUnique({\n      where: { id: 1 },\n    });\n    await tx.user.update({\n      where: { id: 1 },\n      data: { name: 'Ada' },\n    });\n    return user;\n  },\n  { timeout: 5 },\n);",
    },
    options: [
      'timeout: 5 means 5 seconds, which matches the default, so this option changes nothing.',
      'timeout is in minutes, so 5 minutes is more generous than the default and the callback should be safe.',
      'The second argument is ignored on interactive transactions. Only the array form reads timeout.',
      'timeout is in milliseconds. 5 means 5 milliseconds, not 5 seconds. The default is 5000 milliseconds, so this transaction can be rolled back almost immediately.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'timeout is milliseconds. 5 is 5 milliseconds, far below the 5 second default.',
      why: 'The timeout option limits how long an interactive transaction may run before Prisma rolls it back. The unit is milliseconds, and the default is 5000, which is 5 seconds. Passing 5 sets a 5 millisecond budget, so a normal find and update can outlive it and the transaction is aborted. maxWait is a different option: it is how long to wait for a connection from the pool, and its default is 2000 milliseconds, or 2 seconds. A connection pool is the set of reusable database connections. To ask for five seconds of transaction time, pass timeout: 5000, or omit the option and keep the default.',
      wrong: [
        {
          option: 'timeout: 5 means 5 seconds, which matches the default, so this option changes nothing.',
          reason: 'The number 5 looks like the default of five seconds, but the option is not in seconds. 5 milliseconds replaces the 5000 millisecond default.',
        },
        {
          option: 'timeout is in minutes, so 5 minutes is more generous than the default and the callback should be safe.',
          reason: 'The unit is milliseconds, not minutes. This value is much shorter than the default, not longer.',
        },
        {
          option: 'The second argument is ignored on interactive transactions. Only the array form reads timeout.',
          reason: 'The options object applies to the interactive callback. timeout: 5 is read, and it is short enough to expire the transaction.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "await prisma.$transaction(\n  async (tx) => {\n    const user = await tx.user.findUnique({\n      where: { id: 1 },\n    });\n    await tx.user.update({\n      where: { id: 1 },\n      data: { name: 'Ada' },\n    });\n    return user;\n  },\n  {\n    maxWait: 2000,\n    timeout: 5000,\n  },\n);",
      },
      example: {
        lang: 'ts',
        source: "await prisma.$transaction(\n  async (tx) => {\n    const user = await tx.user.findUnique({\n      where: { id: 1 },\n    });\n    await tx.user.update({\n      where: { id: 1 },\n      data: { name: 'Ada' },\n    });\n    return user;\n  },\n  {\n    maxWait: 2000,\n    timeout: 5000,\n  },\n);",
      },
      remember: 'Interactive timeout and maxWait are milliseconds. The defaults are 5000 and 2000.',
    },
  },
  {
    id: 'prisma-025',
    tech: 'prisma',
    topic: 'migrations',
    kind: 'concept',
    difficulty: 'advanced',
    prompt: 'What do prisma migrate dev, prisma migrate deploy, and prisma db push each do?',
    options: [
      'migrate dev creates and applies a migration in development and uses a shadow database. migrate deploy applies pending migrations and is the production command. db push syncs the schema without a migration file and should not be the production path when a migration history exists.',
      'migrate deploy creates the migration file and applies it in production. migrate dev only checks types. db push writes the migration history.',
      'All three commands write a migration file. db push also seeds the database, and migrate deploy is the one that uses a shadow database.',
      'db push is the production command once a migrations folder exists. migrate dev and migrate deploy are aliases of that same sync.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'migrate dev creates and applies in development. migrate deploy applies pending files in production. db push syncs without a migration file.',
      why: 'A migration is a saved set of SQL changes, stored as a folder under prisma/migrations, that can be replayed on another database. migrate dev creates that folder from the schema, applies it to the development database, and uses a shadow database, an empty second database, to replay history and build the SQL. migrate deploy applies migrations that are already pending and does not create a new one. It is the production command. db push changes the database to match the schema without writing a migration file. That is useful for a prototype. Once a project has a migration history, db push is not the production path, because production would drift away from the files deploy expects.',
      wrong: [
        {
          option: 'migrate deploy creates the migration file and applies it in production. migrate dev only checks types. db push writes the migration history.',
          reason: 'This swaps the development and production commands. deploy does not create a migration, and db push does not write one either.',
        },
        {
          option: 'All three commands write a migration file. db push also seeds the database, and migrate deploy is the one that uses a shadow database.',
          reason: 'Only migrate dev creates a migration file. db push skips the file, and the shadow database belongs to migrate dev, not deploy.',
        },
        {
          option: 'db push is the production command once a migrations folder exists. migrate dev and migrate deploy are aliases of that same sync.',
          reason: 'A migration history is a reason to avoid db push in production. deploy applies the files. dev creates them. They are not aliases.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function migrate(production: boolean): void {\n  const args = production\n    ? ['prisma', 'migrate', 'deploy']\n    : ['prisma', 'migrate', 'dev'];\n  execFileSync('npx', args, { stdio: 'inherit' });\n}",
      },
      remember: 'migrate dev creates migrations. migrate deploy applies them. db push syncs without a migration file.',
    },
  },
  {
    id: 'prisma-026',
    tech: 'prisma',
    topic: 'migrations',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    prompt: 'This boot script runs in production. The project already has a prisma/migrations history. What is wrong?',
    code: {
      lang: 'ts',
      source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateForProd(): void {\n  execFileSync('npx', ['prisma', 'db', 'push'], {\n    stdio: 'inherit',\n  });\n}",
    },
    options: [
      'db push is the production command. It writes a migration file before it syncs, so the history stays complete.',
      'db push syncs the schema without writing a migration file. With a migration history, production should run migrate deploy, which applies pending migrations.',
      'db push only updates Prisma Client types. It does not connect to the database, so the script is a harmless no-op.',
      'The bug is execFileSync. Prisma refuses db push unless it is started from the migrate dev prompt.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'Production with a migration history should run migrate deploy, not db push.',
      why: 'db push changes the live database so it matches schema.prisma and does not write a folder under prisma/migrations. A migration history is the sequence of those folders. migrate deploy applies the pending ones and is the production command. If production uses db push, the database can gain columns that no migration file describes, and later deploy runs no longer match what is actually there. That drift is the gap between the files and the database. migrate dev is how a developer creates a new file. It is not this script, and it is not a production boot command either.',
      wrong: [
        {
          option: 'db push is the production command. It writes a migration file before it syncs, so the history stays complete.',
          reason: 'db push does not write a migration file. Using it in production skips the history that deploy is supposed to apply.',
        },
        {
          option: 'db push only updates Prisma Client types. It does not connect to the database, so the script is a harmless no-op.',
          reason: 'db push connects and changes the database schema. The client types are a separate generate step.',
        },
        {
          option: 'The bug is execFileSync. Prisma refuses db push unless it is started from the migrate dev prompt.',
          reason: 'db push can be run from a script. The problem is which command the script runs, not the process API around it.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateForProd(): void {\n  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {\n    stdio: 'inherit',\n  });\n}",
      },
      example: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateForProd(): void {\n  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {\n    stdio: 'inherit',\n  });\n}",
      },
      remember: 'Do not use db push as the production path when you already have a migration history. Use migrate deploy.',
    },
  },
  {
    id: 'prisma-027',
    tech: 'prisma',
    topic: 'migrations',
    kind: 'scenario',
    difficulty: 'advanced',
    prompt: 'You added an optional bio field to User and committed schema.prisma. You did not add a new folder under prisma/migrations. Production runs prisma migrate deploy. What happens to the database?',
    options: [
      'migrate deploy compares the schema with the database and creates a migration that adds bio.',
      'migrate deploy refuses to start because the schema and the migration history differ, and it rolls back the last migration.',
      'migrate deploy applies only migrations that already exist. With none pending, it does not add bio.',
      'migrate deploy runs db push when the schema has no matching migration, so bio is added and no file is written.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'deploy does not create a migration. If none are pending, bio is not added.',
      why: 'migrate deploy looks at the migrations folder, sees which of those folders are already recorded in the database, and runs the SQL for the ones that are still pending. It does not diff schema.prisma against the database and invent a new migration. A migration is a saved SQL change that was created earlier, usually by migrate dev in development. Committing only the schema leaves deploy with nothing new to apply, so the command can succeed while the bio column is still absent. Create the migration with migrate dev, commit the new folder, and let production deploy apply that folder.',
      wrong: [
        {
          option: 'migrate deploy compares the schema with the database and creates a migration that adds bio.',
          reason: 'Creating a migration from the schema is what migrate dev does in development. deploy only applies files that already exist.',
        },
        {
          option: 'migrate deploy refuses to start because the schema and the migration history differ, and it rolls back the last migration.',
          reason: 'deploy does not roll back an old migration because the schema has an extra field. It applies pending files, and here there are none.',
        },
        {
          option: 'migrate deploy runs db push when the schema has no matching migration, so bio is added and no file is written.',
          reason: 'deploy does not fall through to db push. db push is a different command, and it is not the production path when a migration history exists.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function createDevMigration(): void {\n  execFileSync(\n    'npx',\n    ['prisma', 'migrate', 'dev', '--name', 'add_bio'],\n    { stdio: 'inherit' },\n  );\n}",
      },
      remember: 'migrate deploy applies pending migration files. It does not create one from a schema edit.',
    },
  },
  {
    id: 'prisma-028',
    tech: 'prisma',
    topic: 'migrations',
    kind: 'concept',
    difficulty: 'expert',
    versionNote: 'Prisma 6 runs prisma generate at the end of migrate dev. Prisma 7 does not: migrate dev and db push no longer generate the client, and the --skip-generate flag is gone, so you run prisma generate yourself.',
    prompt: 'You added a field to schema.prisma. TypeScript still shows the old client type. What updates the type, and how does migrate dev relate?',
    options: [
      'Saving schema.prisma updates the types. Prisma watches the file and regenerates the client in the editor.',
      'migrate deploy creates a migration and regenerates the client. prisma generate only formats the schema.',
      'The types update when the database accepts the column. No local command refreshes TypeScript.',
      'prisma generate updates the client types. Editing the schema does not. In Prisma 6, migrate dev runs generate. migrate deploy does not create a new migration.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'prisma generate refreshes the client types. In Prisma 6, migrate dev runs that step. migrate deploy does not create a migration.',
      why: 'Prisma Client types are generated code. They change when prisma generate reads the schema and writes the client, not when you save schema.prisma and not when a column appears in the database. In Prisma 6, migrate dev runs generate after it creates and applies a migration, so a development migration also refreshes the types. migrate deploy applies pending migration files and does not create a new migration from a schema edit. In Prisma 7, migrate dev and db push no longer run generate, and the old --skip-generate flag was removed, so you run prisma generate yourself after a schema change. Either way, the command that updates TypeScript is generate.',
      wrong: [
        {
          option: 'Saving schema.prisma updates the types. Prisma watches the file and regenerates the client in the editor.',
          reason: 'The schema file is the input to generate, not a live update of the client. Until generate runs, TypeScript still has the previous client.',
        },
        {
          option: 'migrate deploy creates a migration and regenerates the client. prisma generate only formats the schema.',
          reason: 'deploy does not create a migration, and generate does not merely format the schema. generate is what writes the client types.',
        },
        {
          option: 'The types update when the database accepts the column. No local command refreshes TypeScript.',
          reason: 'The database schema and the TypeScript client are updated by different steps. The local command for the types is prisma generate.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function refreshClient(): void {\n  execFileSync('npx', ['prisma', 'generate'], {\n    stdio: 'inherit',\n  });\n}",
      },
      remember: 'Client types update when prisma generate runs. migrate deploy does not create a migration.',
    },
  },
  {
    id: 'prisma-029',
    tech: 'prisma',
    topic: 'migrations',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    prompt: 'This function runs when a production server boots, against the production database. What is wrong?',
    code: {
      lang: 'ts',
      source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateOnBoot(): void {\n  execFileSync(\n    'npx',\n    ['prisma', 'migrate', 'dev', '--name', 'boot'],\n    { stdio: 'inherit' },\n  );\n}",
    },
    options: [
      'migrate dev is the development command. It can prompt, it uses a shadow database, and it creates migrations. Production should run migrate deploy, which applies pending migrations and does not create one.',
      'migrate dev is the production command. The --name flag tells it to apply existing files only and never create one.',
      'The command is right because migrate deploy would create a migration named boot, and migrate dev is what applies it.',
      'Remove --name and keep migrate dev. In production that flag turns the command into db push.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'Production should run migrate deploy. migrate dev is the development command that creates migrations.',
      why: 'migrate dev compares the schema with the migration history, can create a new migration, and applies it. It uses a shadow database, an empty second database, to replay migrations and detect drift, which is a difference between the history and the real schema. It can also prompt, which a boot script cannot answer. Pointing it at production risks creating migrations there or asking to reset data. migrate deploy applies pending migration files and does not create a new one. That is the production command. --name names a migration that dev is about to create. It does not switch dev into deploy.',
      wrong: [
        {
          option: 'migrate dev is the production command. The --name flag tells it to apply existing files only and never create one.',
          reason: '--name is the name for a new migration. It does not stop migrate dev from being the development command.',
        },
        {
          option: 'The command is right because migrate deploy would create a migration named boot, and migrate dev is what applies it.',
          reason: 'This swaps the two commands. deploy applies existing files. dev is the one that can create a migration named boot.',
        },
        {
          option: 'Remove --name and keep migrate dev. In production that flag turns the command into db push.',
          reason: '--name does not select db push. Dropping it would still leave the development command pointed at the production database.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateOnBoot(): void {\n  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {\n    stdio: 'inherit',\n  });\n}",
      },
      example: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateOnBoot(): void {\n  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {\n    stdio: 'inherit',\n  });\n}",
      },
      remember: 'migrate dev creates and applies migrations in development. migrate deploy applies pending migrations in production.',
    },
  },
  {
    id: 'prisma-030',
    tech: 'prisma',
    topic: 'migrations',
    kind: 'scenario',
    difficulty: 'expert',
    prompt: 'prisma migrate dev fails because the database user cannot create a second database. The app already has a migration history. What is that second database for?',
    options: [
      'It is a read replica. migrate deploy requires it in production so migrations can run without locking the primary.',
      'It is the shadow database. migrate dev replays migrations there to generate the next migration and catch drift. migrate deploy does not create a migration, so it does not need that replay.',
      'It is a backup that db push creates before it drops columns. Both migrate dev and migrate deploy require it on every run.',
      'It is a cache of the generated client. prisma generate uses it to typecheck the schema, and migrate dev always calls generate.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The second database is the shadow database migrate dev uses to replay migrations. migrate deploy does not create a migration.',
      why: 'A shadow database is an empty second database, not a copy of production data. migrate dev replays the existing migration folders onto it, then compares the result with schema.prisma. The difference becomes the SQL for the next migration, and a mismatch reveals drift, meaning the real database and the migration history disagree. Creating or using that second database needs permission the production user often does not have, which is one reason migrate dev stays in development. migrate deploy only runs pending migration SQL against the real database. It does not create a new migration and does not need the shadow replay to invent SQL.',
      wrong: [
        {
          option: 'It is a read replica. migrate deploy requires it in production so migrations can run without locking the primary.',
          reason: 'A read replica is a copy that serves reads. The extra database migrate dev wants is empty and is used to rehearse migrations, and deploy does not require it.',
        },
        {
          option: 'It is a backup that db push creates before it drops columns. Both migrate dev and migrate deploy require it on every run.',
          reason: 'It is not a backup, and deploy does not create it. db push is a separate command that syncs without a migration file.',
        },
        {
          option: 'It is a cache of the generated client. prisma generate uses it to typecheck the schema, and migrate dev always calls generate.',
          reason: 'The client is generated as files, not stored in a second database. The shadow database is part of figuring out migration SQL.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import { execFileSync } from 'node:child_process';\n\nexport function migrateLocal(): void {\n  execFileSync('npx', ['prisma', 'migrate', 'dev'], {\n    stdio: 'inherit',\n  });\n}",
      },
      remember: 'migrate dev uses a shadow database to build the next migration. migrate deploy applies pending files and does not create one.',
    },
  },
  {
    id: 'prisma-031',
    tech: 'prisma',
    topic: 'prisma7',
    kind: 'code-output',
    difficulty: 'advanced',
    versionNote: 'Prisma 6 used provider prisma-client-js and generated the client into @prisma/client. Prisma 7 uses provider prisma-client, requires an output path, and you import from that path instead of node_modules.',
    prompt: 'This generator is the Prisma 6 setup. Which statement describes the client Prisma 7 requires instead?',
    code: {
      lang: 'ts',
      source: "generator client {\n  provider = \"prisma-client-js\"\n}",
    },
    options: [
      'Keep provider prisma-client-js. Prisma 7 still generates the client into node_modules/@prisma/client by default, and output is optional.',
      'Set provider to prisma-client and leave output unset. Prisma 7 chooses node_modules/@prisma/client when output is missing.',
      'Set provider to prisma-client, set a required output path, and import PrismaClient from that path, such as ./generated/prisma/client. The client is no longer generated into node_modules by default.',
      'Rename the provider to @prisma/client and import PrismaClient from the package prisma-client-js.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'Prisma 7 uses provider prisma-client, requires output, and you import the client from that output path.',
      why: 'The generator provider is the setting that chooses which client Prisma writes. Prisma 7 uses prisma-client, not prisma-client-js. output is required, and it is a directory relative to the schema file. The client is no longer generated into node_modules by default, so import { PrismaClient } from "@prisma/client" is the Prisma 6 import. After generate, import from the output path, such as ./generated/prisma/client when the schema lives in prisma/schema.prisma and output is ../generated/prisma. Application code then constructs the client from that import.',
      wrong: [
        {
          option: 'Keep provider prisma-client-js. Prisma 7 still generates the client into node_modules/@prisma/client by default, and output is optional.',
          reason: 'prisma-client-js is the Prisma 6 provider. Prisma 7 does not default to generating into node_modules, and output is required.',
        },
        {
          option: 'Set provider to prisma-client and leave output unset. Prisma 7 chooses node_modules/@prisma/client when output is missing.',
          reason: 'The new provider is right, but a missing output is not filled in with node_modules. The output path is required.',
        },
        {
          option: 'Rename the provider to @prisma/client and import PrismaClient from the package prisma-client-js.',
          reason: 'Those names are swapped. The provider string is prisma-client, and the import comes from the generated output, not from a package named prisma-client-js.',
        },
      ],
      example: {
        lang: 'ts',
        source: "generator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\n// Import from ./generated/prisma/client.",
      },
      remember: 'Prisma 7 uses provider prisma-client, requires output, and you import from that generated path.',
    },
  },
  {
    id: 'prisma-032',
    tech: 'prisma',
    topic: 'prisma7',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    versionNote: 'Prisma 6 constructed new PrismaClient() with no adapter and could read the URL from the schema. Prisma 7 requires a driver adapter for a SQL database, such as @prisma/adapter-pg for Postgres.',
    prompt: 'This module targets Postgres on Prisma 7. The import path is already the generated client. What is still wrong?',
    code: {
      lang: 'ts',
      source: "import { PrismaClient } from './generated/prisma/client';\n\nexport const prisma = new PrismaClient();",
    },
    options: [
      'The import path is wrong. Prisma 7 still requires import { PrismaClient } from "@prisma/client", and new PrismaClient() with no adapter is correct.',
      'new PrismaClient() is correct for a SQL database. A driver adapter is only required when you opt into Prisma Accelerate.',
      'The call is missing datasourceUrl. Prisma 7 reads the URL from new PrismaClient({ datasourceUrl }) and does not use driver adapters.',
      'A SQL database needs a driver adapter. Pass new PrismaClient({ adapter }) using @prisma/adapter-pg for Postgres. new PrismaClient() with no adapter is the Prisma 6 style.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'Prisma 7 needs a driver adapter for Postgres. new PrismaClient() with no adapter is the Prisma 6 constructor.',
      why: 'A driver adapter is the package that connects Prisma Client to a JavaScript database driver. For Postgres that package is @prisma/adapter-pg, and the client is constructed as new PrismaClient({ adapter }) after new PrismaPg({ connectionString }). The connection string is the URL the driver uses to open the database. Prisma 6 called new PrismaClient() with no adapter and took the URL from the schema. Prisma 7 does not. A hosted Accelerate URL is a separate proxy and is not what this Postgres setup uses. Passing datasourceUrl into the constructor is also the old style, not the adapter setup.',
      wrong: [
        {
          option: 'The import path is wrong. Prisma 7 still requires import { PrismaClient } from "@prisma/client", and new PrismaClient() with no adapter is correct.',
          reason: 'The generated import is the Prisma 7 path. The constructor is the part that is still the Prisma 6 call, because it has no adapter.',
        },
        {
          option: 'new PrismaClient() is correct for a SQL database. A driver adapter is only required when you opt into Prisma Accelerate.',
          reason: 'A normal SQL connection is exactly the case that needs the adapter. Accelerate is not what adds the adapter requirement for Postgres.',
        },
        {
          option: 'The call is missing datasourceUrl. Prisma 7 reads the URL from new PrismaClient({ datasourceUrl }) and does not use driver adapters.',
          reason: 'datasourceUrl on the constructor is not the Prisma 7 SQL setup. The URL goes to the driver adapter, and the client receives { adapter }.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter });",
      },
      example: {
        lang: 'ts',
        source: "import { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter });",
      },
      remember: 'Prisma 7 SQL clients use new PrismaClient({ adapter }). Postgres uses @prisma/adapter-pg.',
    },
  },
  {
    id: 'prisma-033',
    tech: 'prisma',
    topic: 'prisma7',
    kind: 'concept',
    difficulty: 'advanced',
    versionNote: 'Prisma 6 read url = env("DATABASE_URL") from the datasource block in schema.prisma. Prisma 7 reads the URL, schema path, migrations path, and seed command from prisma.config.ts, and those schema URL fields are deprecated.',
    prompt: 'Where does the Prisma 7 CLI read the database URL, schema path, migrations path, and seed command?',
    options: [
      'From prisma.config.ts at the project root, using defineConfig and env from prisma/config. The url, directUrl, and shadowDatabaseUrl fields on the datasource block in schema.prisma are deprecated.',
      'From the datasource block in schema.prisma, using url = env("DATABASE_URL"), which remains the only supported place in Prisma 7.',
      'From the generator output path. The generated client file contains the migration URL and the seed command.',
      'From new PrismaClient({ adapter }) only. The CLI opens that adapter to decide where migrations are stored.',
    ],
    correctIndex: 0,
    explanation: {
      answer: 'The Prisma 7 CLI reads them from prisma.config.ts. The schema URL fields are deprecated.',
      why: 'prisma.config.ts sits at the project root, next to package.json. It is loaded with defineConfig and env, both imported from prisma/config. env reads an environment variable. The config object holds the schema path, the migrations path, the seed command, and datasource.url. A seed command is the script Prisma runs for prisma db seed. In Prisma 6 the datasource block in schema.prisma held url = env("DATABASE_URL"), and it could also hold directUrl and shadowDatabaseUrl. Those three fields are deprecated in Prisma 7. The running application still passes its connection string to the driver adapter. The CLI does not discover the migration URL by constructing PrismaClient.',
      wrong: [
        {
          option: 'From the datasource block in schema.prisma, using url = env("DATABASE_URL"), which remains the only supported place in Prisma 7.',
          reason: 'That schema URL is the Prisma 6 setup. Prisma 7 deprecates it and reads the CLI URL from prisma.config.ts.',
        },
        {
          option: 'From the generator output path. The generated client file contains the migration URL and the seed command.',
          reason: 'The generated client is the query API. It does not store the migrations path or the seed command. Those live in the config file.',
        },
        {
          option: 'From new PrismaClient({ adapter }) only. The CLI opens that adapter to decide where migrations are stored.',
          reason: 'The adapter is how application code connects. The CLI reads prisma.config.ts for the URL, schema, migrations, and seed.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import 'dotenv/config';\nimport { defineConfig, env } from 'prisma/config';\n\nexport default defineConfig({\n  schema: 'prisma/schema.prisma',\n  migrations: {\n    path: 'prisma/migrations',\n    seed: 'tsx prisma/seed.ts',\n  },\n  datasource: {\n    url: env('DATABASE_URL'),\n  },\n});",
      },
      remember: 'Prisma 7 CLI settings live in prisma.config.ts. url, directUrl, and shadowDatabaseUrl in the schema are deprecated.',
    },
  },
  {
    id: 'prisma-034',
    tech: 'prisma',
    topic: 'prisma7',
    kind: 'scenario',
    difficulty: 'expert',
    versionNote: 'Prisma 6 used directUrl on the datasource block when migrations needed a direct connection. Prisma 7 puts that same string in datasource.url inside prisma.config.ts, because the CLI uses url for migrations.',
    prompt: 'In Prisma 6 the schema used a pooled connection in url and a direct connection in directUrl so migrations did not go through the pooler. DATABASE_URL is the pooled string and DIRECT_DATABASE_URL is the direct string. Where does the direct string go in Prisma 7?',
    code: {
      lang: 'ts',
      source: "datasource db {\n  provider  = \"postgresql\"\n  url       = env(\"DATABASE_URL\")\n  directUrl = env(\"DIRECT_DATABASE_URL\")\n}",
    },
    options: [
      'Leave directUrl on the datasource block. Prisma 7 still reads directUrl from schema.prisma for migrations and uses url only for the client.',
      'Put the direct connection string in the url field of prisma.config.ts. The CLI uses that url for migrations. The schema fields url, directUrl, and shadowDatabaseUrl are deprecated.',
      'Pass the pooled URL as datasource.url and the direct URL as datasource.directUrl in prisma.config.ts. The CLI prefers directUrl when both are set.',
      'Pass the direct URL only to new PrismaClient({ adapter }) and leave prisma.config.ts without a url. The CLI reads the adapter to run migrations.',
    ],
    correctIndex: 1,
    explanation: {
      answer: 'The old directUrl value becomes datasource.url in prisma.config.ts, because the CLI uses that url for migrations.',
      why: 'A pooler shares a smaller set of database connections among many clients. Migrations need a direct connection so they can take the locks and session state a pooler may hide. In Prisma 6, url could be the pooled string and directUrl the direct string, and the CLI used directUrl for migrations. Those schema fields are deprecated in Prisma 7. prisma.config.ts has datasource.url, and that is the URL the CLI uses for migrations, so it should be the old direct connection, for example env("DIRECT_DATABASE_URL"). There is not a directUrl field to set beside it in that config. The application adapter can still be given the pooled URL if the running app should use the pooler.',
      wrong: [
        {
          option: 'Leave directUrl on the datasource block. Prisma 7 still reads directUrl from schema.prisma for migrations and uses url only for the client.',
          reason: 'directUrl on the schema datasource is deprecated. The CLI no longer treats that field as the migration URL.',
        },
        {
          option: 'Pass the pooled URL as datasource.url and the direct URL as datasource.directUrl in prisma.config.ts. The CLI prefers directUrl when both are set.',
          reason: 'The config does not take a directUrl field for this. The migration connection is datasource.url itself, so that value must be the direct string.',
        },
        {
          option: 'Pass the direct URL only to new PrismaClient({ adapter }) and leave prisma.config.ts without a url. The CLI reads the adapter to run migrations.',
          reason: 'The adapter configures the running client. The CLI reads prisma.config.ts and will not take the migration URL from the adapter constructor.',
        },
      ],
      example: {
        lang: 'ts',
        source: "import 'dotenv/config';\nimport { defineConfig, env } from 'prisma/config';\n\nexport default defineConfig({\n  schema: 'prisma/schema.prisma',\n  migrations: {\n    path: 'prisma/migrations',\n  },\n  datasource: {\n    url: env('DIRECT_DATABASE_URL'),\n  },\n});",
      },
      remember: 'If Prisma 6 migrations used directUrl, that string becomes datasource.url in prisma.config.ts.',
    },
  },
  {
    id: 'prisma-035',
    tech: 'prisma',
    topic: 'prisma7',
    kind: 'spot-the-bug',
    difficulty: 'advanced',
    versionNote: 'Prisma 6 loaded .env for the client and the CLI, and it supported older Node.js. Prisma 7 does not load .env at runtime, requires Node.js 20.19.0 or newer, and requires TypeScript 5.4.0 or newer.',
    prompt: 'This Prisma 7 client reads process.env.DATABASE_URL. A .env file exists, but nothing loads it, and the process is Node rather than Bun. What is true?',
    code: {
      lang: 'ts',
      source: "import { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter });",
    },
    options: [
      'This is correct in Prisma 7. The generated client still loads .env at runtime, the same way Prisma 6 did, and Node.js 18.20 remains supported.',
      'Replace process.env with env("DATABASE_URL") from prisma/config inside the adapter. That helper loads the .env file for the running server. TypeScript 5.0.0 is the minimum.',
      'The generated client does not load a .env file at runtime, so the URL stays empty unless you load it yourself. Prisma 7 needs Node.js 20.19.0 or newer and TypeScript 5.4.0 or newer.',
      'prisma.config.ts injects the URL into every PrismaClient, so a missing loader does not matter. The minimum Node.js is 20.0.0.',
    ],
    correctIndex: 2,
    explanation: {
      answer: 'The Prisma 7 client does not load .env. Load it yourself. Node.js must be at least 20.19.0 and TypeScript at least 5.4.0.',
      why: 'In Prisma 6 the client loaded a .env file while it started, so DATABASE_URL appeared even if application code never read the file. The generated Prisma 7 client does not do that. This adapter reads process.env.DATABASE_URL at runtime, and on Node that value stays undefined until something loads the file. Importing dotenv/config before the adapter is one way. The env helper from prisma/config reads a variable that is already loaded. It does not replace that step. Bun loads .env on its own, which is why this bug shows up on Node. Prisma 7 also refuses to run below Node.js 20.19.0 or TypeScript 5.4.0.',
      wrong: [
        {
          option: 'This is correct in Prisma 7. The generated client still loads .env at runtime, the same way Prisma 6 did, and Node.js 18.20 remains supported.',
          reason: 'Automatic .env loading was the Prisma 6 client behavior. Prisma 7 stopped it, and Node.js 18 is below the 20.19.0 minimum.',
        },
        {
          option: 'Replace process.env with env("DATABASE_URL") from prisma/config inside the adapter. That helper loads the .env file for the running server. TypeScript 5.0.0 is the minimum.',
          reason: 'env does not load the file for you, and it is the CLI config helper. The TypeScript minimum is 5.4.0, not 5.0.0.',
        },
        {
          option: 'prisma.config.ts injects the URL into every PrismaClient, so a missing loader does not matter. The minimum Node.js is 20.0.0.',
          reason: 'The config file feeds the CLI. It does not fill process.env inside this server process. The Node.js minimum is 20.19.0, not 20.0.0.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import 'dotenv/config';\nimport { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter });",
      },
      example: {
        lang: 'ts',
        source: "import 'dotenv/config';\nimport { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter });",
      },
      remember: 'Prisma 7 does not load .env for you. Minimum Node.js is 20.19.0 and minimum TypeScript is 5.4.0.',
    },
  },
  {
    id: 'prisma-036',
    tech: 'prisma',
    topic: 'prisma7',
    kind: 'spot-the-bug',
    difficulty: 'expert',
    versionNote: 'Prisma 6 still exposed the deprecated prisma.$use middleware. Prisma 7 removes $use. Client extensions through prisma.$extends are the API to use on both current versions.',
    prompt: 'This Prisma 7 client tries to log every user.findMany. The project fails to typecheck on $use. What replaces it?',
    code: {
      lang: 'ts',
      source: "import { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\nconst prisma = new PrismaClient({ adapter });\n\nprisma.$use(async (params, next) => {\n  return next(params);\n});",
    },
    options: [
      '$use still runs first in Prisma 7, and $extends is only a typed alias of the same middleware.',
      'Move the callback to prisma.$transaction. Middleware now runs inside the transaction timeout.',
      'Call $use on the adapter from @prisma/adapter-pg. Prisma 7 moved middleware onto the driver adapter.',
      'prisma.$use was removed. Wrap the client with prisma.$extends and put the logic in a query extension.',
    ],
    correctIndex: 3,
    explanation: {
      answer: 'prisma.$use is gone in Prisma 7. Use prisma.$extends.',
      why: 'Middleware was a function registered with prisma.$use that saw every query and could call next to continue. Prisma 7 removes that API. A client extension, created with prisma.$extends, is the replacement: you return the extended client and add behavior under query, for example query.user.findMany. The callback receives args and query, and calling query(args) runs the original findMany. $extends does not mutate the old client in place, so the value you export must be the return value. The driver adapter only connects to Postgres. It is not where query hooks go, and $transaction does not replace middleware.',
      wrong: [
        {
          option: '$use still runs first in Prisma 7, and $extends is only a typed alias of the same middleware.',
          reason: '$use is not an alias that still exists. Prisma 7 removed it. $extends is a different API and the one to call.',
        },
        {
          option: 'Move the callback to prisma.$transaction. Middleware now runs inside the transaction timeout.',
          reason: '$transaction groups queries so they commit or roll back together. It does not register a hook around findMany.',
        },
        {
          option: 'Call $use on the adapter from @prisma/adapter-pg. Prisma 7 moved middleware onto the driver adapter.',
          reason: 'The adapter is the database driver bridge. Query customization stays on the client, through $extends, not on PrismaPg.',
        },
      ],
      fixedCode: {
        lang: 'ts',
        source: "import { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter }).$extends({\n  query: {\n    user: {\n      async findMany({ args, query }) {\n        return query(args);\n      },\n    },\n  },\n});",
      },
      example: {
        lang: 'ts',
        source: "import { PrismaClient } from './generated/prisma/client';\nimport { PrismaPg } from '@prisma/adapter-pg';\n\nconst adapter = new PrismaPg({\n  connectionString: process.env.DATABASE_URL,\n});\n\nexport const prisma = new PrismaClient({ adapter }).$extends({\n  query: {\n    user: {\n      async findMany({ args, query }) {\n        return query(args);\n      },\n    },\n  },\n});",
      },
      remember: 'Do not call prisma.$use. Extend the client with prisma.$extends.',
    },
  },
] satisfies Question[];
