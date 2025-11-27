import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Plus } from 'lucide-react';

interface AddReviewDialogProps {
  accessToken: string;
  onReviewAdded: () => void;
}

export function AddReviewDialog({ accessToken, onReviewAdded }: AddReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4a1a3fc8/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            bookTitle,
            author,
            genre,
            review,
            rating: Number(rating),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.log(`Error creating review: ${result.error}`);
        toast.error(result.error || 'Error al crear reseña');
        return;
      }

      toast.success('¡Reseña publicada!');
      setOpen(false);
      
      // Reset form
      setBookTitle('');
      setAuthor('');
      setGenre('');
      setReview('');
      setRating('');
      
      onReviewAdded();
    } catch (error) {
      console.log(`Error submitting review: ${error}`);
      toast.error('Error al publicar reseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-5" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Reseña</DialogTitle>
          <DialogDescription>
            Comparte tu opinión sobre un libro que hayas leído
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookTitle">Título del libro</Label>
            <Input
              id="bookTitle"
              placeholder="Ej: Cien años de soledad"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Autor</Label>
            <Input
              id="author"
              placeholder="Ej: Gabriel García Márquez"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="genre">Género</Label>
            <Select value={genre} onValueChange={setGenre} required>
              <SelectTrigger id="genre">
                <SelectValue placeholder="Selecciona un género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ficción">Ficción</SelectItem>
                <SelectItem value="No Ficción">No Ficción</SelectItem>
                <SelectItem value="Fantasía">Fantasía</SelectItem>
                <SelectItem value="Ciencia Ficción">Ciencia Ficción</SelectItem>
                <SelectItem value="Romance">Romance</SelectItem>
                <SelectItem value="Misterio">Misterio</SelectItem>
                <SelectItem value="Terror">Terror</SelectItem>
                <SelectItem value="Thriller">Thriller</SelectItem>
                <SelectItem value="Histórico">Histórico</SelectItem>
                <SelectItem value="Biografía">Biografía</SelectItem>
                <SelectItem value="Ensayo">Ensayo</SelectItem>
                <SelectItem value="Poesía">Poesía</SelectItem>
                <SelectItem value="Drama">Drama</SelectItem>
                <SelectItem value="Aventura">Aventura</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review">Reseña</Label>
            <Textarea
              id="review"
              placeholder="Comparte tu opinión sobre el libro..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rating">Calificación (1-10)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="10"
              placeholder="Ej: 8"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Publicando...' : 'Publicar Reseña'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
