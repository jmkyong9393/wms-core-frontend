import type { PickingInstructionItem, PickingZoneGroup } from '@/features/picking/types/picking';

// 위치 정보가 포함된 피킹 항목
export interface FlattenedPickingItem extends PickingInstructionItem {
  zone: string;
  rack: string;
  shelf: string;
}

// 위치별로 묶인 피킹 항목을 순서대로 하나의 배열로 변환
export function flattenPickingGroups(groups: PickingZoneGroup[]): FlattenedPickingItem[] {
  const flattened: FlattenedPickingItem[] = [];
  for (const zoneGroup of groups) {
    for (const rackGroup of zoneGroup.racks) {
      for (const shelfGroup of rackGroup.shelves) {
        for (const item of shelfGroup.items) {
          flattened.push({ ...item, zone: zoneGroup.zone, rack: rackGroup.rack, shelf: shelfGroup.shelf });
        }
      }
    }
  }
  return flattened;
}
