import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

const MAX_CLASS_NAME_LENGTH = 100;

type ClassManagementErrorCode =
  | "INVALID_CLASS_NAME"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "EMAIL_NOT_VERIFIED";

export class ClassManagementError extends Error {
  constructor(public readonly code: ClassManagementErrorCode) {
    super(code);
    this.name = "ClassManagementError";
  }
}

type ClassCreatorRow = {
  role: string;
  email_verified_at: string | null;
};

export const normalizeClassJoinCode = (code: string) => {
  return code.trim().toUpperCase();
};

export const hashClassJoinCode = (code: string) => {
  return createHash("sha256")
    .update(normalizeClassJoinCode(code))
    .digest("hex");
};

const findClassCreator = db.prepare(`
  SELECT role, email_verified_at
  FROM users
  WHERE id = ?
`);

const insertClass = db.prepare(`
  INSERT INTO classes (
    name,
    created_by_user_id,
    join_code_hash
  )
  VALUES (?, ?, ?)
`);

const insertClassTeacher = db.prepare(`
  INSERT INTO class_teachers (class_id, teacher_id)
  VALUES (?, ?)
`);

const createClassTransaction = db.transaction(
  (name: string, teacherId: number, joinCodeHash: string) => {
    const teacher = findClassCreator.get(teacherId) as
      | ClassCreatorRow
      | undefined;

    if (!teacher) {
      throw new ClassManagementError("UNAUTHORIZED");
    }

    if (teacher.role !== "teacher") {
      throw new ClassManagementError("FORBIDDEN");
    }

    if (teacher.email_verified_at === null) {
      throw new ClassManagementError("EMAIL_NOT_VERIFIED");
    }

    const result = insertClass.run(name, teacherId, joinCodeHash);
    const classId = Number(result.lastInsertRowid);

    insertClassTeacher.run(classId, teacherId);

    return {
      id: classId,
      name,
      createdByUserId: teacherId,
    };
  },
);

export const createClassForTeacher = (teacherId: number, name: unknown) => {
  if (typeof name !== "string") {
    throw new ClassManagementError("INVALID_CLASS_NAME");
  }

  const normalizedName = name.trim();

  if (!normalizedName || normalizedName.length > MAX_CLASS_NAME_LENGTH) {
    throw new ClassManagementError("INVALID_CLASS_NAME");
  }

  const joinCode = randomBytes(8).toString("hex").toUpperCase();
  const joinCodeHash = hashClassJoinCode(joinCode);

  const schoolClass = createClassTransaction.immediate(
    normalizedName,
    teacherId,
    joinCodeHash,
  );

  return {
    schoolClass,
    joinCode,
  };
};

export type TeacherClass = {
  id: number;
  name: string;
  createdByUserId: number;
  createdAt: string;
};

export const getClassesForTeacher = (teacherId: number): TeacherClass[] => {
  return db
    .prepare(
      `
        SELECT
          classes.id,
          classes.name,
          classes.created_by_user_id AS createdByUserId,
          classes.created_at AS createdAt
        FROM classes
        INNER JOIN class_teachers
          ON class_teachers.class_id = classes.id
        WHERE class_teachers.teacher_id = ?
        ORDER BY classes.name COLLATE NOCASE ASC, classes.id ASC
      `,
    )
    .all(teacherId) as TeacherClass[];
};
