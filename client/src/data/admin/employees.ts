import type { Employee } from "@/types/admin";

import { isoDate, pickCompanyId } from "./helpers";
import { departmentName, designationName } from "./org";

const baseEmployees: Employee[] = [
  { id: "emp_EMP-0001", name: "User One", employeeId: 1001, companyId: pickCompanyId(0), departmentId: "dept_ehs", designationId: "desig_officer", department: departmentName("dept_ehs"), designation: designationName("desig_officer"), status: 1, email: "userone@example.test", joinedOn: isoDate(520) },
  { id: "emp_EMP-0002", name: "User Two", employeeId: 1002, companyId: pickCompanyId(1), departmentId: "dept_compliance", designationId: "desig_executive", department: departmentName("dept_compliance"), designation: designationName("desig_executive"), status: 1, email: "usertwo@example.test", joinedOn: isoDate(740) },
  { id: "emp_EMP-0003", name: "User Three", employeeId: 1003, companyId: pickCompanyId(2), departmentId: "dept_utility", designationId: "desig_engineer", department: departmentName("dept_utility"), designation: designationName("desig_engineer"), status: 1, email: "userthree@example.test", joinedOn: isoDate(410) },
  { id: "emp_EMP-0004", name: "User Four", employeeId: 1004, companyId: pickCompanyId(3), departmentId: "dept_admin", designationId: "desig_supervisor", department: departmentName("dept_admin"), designation: designationName("desig_supervisor"), status: 1, email: "userfour@example.test", joinedOn: isoDate(1020) },
  { id: "emp_EMP-0005", name: "User Five", employeeId: 1005, companyId: pickCompanyId(4), departmentId: "dept_production", designationId: "desig_supervisor", department: departmentName("dept_production"), designation: designationName("desig_supervisor"), status: 1, email: "userfive@example.test", joinedOn: isoDate(860) },
  { id: "emp_EMP-0006", name: "User Six", employeeId: 1006, companyId: pickCompanyId(5), departmentId: "dept_admin", designationId: "desig_manager", department: departmentName("dept_admin"), designation: designationName("desig_manager"), status: 1, email: "usersix@example.test", joinedOn: isoDate(1200) },
  { id: "emp_EMP-0007", name: "User Seven", employeeId: 1007, companyId: pickCompanyId(0), departmentId: "dept_admin", designationId: "desig_officer", department: departmentName("dept_admin"), designation: designationName("desig_officer"), status: 0, email: "userseven@example.test", joinedOn: isoDate(1600) },
];

const generatedEmployees = Array.from({ length: 13 }).map((_, i) => {
  const n = i + 1;
  const employeeId = 2000 + i + 1;
  const departmentId = i % 2 ? "dept_production" : "dept_maintenance";
  const designationId = i % 3 ? "desig_officer" : "desig_technician";
  return { id: `emp_${employeeId}`, name: `Employee ${n}`, employeeId, companyId: pickCompanyId(i), departmentId, designationId, department: departmentName(departmentId), designation: designationName(designationId), status: i % 5 === 0 ? 0 : 1, email: `employee${n}@example.test`, joinedOn: isoDate(200 + i * 20) } satisfies Employee;
});

export const seedEmployees: Employee[] = [...baseEmployees, ...generatedEmployees];
