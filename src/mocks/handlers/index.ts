import { authHandlers } from "@/mocks/handlers/authHandlers";
import { employeeHandlers } from "@/mocks/handlers/employeeHandlers";
import { inventoryHandlers } from "@/mocks/handlers/inventoryHandlers";
import { inspectionHandlers } from "@/mocks/handlers/inspectionHandlers";
import { dashboardHandlers } from "@/mocks/handlers/dashboardHandlers";
import { lpnPrinterHandlers } from "@/mocks/handlers/lpnPrinterHandlers";

export const handlers = [
  ...authHandlers,
  ...employeeHandlers,
  ...inventoryHandlers,
  ...inspectionHandlers,
  ...dashboardHandlers,
  ...lpnPrinterHandlers,
];
