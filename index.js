// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2/promise");
const cTable = require("console.table");

const mainQuery =
  'SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee e INNER JOIN role ON e.role_id = role.id  INNER JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.id = e.manager_id';
const lineBreak = "\n \n \n \n \n \n \n";

// Create possible options

const TEXT_VIEW_EMPLOYEES = "View all employees";
const TEXT_ADD_DEPARTMENT = "Add a department";
const TEXT_ADD_ROLE = "Add a role";
const TEXT_ADD_EMPLOYEE = "Add an employee";
const TEXT_VIEW_DEPARTMENTS = "View all departments";
const TEXT_VIEW_ROLES = "View all roles";
const TEXT_UPDATE_EMPLOYEE_ROLE = "Update employee role";
const TEXT_VIEW_EMPLOYEES_BY_ROLE = "View employees by role";
const TEXT_UPDATE_EMPLOYEE_MANAGER = "Update employee manager";
const TEXT_VIEW_EMPLOYEE_BY_MANAGER = "View employees by manager";
const TEXT_DELETE_DEPARTMENT = "Delete a department";
const TEXT_DELETE_ROLE = "Delete a role";
const TEXT_DELETE_EMPLOYEE = "Delete an employee";
const TEXT_VIEW_DEPARTMENT_BUDGET = "View all department budgets";
const EXIT = "Exit";
// creating connection to the database
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employees_db",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("You are connected at id: " + connection.threadId);
  queryUser();
});

// using inquirer to get input from the user

function queryUser() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        TEXT_VIEW_EMPLOYEES,
        TEXT_ADD_DEPARTMENT,
        TEXT_ADD_ROLE,
        TEXT_ADD_EMPLOYEE,
        TEXT_VIEW_DEPARTMENTS,
        TEXT_VIEW_ROLES,
        TEXT_UPDATE_EMPLOYEE_ROLE,
        TEXT_VIEW_EMPLOYEES_BY_ROLE,
        TEXT_UPDATE_EMPLOYEE_MANAGER,
        TEXT_VIEW_EMPLOYEE_BY_MANAGER,
        TEXT_DELETE_DEPARTMENT,
        TEXT_DELETE_ROLE,
        TEXT_DELETE_EMPLOYEE,
        TEXT_VIEW_DEPARTMENT_BUDGET,
        EXIT,
      ],
    })
    .then(function (answer) {
      switch (answer.action) {
        case TEXT_VIEW_EMPLOYEES:
          viewAllEmployees();
          break;
        case TEXT_ADD_DEPARTMENT:
          addDepartment();
          break;
        case TEXT_ADD_ROLE:
          addRole();
          break;
        case TEXT_ADD_EMPLOYEE:
          addEmployee();
          break;
        case TEXT_VIEW_DEPARTMENTS:
          viewDepartments();
          break;
        case TEXT_VIEW_ROLES:
          viewRoles();
          break;
        case TEXT_UPDATE_EMPLOYEE_ROLE:
          updateEmployeeRole();
          break;
        case TEXT_VIEW_EMPLOYEES_BY_ROLE:
          viewByRole();
          break;
        case TEXT_UPDATE_EMPLOYEE_MANAGER:
          updateManager();
          break;
        case TEXT_VIEW_EMPLOYEE_BY_MANAGER:
          viewByManager();
          break;
        case TEXT_DELETE_DEPARTMENT:
          deleteDepartment();
          break;
        case TEXT_DELETE_ROLE:
          deleteRole();
          break;
        case TEXT_DELETE_EMPLOYEE:
          deleteEmployee();
          break;
        case TEXT_VIEW_DEPARTMENT_BUDGET:
          viewBudgets();
          break;
        case EXIT:
          console.log("Goodbye");
          connection.end();
          break;
      }
    });
}
// A function needed to view all employees

