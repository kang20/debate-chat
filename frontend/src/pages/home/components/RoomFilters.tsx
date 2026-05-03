import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RoomFiltersProps {
  onSearch: (q: string) => void;
  onStatusChange: (status: string | undefined) => void;
  onTagChange: (tag: string | undefined) => void;
  activeStatus?: string;
  activeTag?: string;
}

const tags = ['기술', '정책', '경제', '사회', '직장', '라이프스타일', '복지'];

export function RoomFilters({ onSearch, onStatusChange, onTagChange, activeStatus, activeTag }: RoomFiltersProps) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query || '');
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="토론 주제를 검색하세요..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <Button type="submit" size="md">
          검색
        </Button>
      </form>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={!activeStatus ? 'primary' : 'secondary'}
          onClick={() => onStatusChange(undefined)}
        >
          전체
        </Button>
        <Button
          size="sm"
          variant={activeStatus === 'OPEN' ? 'primary' : 'secondary'}
          onClick={() => onStatusChange('OPEN')}
        >
          진행 중
        </Button>
        <Button
          size="sm"
          variant={activeStatus === 'CLOSED' ? 'primary' : 'secondary'}
          onClick={() => onStatusChange('CLOSED')}
        >
          종료
        </Button>
      </div>

      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onTagChange(undefined)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !activeTag
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          전체 태그
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagChange(activeTag === tag ? undefined : tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTag === tag
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
