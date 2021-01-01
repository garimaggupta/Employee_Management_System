var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");
var figlet = require("figlet");

//MYSQL Connection Details
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "employee_DB",
});

//Connect to the database
connection.connect(function (err) {
  if (err) throw err;

//Figet ASCII ART to display application name
  figlet("EMPLOYEE TRACKER", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);

// Call the main function that will present user with list of operations they can perform on employee database
    main();
  });
});

/* This function will present user set of choices to manage their employee database*/
function main() {
  inquirer
    .prompt([
      {
        type: "rawlist",
        message: "What would you like to do?",
        name: "userInput",
        choices: [
          "View Departments",
          "Add New Department",
          "Remove Department",
          "View Roles",
          "Add New Role",
          "Remove Role",
          "View all Employees",
          "View all Employees by Department",
          "View all Employees by Manager",
          "Add Employee",
          "Update Employee Role",
          "Update Employee Manager",
          "Remove Employee",
          "View Total Budget by Department",
          "Exit",
        ],
      },
    ])
    .then(function (response) {
      switch (response.userInput) {
        case "View Departments":
          viewDept();
          break;
        case "Add New Department":
          addDept();
          break;
        case "Remove Department":
          removeDept();
          break;
        case "View Roles":
          viewRole();
          break;
        case "Add New Role":
          addRole();
          break;
        case "Remove Role":
          removeRole();
          break;
        case "View all Employees":
          viewEmployees();
          break;
        case "View all Employees by Department":
          viewEmployeebyDept();
          break;
        case "View all Employees by Manager":
          viewEmployeebyManager();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployeeRole();
          break;
        case "Update Employee Manager":
          updateEmployeeManager();
          break;
        case "Remove Employee":
          removeEmployee();
          break;
        case "View Total Budget by Department":
          viewBudget();
          break;
        case "Exit":
          connection.end();
      }
    });
}

