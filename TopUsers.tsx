import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  photoUrl: string;
  reviewCount: number;
}

interface TopUsersProps {
  refreshTrigger: number;
}

function getRank(reviewCount: number): string {
  if (reviewCount >= 50) return 'Leyenda de los libros';
  if (reviewCount >= 40) return 'Super lector';
  if (reviewCount >= 30) return 'Maestro';
  if (reviewCount >= 20) return 'Gran lector';
  if (reviewCount >= 10) return 'Aficionado';
  return 'Sin rango';
}

function getRankColor(reviewCount: number): string {
  if (reviewCount >= 50) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
  if (reviewCount >= 40) return 'bg-gradient-to-r from-purple-500 to-pink-500';
  if (reviewCount >= 30) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
  if (reviewCount >= 20) return 'bg-green-500';
  if (reviewCount >= 10) return 'bg-blue-500';
  return 'bg-gray-400';
}

function getRankIcon(position: number) {
  if (position === 0) return <Trophy className="size-5 text-yellow-500" />;
  if (position === 1) return <Medal className="size-5 text-gray-400" />;
  if (position === 2) return <Medal className="size-5 text-orange-600" />;
  return <Award className="size-5 text-blue-500" />;
}

export function TopUsers({ refreshTrigger }: TopUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers();
  }, [refreshTrigger]);

  const fetchTopUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4a1a3fc8/top-users`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUsers(result.users || []);
      } else {
        console.log(`Error fetching top users: ${result.error}`);
      }
    } catch (error) {
      console.log(`Error loading top users: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay usuarios en el ranking aún</p>
          </CardContent>
        </Card>
      ) : (
        users.map((user, index) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">@{user.username}</CardTitle>
                    <CardDescription className="text-sm">
                      {user.reviewCount} {user.reviewCount === 1 ? 'reseña' : 'reseñas'}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={`${getRankColor(user.reviewCount)} text-white border-0`}>
                  {getRank(user.reviewCount)}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
}
