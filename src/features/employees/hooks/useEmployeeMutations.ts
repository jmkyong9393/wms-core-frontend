"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEmployee,
  updateEmployeeStatus,
  updateEmployeeRole,
} from "@/features/employees/api/employeeService";
import { employeeKeys } from "@/features/employees/constants/queryKeys";
import type {
  CreateEmployeeRequest,
  UpdateEmployeeStatusRequest,
  UpdateEmployeeRoleRequest,
} from "@/features/employees/types/employee";

/**
 * 직원 관리 변경 요청 훅
 *
 * 직원 생성, 계정 상태 변경, 역할 변경 요청 처리
 * 요청 성공 후 직원 목록을 다시 불러와 최신 상태 반영
 */

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployeeStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateEmployeeStatusRequest;
    }) => updateEmployeeStatus(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployeeRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateEmployeeRoleRequest;
    }) => updateEmployeeRole(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}
