import { Card } from '@/components/ui/card';
import { mockOrderBooks } from '@/features/outbound/mocks/mockOrderBooks';

// 주문 도서 정보 표시
export default function OrderBooksPanel() {
  return (
    <Card className="p-5">
      <h3 className="text-base font-bold text-foreground mb-3">주문 도서 ({mockOrderBooks.length}권)</h3>
      <ul className="space-y-3">
        {mockOrderBooks.map((book) => (
          <li key={book.id} className="pb-3 border-b border-border last:border-b-0 last:pb-0">
            <p className="text-sm font-semibold text-foreground">{book.title}</p>
            <p className="text-sm text-foreground/80">
              {book.widthMm} × {book.depthMm} × {book.thicknessMm.toFixed(1)} mm
            </p>
            <p className="text-xs text-muted-foreground">{book.pageCount}쪽</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
