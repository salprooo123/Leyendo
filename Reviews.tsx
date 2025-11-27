import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { ReviewCard } from './ReviewCard';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search } from 'lucide-react';

interface Review {
  id: string;
  bookTitle: string;
  author: string;
  genre: string;
  review: string;
  rating: number;
  username: string;
  createdAt: string;
}

interface ReviewsProps {
  refreshTrigger: number;
}

export function Reviews({ refreshTrigger }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchReviews();
  }, [refreshTrigger]);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchQuery, filterType]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4a1a3fc8/reviews`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setReviews(result.reviews || []);
      } else {
        console.log(`Error fetching reviews: ${result.error}`);
      }
    } catch (error) {
      console.log(`Error loading reviews: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(review => {
        if (filterType === 'title') {
          return review.bookTitle.toLowerCase().includes(query);
        } else if (filterType === 'author') {
          return review.author.toLowerCase().includes(query);
        } else if (filterType === 'genre') {
          return review.genre.toLowerCase().includes(query);
        } else {
          // 'all' - search in all fields
          return (
            review.bookTitle.toLowerCase().includes(query) ||
            review.author.toLowerCase().includes(query) ||
            review.genre.toLowerCase().includes(query)
          );
        }
      });
    }

    setFilteredReviews(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            type="text"
            placeholder="Buscar reseñas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los campos</SelectItem>
            <SelectItem value="title">Por título</SelectItem>
            <SelectItem value="author">Por autor</SelectItem>
            <SelectItem value="genre">Por género</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'No se encontraron reseñas' : 'No hay reseñas aún'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
