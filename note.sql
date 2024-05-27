 -- menghitung total lessons-------------------------------

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


-- buat tabel student_lesson_progres---------------------------

CREATE TABLE student_course_progress (
    student_course_id SERIAL PRIMARY KEY,
    nama VARCHAR(50),
    student_id INTEGER,
    course_id INTEGER,
    lesson_title VARCHAR(255),
    complete BOOLEAN DEFAULT FALSE
);
        -- Masukkan data gabungan dari tabel student dan main_course_lesson
INSERT INTO student_course_progress (nama, student_id, course_id, lesson_title, complete)
SELECT
    s.nama,
    s.id,  
    m.main_course_id,
    m.lesson_title,
    FALSE  -- Set complete to false for each row
FROM
    student s
CROSS JOIN
    main_course_lesson m;
 --------------------------------------------------

------ cari persentase total complete --------------
SELECT
    (SUM(CASE WHEN complete = true THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100 AS percentage_true
FROM
    student_course_progress
where 
	course_id = 1

