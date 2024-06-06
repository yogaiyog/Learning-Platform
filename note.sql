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


INSERT INTO student_additionalcourse_progress (nama, student_id, lesson_id, lesson_title, complete,course_id)
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
WHERE
    s.id = 1
ON CONFLICT (student_id, lesson_id) DO NOTHING;

--main course

INSERT INTO student_course_progress (nama, student_id, lesson_id, lesson_title, complete,course_id)
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

------------- buat tabel student-task-------------
ALTER SEQUENCE <tablename>_<id>_seq RESTART WITH 1
ALTER SEQUENCE student_task_student_task_id_seq RESTART WITH 1 --reset-seq

CREATE TABLE student_task (
    student_task_id SERIAL PRIMARY KEY,
    nama_student VARCHAR(255),
    student_id INT REFERENCES student(id),
    task_title VARCHAR(255),
    task_id INT REFERENCES task(id),
    on_going BOOLEAN DEFAULT FALSE,
    in_review BOOLEAN DEFAULT FALSE,
    complete BOOLEAN DEFAULT FALSE,
    CONSTRAINT one_status_true CHECK (
        (on_going IS TRUE AND in_review IS FALSE AND complete IS FALSE) OR
        (on_going IS FALSE AND in_review IS TRUE AND complete IS FALSE) OR
        (on_going IS FALSE AND in_review IS FALSE AND complete IS TRUE) OR
        (on_going IS FALSE AND in_review IS FALSE AND complete IS FALSE)
    ),
    CONSTRAINT unique_student_task UNIQUE (student_id, task_id)
);

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

    --------------------

--delete sudent--
delete from student_additionalcourse_progress where student_id = 20 ;
delete from student_course_progress where student_id = 20 ;
delete from student_task where student_id = 20 ;
delete from student where id = 20 ; --need 3 row aboce deleted first