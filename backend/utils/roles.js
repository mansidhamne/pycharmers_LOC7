// utils/roles.js

const ROLE_HIERARCHY = {
    ceo: 4,
    dept_head: 3,
    manager: 2,
    team_lead: 1,
    employee: 0
  };
  
  const APPROVAL_CHAIN = {
    ceo: [],
    dept_head: ["ceo"],
    manager: ["dept_head", "ceo"],
    team_lead: ["manager", "dept_head", "ceo"],
    employee: ["team_lead", "manager", "dept_head", "ceo"]
  };
  
  module.exports = { ROLE_HIERARCHY, APPROVAL_CHAIN };
  