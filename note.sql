 -- menghitung total_lessons-------------------------------

UPDATE additional_course
SET total_lesson = (
    SELECT COUNT(additional_course_lesson.id)
    FROM additional_course_lesson
    WHERE additional_course.id = additional_course_lesson.additional_course_id
    GROUP BY additional_course_id
)
WHERE id IN (
    SELECT DISTINCT additional_course_id
    FROM additional_course_lesson
);

---

UPDATE main_course
SET total_lesson = (
    SELECT COUNT(main_course_lesson.id)
    FROM main_course_lesson
    WHERE main_course.id = main_course_lesson.main_course_id
    GROUP BY main_course_id
)
WHERE id IN (
    SELECT DISTINCT main_course_id
    FROM main_course_lesson
);


-- Membuat tabel student_additionalcourse_progress
CREATE TABLE IF NOT EXISTS student_additionalcourse_progress (
    student_additionalcourse_id SERIAL PRIMARY KEY,
    nama VARCHAR(50),
    student_id INTEGER,
    lesson_id INTEGER,
    lesson_title VARCHAR(255),
    complete BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_student_additionalcourse_lesson UNIQUE (student_id, lesson_id)
);


INSERT INTO student_additionalcourse_progress (nama, student_id, lesson_id, lesson_title, complete)
SELECT
    s.nama,
    s.id AS student_id,
    a.id AS lesson_id,
    a.lesson_title,
    FALSE
FROM
    student s
CROSS JOIN
    additional_course_lesson a
WHERE
    s.id = 1
ON CONFLICT (student_id, lesson_id) DO NOTHING;
 --------------------------------------------------

------ cari persentase total complete --------------
SELECT
    course_id,
    ROUND((SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100) AS percentage_true
FROM
    student_course_progress
WHERE 
    student_id = 1 AND course_id IN (1, 2, 3)
GROUP BY
    course_id 

