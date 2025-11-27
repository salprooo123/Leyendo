import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Star, User } from 'lucide-react';

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

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{review.bookTitle}</CardTitle>
            <CardDescription className="mt-1">
              por {review.author}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{review.rating}/10</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{review.genre}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="size-3" />
            <span>@{review.username}</span>
          </div>
        </div>
        <p className="text-sm line-clamp-3">{review.review}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </CardContent>
    </Card>
  );
}