function viewAllEmployees() {
  connection.query(mainQuery, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    console.log(lineBreak);
  });
  queryUser();
}
// A function needed to add department
function addDepartment() {
  inquirer
    .prompt({
      name: "department",
      type: "input",
      message: "What department would you like to add?",
    })
    .then(function (answer) {
      const { department } = answer;
      const query = "INSERT INTO department (name) VALUES(?)";
      connection.query(query, department, function (err, res) {
        if (err) throw err;
      });
      connection.query("SELECT * FROM DEPARTMENT", function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.table(res);
        console.log(lineBreak);
      });
      queryUser();
    });
}
// function used to add role to the application
function addRole() {
  connection.query("SELECT * FROM department", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "role",
          type: "input",
          message: "What is the role you would like to add?",
        },
        {
          name: "salary",
          type: "number",
          message: "What is the salary of this role?",
        },
        {
          name: "department",
          type: "rawlist",
          message: "What department does this role belong to?",
          choices: function () {
            choicesArray = [];
            for (var i = 0; i < results.length; i++) {
              choicesArray.push(results[i].id + ". " + results[i].name);
            }
            return choicesArray;
          },
        },
      ])
      .then(function (answer) {
        const { role, salary, department } = answer;
        const deptId = department.match(/(\d+)/);

        // const deptId = parseInt(department.charAt(0));
        const query =
          "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        connection.query(query, [role, salary, deptId[0]], function (err, res) {
          if (err) throw err;
        });
        const query2 =
          "SELECT role.id, title, salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id";
        connection.query(query2, function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          console.log(lineBreak);
        });
        queryUser();
      });
  });
}
// function to add employee
function addEmployee() {
  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message:
          "What is the first name of the employee you would like to add?",
      },
      {
        name: "lastName",
        type: "input",
        message: "What is the last name of the employee you would like to add?",
      },
    ])
    .then(function (answers) {
      const { firstName, lastName } = answers;
      connection.query("SELECT * FROM role", function (err, results) {
        if (err) throw err;
        inquirer
          .prompt({
            name: "role",
            type: "rawlist",
            message: "What is this employee's role?",
            choices: function () {
              choicesArray = [];
              for (var i = 0; i < results.length; i++) {
                choicesArray.push(results[i].id + ". " + results[i].title);
              }
              return choicesArray;
            },
          })
          .then(function (answer) {
            const role = answer.role;
            const roleId = role.match(/(\d+)/);
            connection.query("SELECT * FROM employee", function (err, results) {
              if (err) throw err;
              inquirer
                .prompt({
                  name: "manager",
                  type: "rawlist",
                  message: "Who is the manager of this employee?",
                  choices: function () {
                    choicesArray = [];
                    for (var i = 0; i < results.length; i++) {
                      choicesArray.push(
                        results[i].id +
                          ". " +
                          results[i].first_name +
                          " " +
                          results[i].last_name
                      );
                    }
                    return choicesArray;
                  },
                })
                .then(function (answer) {
                  const manager = answer.manager;
                  const managerId = manager.match(/(\d+)/);
                  const query =
                    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                  connection.query(
                    query,
                    [firstName, lastName, roleId[0], managerId[0]],
                    function (err, res) {
                      if (err) throw err;
                    }
                  );
                  connection.query(mainQuery, function (err, res) {
                    if (err) throw err;
                    console.log("\n");
                    console.table(res);
                    console.log(lineBreak);
                  });
                  queryUser();
                });
            });
          });
      });
    });
}
// function to view departments
function viewDepartments() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    console.log(lineBreak);
  });
  queryUser();
}
// function needed to view roles
function viewRoles() {
  const query =
    "SELECT role.id, title, salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    console.log(lineBreak);
  });
  queryUser();
}
// function for updating employee role
function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "employee",
        type: "rawlist",
        message: "Choose the employee you would like to update:",
        choices: function () {
          choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(
              results[i].id +
                ". " +
                results[i].first_name +
                " " +
                results[i].last_name
            );
          }
          return choicesArray;
        },
      })
      .then(function (answers) {
        const employee = answers.employee;
        const employeeId = employee.match(/(\d+)/);
        connection.query("SELECT * FROM role", function (err, result) {
          if (err) throw err;
          inquirer
            .prompt({
              name: "role",
              type: "rawlist",
              message: "What would you like their new role to be?",
              choices: function () {
                choicesArray = [];
                for (var i = 0; i < result.length; i++) {
                  choicesArray.push(result[i].id + ". " + result[i].title);
                }
                return choicesArray;
              },
            })
            .then(function (answers) {
              const role = answers.role;
              const roleId = role.match(/(\d+)/);
              connection.query("SELECT * FROM employee", function (err, res) {
                if (err) throw err;
                inquirer
                  .prompt({
                    name: "manager",
                    type: "rawlist",
                    message: "Who is the manager of this employee?",
                    choices: function () {
                      choicesArray = [];
                      for (var i = 0; i < results.length; i++) {
                        choicesArray.push(
                          results[i].id +
                            ". " +
                            results[i].first_name +
                            " " +
                            results[i].last_name
                        );
                      }
                      return choicesArray;
                    },
                  })
                  .then(function (answers) {
                    const manager = answers.manager;
                    const managerId = manager.match(/(\d+)/);
                    console.log(managerId);
                    const query =
                      "UPDATE employee SET role_id = ?, manager_id = ? WHERE id = ?";
                    connection.query(
                      query,
                      [roleId[0], managerId[0], employeeId[0]],
                      function (err, res) {
                        if (err) throw err;
                      }
                    );
                    connection.query(mainQuery, function (err, res) {
                      if (err) throw err;
                      console.log("\n");
                      console.table(res);
                      console.log(lineBreak);
                    });
                    queryUser();
                  });
              });
            });
        });
      });
  });
}
// function view role
function viewByRole() {
  connection.query("SELECT * FROM role", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "role",
        type: "rawlist",
        message: "What role would you like to see all employees for?",
        choices: function () {
          var choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(results[i].title);
          }
          return choicesArray;
        },
      })
      .then(function (answer) {
        const query =
          "SELECT employee.id, first_name, last_name FROM employee INNER JOIN role ON employee.role_id = role.id WHERE role.title = ?";
        connection.query(query, answer.role, function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          console.log(lineBreak);
        });
        queryUser();
      });
  });
}
// function to update the manager
function updateManager() {
  connection.query("SELECT * FROM employee", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "employee",
        type: "rawlist",
        message: "Choose the employee you would like to update:",
        choices: function () {
          choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(
              results[i].id +
                ". " +
                results[i].first_name +
                " " +
                results[i].last_name
            );
          }
          return choicesArray;
        },
      })
      .then(function (answers) {
        const employee = answers.employee;
        const employeeId = employee.match(/(\d+)/);
        connection.query("SELECT * FROM employee", function (err, res) {
          if (err) throw err;
          inquirer
            .prompt({
              name: "manager",
              type: "rawlist",
              message: "Who is the new manager of this employee?",
              choices: function () {
                choicesArray = [];
                for (var i = 0; i < results.length; i++) {
                  choicesArray.push(
                    results[i].id +
                      ". " +
                      results[i].first_name +
                      " " +
                      results[i].last_name
                  );
                }
                return choicesArray;
              },
            })
            .then(function (answers) {
              const manager = answers.manager;
              const managerId = manager.match(/(\d+)/);
              const query = "UPDATE employee SET manager_id = ? WHERE id = ?";
              connection.query(query, [managerId[0], employeeId[0]], function (
                err,
                res
              ) {
                if (err) throw err;
              });
              connection.query(mainQuery, function (err, res) {
                if (err) throw err;
                console.log("\n");
                console.table(res);
                console.log(lineBreak);
              });
              queryUser();
            });
        });
      });
  });
}
// function to view manager
function viewByManager() {
  connection.query("SELECT * FROM employee", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "manager",
        type: "rawlist",
        message: "Which manager's employees would you like to see?",
        choices: function () {
          choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(
              results[i].id +
                ". " +
                results[i].first_name +
                " " +
                results[i].last_name
            );
          }
          return choicesArray;
        },
      })
      .then(function (answer) {
        const manager = answer.manager;
        const managerId = manager.match(/(\d+)/);
        const query =
          'SELECT e.id, e.first_name, e.last_name, role.title, CONCAT(m.first_name, " ", m.last_name) AS manager FROM employee e INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee m ON m.id = e.manager_id WHERE m.id = ?';
        connection.query(query, managerId[0], function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          console.log(lineBreak);
        });
        queryUser();
      });
  });
}
// function needed to delete department
function deleteDepartment() {
  connection.query("SELECT * FROM department", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "department",
        type: "rawlist",
        message: "What department would you like to delete?",
        choices: function () {
          choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(results[i].id + ". " + results[i].name);
          }
          return choicesArray;
        },
      })
      .then(function (answer) {
        const department = answer.department;
        const deptId = department.match(/(\d+)/);
        const query = "DELETE FROM department WHERE id = ?";
        connection.query(query, deptId[0], function (err, res) {
          if (err) throw err;
        });
        connection.query("SELECT * FROM department", function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          console.log(lineBreak);
        });
        queryUser();
      });
  });
}
// function needed to delete role
function deleteRole() {
  connection.query("SELECT * FROM role", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "role",
        type: "rawlist",
        message: "What role would you like to delete?",
        choices: function () {
          choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(results[i].id + ". " + results[i].title);
          }
          return choicesArray;
        },
      })
      .then(function (answer) {
        const role = answer.role;
        const roleId = role.match(/(\d+)/);
        const query = "DELETE FROM role WHERE id = ?";
        connection.query(query, roleId[0], function (err, res) {
          if (err) throw err;
        });
        connection.query(
          "SELECT role.id, title, salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id",
          function (err, res) {
            if (err) throw err;
            console.log("\n");
            console.table(res);
            console.log(lineBreak);
          }
        );
        queryUser();
      });
  });
}
// function to delete employee
function deleteEmployee() {
  connection.query("SELECT * FROM employee", function (err, results) {
    if (err) throw err;
    inquirer
      .prompt({
        name: "employee",
        type: "rawlist",
        message: "What employee would you like to delete?",
        choices: function () {
          choicesArray = [];
          for (var i = 0; i < results.length; i++) {
            choicesArray.push(
              results[i].id +
                ". " +
                results[i].first_name +
                " " +
                results[i].last_name
            );
          }
          return choicesArray;
        },
      })
      .then(function (answer) {
        const employee = answer.employee;
        const employeeId = employee.match(/(\d+)/);
        const query = "DELETE FROM employee WHERE id = ?";
        connection.query(query, employeeId[0], function (err, res) {
          if (err) throw err;
        });
        connection.query(mainQuery, function (err, res) {
          if (err) throw err;
          console.log("\n");
          console.table(res);
          console.log(lineBreak);
        });
        queryUser();
      });
  });
}
// function to view budget
function viewBudgets() {
  const query =
    "SELECT department.id, name, SUM(role.salary) total_dept_budget FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee ON role.id = employee.role_id GROUP BY department.id";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    console.log(lineBreak);
  });
  queryUser();
}
