// CRUD básico (mock)
const db = {
  students: [],
  teachers: []
};

export function addStudent(student) { db.students.push(student); }
export function getStudents() { return db.students; }
export function addTeacher(teacher) { db.teachers.push(teacher); }
export function getTeachers() { return db.teachers; }