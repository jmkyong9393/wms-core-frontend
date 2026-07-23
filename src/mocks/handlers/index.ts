import { authHandlers } from "@/mocks/handlers/authHandlers";
import { employeeHandlers } from "@/mocks/handlers/employeeHandlers";
import { inventoryHandlers } from "@/mocks/handlers/inventoryHandlers";

export const handlers = [...authHandlers, ...employeeHandlers, ...inventoryHandlers];
