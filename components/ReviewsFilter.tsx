'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReviewsFilterProps {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: {
    reviews: string;
    site: string;
    rating: string;
    time: string;
  }) => void;
}

export function ReviewsFilter({ onSearchChange, onFilterChange }: ReviewsFilterProps) {
  const [filters, setFilters] = useState({
    reviews: 'All reviews',
    site: 'Any site',
    rating: 'With any rating',
    time: 'Anytime'
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search keywords"
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => (
          <DropdownMenu key={key}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm">
                {value}
                <ChevronDown className="ml-1 w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {key === 'reviews' && (
                <>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'All reviews')}>
                    All reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Recent reviews')}>
                    Recent reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Responded')}>
                    Responded
                  </DropdownMenuItem>
                </>
              )}
              {key === 'site' && (
                <>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Any site')}>
                    Any site
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Google')}>
                    Google
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Yelp')}>
                    Yelp
                  </DropdownMenuItem>
                </>
              )}
              {key === 'rating' && (
                <>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'With any rating')}>
                    With any rating
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, '5 stars')}>
                    5 stars
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, '4+ stars')}>
                    4+ stars
                  </DropdownMenuItem>
                </>
              )}
              {key === 'time' && (
                <>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Anytime')}>
                    Anytime
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Last week')}>
                    Last week
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange(key, 'Last month')}>
                    Last month
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}