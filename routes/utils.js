// routes/utils.js
import db from '../db.js';  // Ensure the path is correct

export async function NewStudent() {
  try {
    await db.query(`
      INSERT INTO student_additionalcourse_progress (nama, student_id, lesson_id, lesson_title, complete, course_id)
      SELECT
          s.nama,
          s.id AS student_id,
          a.id AS lesson_id,
          a.lesson_title,
          FALSE,
          a.additional_course_id
      FROM
          student s
      CROSS JOIN
          additional_course_lesson a
      ON CONFLICT (student_id, lesson_id) DO NOTHING;
    `);

    await db.query(`
      INSERT INTO student_course_progress (nama, student_id, lesson_id, lesson_title, complete, course_id)
      SELECT
          s.nama,
          s.id AS student_id,
          a.id AS lesson_id,
          a.lesson_title,
          FALSE,
          a.main_course_id
      FROM
          student s
      CROSS JOIN
          main_course_lesson a
      ON CONFLICT (student_id, lesson_id) DO NOTHING;
    `);

    await db.query(`
      INSERT INTO student_task (nama_student, student_id, task_title, task_id, on_going, in_review, complete, task_body)
      SELECT
          s.nama AS nama_student,
          s.id AS student_id,
          t.task_title AS task_title,
          t.id AS task_id,
          TRUE AS on_going,
          FALSE AS in_review,
          FALSE AS complete,
          t.task_body
      FROM
          student s
      CROSS JOIN
          task t
      ON CONFLICT (student_id, task_id) DO NOTHING;
    `);
  } catch (err) {
    console.log("Failed to insert new data to students progress", err);
  }
}

export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
