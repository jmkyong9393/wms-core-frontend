import { Edges } from '@react-three/drei';
import type { PackedBook } from '@/features/outbound/types/binPacking';

interface BookMeshProps {
  book: PackedBook;
}

// 책 한 권을 3D로 표시
export default function BookMesh({ book }: BookMeshProps) {
  return (
    <mesh position={book.position} rotation={book.rotation ?? [0, 0, 0]}>
      <boxGeometry args={[book.width, book.height, book.depth]} />
      <meshStandardMaterial color={book.color ?? '#94a3b8'} />
      <Edges color="#1f2937" />
    </mesh>
  );
}
