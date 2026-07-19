import { authHandlers } from "@/mocks/handlers/authHandlers";
import { employeeHandlers } from "@/mocks/handlers/employeeHandlers";

export const handlers = [...authHandlers, ...employeeHandlers];
