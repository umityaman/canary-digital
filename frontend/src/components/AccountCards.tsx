import React, { useState } from 'react';
import AccountCardList from './accounting/AccountCardList';
import AccountCardDetail from './accounting/AccountCardDetail';

export default function AccountCards() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cari Hesap Kartlarý</h1>
          <p className="text-sm text-gray-600 mt-1">
            Müþteri ve tedarikçi cari hesap yönetimi
          </p>
        </div>
      </div>

      {selectedCardId ? (
        <AccountCardDetail
          accountCardId={selectedCardId}
          onBack={() => setSelectedCardId(null)}
        />
      ) : (
        <AccountCardList onSelectCard={(card) => setSelectedCardId(card.id)} />
      )}
    </div>
  );
}