/* This function will display the list of current departments in the database */
function viewDept() {
  var query = connection.query(
    `select id,name from department`,
    function (err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      console.log(table);
      main();
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will display the list of current employee roles in the database */
function viewRole() {
  var query = connection.query(
    `select id, title,salary,department_id from role`,
    function (err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      console.log(table);
      main();
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will display the list of current employees in the database */
function viewEmployees() {
  var query = connection.query(`select e.id as 'Employee ID', e.first_name as 'First Name', e.last_name as 'Last Name', r.title as 'Employee Job Title', r.salary as 'Employee Salary', d.name as 'Department Name' from employee e, role r, department d where d.id=r.department_id and e.role_id = r.id`, function (err, res) {
    if (err) throw err;
    const table = cTable.getTable(res);
    console.log(table);
    main();
  });
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will display the list of all the employees ordered by their Department */
function viewEmployeebyDept() {
  var query = connection.query(
    "select e.first_name as 'Employee First Name', e.last_name as 'Employee Last Name', d.name as 'Employee Department' from employee e, department d, role r where d.id = r.department_id and r.id = e.role_id order by d.name",
    function (err, res) {
      if (err) throw err;
      const table = cTable.getTable(res);
      console.log(table);
      main();
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will filter and display the list of Employees by specific manager (Manager list provided to the user to choose from) */
function viewEmployeebyManager() {
  var query = connection.query(
    "select distinct m.id,m.first_name,m.last_name from employee e, employee m where e.manager_id = m.id",
    function (err, managerResponse) {
      if (err) throw err;
      let managerArr = [];

      managerResponse.forEach((element) => {
        managerArr.push(element.first_name + " " + element.last_name);
      });

      inquirer
        .prompt([
          {
            type: "rawlist",
            message: "Select the Manager Name",
            name: "managerName",
            choices: managerArr,
          },
        ])
        .then(function (answer) {
          let managerID;
          for (var i = 0; i < managerResponse.length; i++) {
            if (
              managerResponse[i].first_name +
                " " +
                managerResponse[i].last_name ===
              answer.managerName
            ) {
              managerID = managerResponse[i].id;
            }
          }

          var query1 = connection.query(
            `select e.id, e.first_name, e.last_name, r.title from employee e, role r where e.role_id = r.id and manager_id = ${managerID}`,
            function (err, res) {
              if (err) throw err;
              const table = cTable.getTable(res);
              console.log(table);
              main();
            }
          );
          console.log(query1.sql);
        });
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}


/* This function will take the department name as a input from the user and create new department entry in the database */
function addDept() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter the new department name",
        name: "deptName",
      },
    ])
    .then(function (response) {
      var query = connection.query(
        `insert into department (name) values ("${response.deptName}")`,
        function (err, res) {
          if (err) throw err;
          console.log("Department created successfully!");
          main();
        }
      );
      // logs the actual query being run
      console.log(query.sql);
    });
}

/* This function will take the role name as a input from the user and create new role entry in the database */
function addRole() {
  var query = connection.query(`select * from department`, function (err, res) {
    if (err) console.log(err);
    let deptArr = []; //this array will hold list of current departments
    for (obj of res) {
      deptArr.push(obj.name);
    }
    inquirer
      .prompt([
        {
          type: "input",
          message: "Enter the new role title",
          name: "roleTitle",
        },
        {
          type: "input",
          message: "Enter the new role salary",
          name: "roleSalary",
        },
        {
          type: "rawlist",
          message: "Select the department",
          name: "deptName",
          choices: deptArr, 
        },
      ])
      .then(function (response) {
        console.log(response);

        var chosenItem;
        for (var i = 0; i < res.length; i++) {
          if (res[i].name === response.deptName) {
            chosenItem = res[i].id;
          }
        }

        connection.query(
          "insert into role SET ? ",
          {
            title: response.roleTitle,
            salary: response.roleSalary,
            department_id: chosenItem || 0,
          },
          function (err) {
            if (err) throw err;
            console.log("Role created successfully!");
            main();
          }
        );
      });
  });
}

/* This function will take the employee details as a input from the user and create new employee entry in the database */
function addEmployee() {
  var query1 = connection.query(
    `select * from role`,
    function (err, rolesResponse) {
      if (err) throw err;
      var query2 = connection.query(
        `select distinct m.id, m.first_name , m.last_name from employee e, employee m where e.manager_id = m.id;`,
        function (err, managerResponse) {
          if (err) throw err;
          inquirer
            .prompt([
              {
                name: "firstName",
                type: "input",
                message: "Enter Employee's first name",
              },
              {
                name: "lastName",
                type: "input",
                message: "Enter Employee's last name",
              },
              {
                name: "chosenRole",
                type: "rawlist",
                choices: function () {
                  var roleArray = [];
                  for (var i = 0; i < rolesResponse.length; i++) {
                    roleArray.push(rolesResponse[i].title);
                  }
                  return roleArray;
                },
                message: "Select Employee's role",
              },
              {
                name: "chosenManager",
                type: "rawlist",
                choices: function () {
                  var managerArray = [];
                  for (var i = 0; i < managerResponse.length; i++) {
                    managerArray.push(
                      managerResponse[i].first_name +
                        " " +
                        managerResponse[i].last_name
                    );
                  }
                  return managerArray;
                },
                message: "Select Employee's Manager",
              },
            ])
            .then(function (answer) {
              var roleID;
              for (var i = 0; i < rolesResponse.length; i++) {
                if (rolesResponse[i].title === answer.chosenRole) {
                  roleID = rolesResponse[i];
                }
              }

              var managerID;
              for (var i = 0; i < managerResponse.length; i++) {
                if (
                  managerResponse[i].first_name +
                    " " +
                    managerResponse[i].last_name ===
                  answer.chosenManager
                ) {
                  managerID = managerResponse[i];
                }
              }

              var query3 = connection.query(
                "insert into employee SET ?",
                {
                  first_name: answer.firstName,
                  last_name: answer.lastName,
                  role_id: roleID.id,
                  manager_id: managerID.id,
                },
                function (err) {
                  if (err) throw err;
                  console.log("Employee record created successfully!");
                  main();
                }
              );
              // logs the actual query being run
              console.log(query3.sql);
            });
        }
      );
    }
  );
}


/* This function will provide total budget (sum of salaries of all employees in specified department) of the chosen department */
function viewBudget() {
  var query = connection.query(
    `select * from department`,
    function (err, deptResponse) {
      if (err) throw err;
      let deptArr = [];
      deptResponse.forEach((element) => {
        deptArr.push(element.name);
      });

      inquirer
        .prompt([
          {
            name: "chosenDept",
            type: "rawlist",
            message: "Choose the department name",
            choices: deptArr,
          },
        ])
        .then(function (answer) {
          let chosenDeptID;
          deptResponse.forEach((element) => {
            if (element.name === answer.chosenDept) chosenDeptID = element.id;
          });

          var query1 = connection.query(
            `select sum(salary) as 'Total Budget' from role where department_id = ${chosenDeptID}`,
            function (err, res) {
              if (err) throw err;
              const table = cTable.getTable(res);
              console.log(table);
              main();
            }
          );
          console.log(query1.sql);
        });
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will update role of the employee to new one. Current Employee and Role information is queried from the database and user is presented to user as a list to choose from */
function updateEmployeeRole() {
  var query = connection.query(
    `select * from employee`,
    function (err, employeeResponse) {
      if (err) throw err;
      let employeeArr = [];
      employeeResponse.forEach((element) => {
        employeeArr.push(element.first_name + " " + element.last_name);
      });

      inquirer
        .prompt([
          {
            name: "chosenEmployee",
            type: "rawlist",
            message: "Choose the Employee Name",
            choices: employeeArr,
          },
        ])
        .then(function (answer) {
          let chosenEmployeeID;
          employeeResponse.forEach((element) => {
            if (
              element.first_name + " " + element.last_name ===
              answer.chosenEmployee
            )
              chosenEmployeeID = element.id;
          });

          var query1 = connection.query(
            `select * from role`,
            function (err, roleResponse) {
              if (err) throw err;
              let roleArr = [];
              roleResponse.forEach((element) => {
                roleArr.push(element.title);
              });

              inquirer
                .prompt([
                  {
                    name: "chosenRole",
                    type: "rawlist",
                    message: "Choose the new Role",
                    choices: roleArr,
                  },
                ])
                .then(function (answer) {
                  let chosenRoleID;
                  roleResponse.forEach((element) => {
                    if (element.title === answer.chosenRole)
                      chosenRoleID = element.id;
                  });

                  var query3 = connection.query(
                    `update employee set role_id = ${chosenRoleID} where id = ${chosenEmployeeID}`,
                    function (err, res) {
                      if (err) throw err;
                      console.log("Employee role updated successfully");
                      main();
                    }
                  );
                  console.log(query3.sql);
                });
            }
          );
          console.log(query1.sql);
        });
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will update Employee's manager. Current Employee and manager information is queried from the database and user is presented to user as a list to choose from */
function updateEmployeeManager() {
  var query = connection.query(
    `select * from employee`,
    function (err, employeeResponse) {
      if (err) throw err;
      let employeeArr = [];
      employeeResponse.forEach((element) => {
        employeeArr.push(element.first_name + " " + element.last_name);
      });

      inquirer
        .prompt([
          {
            name: "chosenEmployee",
            type: "rawlist",
            message: "Choose the Employee Name",
            choices: employeeArr,
          },
        ])
        .then(function (answer) {
          let chosenEmployeeID;
          employeeResponse.forEach((element) => {
            if (
              element.first_name + " " + element.last_name ===
              answer.chosenEmployee
            )
              chosenEmployeeID = element.id;
          });

          var query1 = connection.query(
            `select distinct m.id, m.first_name , m.last_name from employee e, employee m where e.manager_id = m.id;`,
            function (err, managerResponse) {
              if (err) throw err;
              let managerArr = [];
              managerResponse.forEach((element) => {
                managerArr.push(element.first_name + " " + element.last_name);
              });

              inquirer
                .prompt([
                  {
                    name: "chosenManager",
                    type: "rawlist",
                    message: "Choose the new Manager",
                    choices: managerArr,
                  },
                ])
                .then(function (answer) {
                  let chosenmanagerID;
                  managerResponse.forEach((element) => {
                    if (
                      element.first_name + " " + element.last_name ===
                      answer.chosenManager
                    )
                      chosenmanagerID = element.id;
                  });

                  var query3 = connection.query(
                    `update employee set manager_id = ${chosenmanagerID} where id = ${chosenEmployeeID}`,
                    function (err, res) {
                      if (err) throw err;
                      console.log("Employee manager updated successfully");
                      main();
                    }
                  );
                  console.log(query3.sql);
                });
            }
          );
          console.log(query1.sql);
        });
    }
  );
  // logs the actual query being run
  console.log(query.sql);
}

/* This function will delete an employee from the current list of employees */
function removeEmployee() {
  var query = connection.query(
    `select * from employee`,
    function (err, employeeResponse) {
      if (err) throw err;
      let employeeArr = [];
      employeeResponse.forEach((element) => {
        employeeArr.push(element.first_name + " " + element.last_name);
      });

      inquirer
        .prompt([
          {
            name: "chosenEmployee",
            type: "rawlist",
            message: "Choose the Employee Name you would like to remove",
            choices: employeeArr,
          },
        ])
        .then(function (answer) {
          let chosenEmployeeID;
          employeeResponse.forEach((element) => {
            if (
              element.first_name + " " + element.last_name ===
              answer.chosenEmployee
            )
              chosenEmployeeID = element.id;
          });

          var query1 = connection.query(
            `delete from employee where id = ${chosenEmployeeID}`,
            function (err, managerResponse) {
              if (err) throw err;
              console.log("Employee removed successfully");
              main();
            }
          );
          console.log(query1.sql);
        });
      console.log(query.sql);
    }
  );
}

/* This function will delete a specific user-chosen role from database. Records are deleted from two tables
 1. Employee table - all employees that are assigned the role chosen from deletion
 2. Role table - delete the chosen role
 */
function removeRole() {
  var query = connection.query(
    `select * from role`,
    function (err, roleResponse) {
      if (err) throw err;
      let roleArr = [];
      roleResponse.forEach((element) => {
        roleArr.push(element.title);
      });

      inquirer
        .prompt([
          {
            name: "chosenRole",
            type: "rawlist",
            message: "Choose the Role that you would like to remove",
            choices: roleArr,
          },
        ])
        .then(function (answer) {
          let chosenRoleID;
          roleResponse.forEach((element) => {
            if (element.title === answer.chosenRole) chosenRoleID = element.id;
          });

          var query1 = connection.query(
            `delete from employee where role_id = ${chosenRoleID}`,
            function (err, res) {
              if (err) throw err;
              var query2 = connection.query(
                `delete from role where id = ${chosenRoleID}`,
                function (err, res) {
                  if (err) throw err;
                  console.log("Role removed successfully");
                  main();
                }
              );
              console.log(query2.sql);
            }
          );
          console.log(query1.sql);
        });
      console.log(query.sql);
    }
  );
}

/* This function will delete a specific user-chosen department from database. Records are deleted from three tables
 1. Employee table - all employees that are assigned the department chosen from deletion
 2. Role table - all roles assigned to the department that are chosen for deletion
 3. Department table - delete the chosen department
 */

function removeDept() {
  var query = connection.query(
    `select * from department`,
    function (err, deptResponse) {
      if (err) throw err;
      let deptArr = [];
      deptResponse.forEach((element) => {
        deptArr.push(element.name);
      });

      inquirer
        .prompt([
          {
            name: "chosendept",
            type: "rawlist",
            message: "Choose the Department that you would like to remove",
            choices: deptArr,
          },
        ])
        .then(function (answer) {
          let chosendeptID;
          deptResponse.forEach((element) => {
            if (element.name === answer.chosendept) chosendeptID = element.id;
          });

          var query1 = connection.query(
            `delete from employee where role_id in (select id from role where department_id=${chosendeptID})`,
            function (err, res) {
              if (err) throw err;
              var query2 = connection.query(
                `delete from role where department_id = ${chosendeptID}`,
                function (err, res) {
                  if (err) throw err;
                  var query3 = connection.query(
                    `delete from department where id=${chosendeptID}`,
                    function (err, res) {
                      if (err) throw err;
                      console.log("Department removed successfully");
                      main();
                    }
                  );
                  console.log(query3.sql);
                }
              );
              console.log(query2.sql);
            }
          );
          console.log(query1.sql);
        });
      console.log(query.sql);
    }
  );
}
