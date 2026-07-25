import { mockPackedBooks } from '@/features/outbound/mocks/mockPackedBooks';
import { mockSelectedPostalBox } from '@/features/outbound/mocks/mockSelectedPostalBox';
import { GRID_SIZE, GRID_DIVISIONS } from '@/features/outbound/constants/binPackingScene';
import BookMesh from '@/features/outbound/components/BookMesh';

export default function BinPackingScene() {
  const { width: boxWidth, height: boxHeight, depth: boxDepth } = mockSelectedPostalBox;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} />

      <gridHelper args={[GRID_SIZE, GRID_DIVISIONS]} />

      {/* 선택된 우체국 박스의 적재 공간 */}
      <mesh position={[0, boxHeight / 2, 0]}>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshBasicMaterial color="#64748b" wireframe />
      </mesh>

      {mockPackedBooks.map((book) => (
        <BookMesh key={book.id} book={book} />
      ))}
    </>
  );
}
