USE toptest_db;

INSERT INTO department
VALUES (1, "Engineering"),
    (2, "Sales"),
    (3, "Finance"),
    (4, "Legal");

INSERT INTO role
VALUES (1, "Lead Engineer", 160000, 1),
    (2, "Software Engineer", 120000, 1),
    (3, "Sales Lead", 110000, 2),
    (4, "Salesperson", 90000, 2),
    (5, "Lead Accountant", 140000, 3),
    (6, "Accountant", 120000, 3),
    (7, "Legal Team Lead", 200000, 4),
    (8, "Lawyer", 170000, 4);

INSERT INTO employee
VALUES (1, "John", "Doe", 2, 2),
    (2, "Jane", "Shelby", 1, null),
    (3, "Robert", "Vance", 6, 8),
    (4, "James", "Halpert", 4, 6),
    (5, "Leslie", "Knope", 7, null),
    (6, "Bob", "Ross", 3, null),
    (7, "Candy", "Quackenbush", 4, 6),
    (8, "Julie", "Mao", 5, null),
    (9, "Vincent", "McMorrow", 2, 2),
    (10, "Martha", "Jones", 8, 5);


SELECT * FROM employees_db.employee;
