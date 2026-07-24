import { authHandlers } from "@/mocks/handlers/authHandlers";
import { employeeHandlers } from "@/mocks/handlers/employeeHandlers";
import { inventoryHandlers } from "@/mocks/handlers/inventoryHandlers";
import { inspectionHandlers } from "@/mocks/handlers/inspectionHandlers";

export const handlers = [...authHandlers, ...employeeHandlers, ...inventoryHandlers, ...inspectionHandlers];
