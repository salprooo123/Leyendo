import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Mail, BookOpen, Award } from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  photoUrl: string;
  reviewCount: number;
}

interface MyAccountProps {
  accessToken: string;
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

export function MyAccount({ accessToken, refreshTrigger }: MyAccountProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [refreshTrigger]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4a1a3fc8/user`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUserData(result);
      } else {
        console.log(`Error fetching user data: ${result.error}`);
      }
    } catch (error) {
      console.log(`Error loading user data: ${error}`);
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

  if (!userData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Error al cargar los datos de usuario</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Avatar className="size-24">
              <AvatarImage src={userData.photoUrl} alt={userData.username} />
              <AvatarFallback className="text-2xl">
                {userData.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">@{userData.username}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-2">
            <Mail className="size-4" />
            {userData.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <BookOpen className="size-6 mx-auto mb-2 text-indigo-600" />
              <p className="text-sm text-muted-foreground">Reseñas publicadas</p>
              <p className="text-3xl font-semibold text-indigo-600">
                {userData.reviewCount}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center">
              <Award className="size-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-muted-foreground">Tu rango</p>
              <Badge className={`${getRankColor(userData.reviewCount)} text-white border-0 mt-2`}>
                {getRank(userData.reviewCount)}
              </Badge>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Progreso de rangos</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sin rango</span>
                <span>{'<'} 10 reseñas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aficionado</span>
                <span>≥ 10 reseñas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gran lector</span>
                <span>≥ 20 reseñas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maestro</span>
                <span>≥ 30 reseñas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Super lector</span>
                <span>≥ 40 reseñas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leyenda de los libros</span>
                <span>≥ 50 reseñas</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}