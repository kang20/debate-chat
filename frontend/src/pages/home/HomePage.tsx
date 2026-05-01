import { useEffect, useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useRoomStore } from '@/stores/roomStore';
import { useAuthStore } from '@/stores/authStore';
import { RoomCard } from './components/RoomCard';
import { RoomFilters } from './components/RoomFilters';
import { CreateRoomModal } from './components/CreateRoomModal';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export function HomePage() {
  const { rooms, isLoading, page, totalPages, filters, fetchRooms, setFilters, setPage } = useRoomStore();
  const { isAuthenticated } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms, page, filters]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">토론방</h1>
          <p className="mt-1 text-sm text-gray-500">다양한 주제에 대해 토론에 참여하���요</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            새 토론
          </Button>
        )}
      </div>

      <RoomFilters
        onSearch={(q) => setFilters({ q: q || undefined })}
        onStatusChange={(status) => setFilters({ status })}
        onTagChange={(tag) => setFilters({ tag })}
        activeStatus={filters.status}
        activeTag={filters.tag}
      />

      {isLoading ? (
        <PageSpinner />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={48} />}
          title="토론방이 없습니다"
          description="첫 번째 토론을 시작해보세요!"
          action={
            isAuthenticated ? (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} />
                새 토론 만들��
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                이전
              </Button>
              <span className="text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}

      <CreateRoomModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
