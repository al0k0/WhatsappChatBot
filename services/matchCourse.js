function matchCourse(text, courses) {
  const query = text.toLowerCase();

  return courses.find(course =>
    course.name.toLowerCase().includes(query)
  );
}

module.exports = matchCourse;
