import { useState, useEffect } from 'react';
import { createClient } from './utils/supabase/client';
import { Login } from './components/Login';
import { AddReviewDialog } from './components/AddReviewDialog';
import { Reviews } from './components/Reviews';
import { TopUsers } from './components/TopUsers';
import { MyAccount } from './components/MyAccount';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { BookOpen, LogOut } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('reviews');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    } catch (error) {
      console.log(`Error checking session: ${error}`);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleLogin = (token: string) => {
    setAccessToken(token);
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setAccessToken(null);
      toast.success('Sesión cerrada');
    } catch (error) {
      console.log(`Error logging out: ${error}`);
      toast.error('Error al cerrar sesión');
    }
  };

  const handleReviewAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster />
      
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="size-6 text-white" />
              </div>
              <h1 className="text-2xl">leyendo</h1>
            </div>
            <div className="flex items-center gap-3">
              <AddReviewDialog 
                accessToken={accessToken} 
                onReviewAdded={handleReviewAdded}
              />
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="size-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="top">Top Usuarios</TabsTrigger>
            <TabsTrigger value="account">Mi Cuenta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews" className="mt-0">
            <Reviews refreshTrigger={refreshTrigger} />
          </TabsContent>
          
          <TabsContent value="top" className="mt-0">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl mb-2">🏆 Top Usuarios</h2>
                <p className="text-muted-foreground">
                  Los usuarios que más reseñas han publicado
                </p>
              </div>
              <TopUsers refreshTrigger={refreshTrigger} />
            </div>
          </TabsContent>
          
          <TabsContent value="account" className="mt-0">
            <MyAccount accessToken={accessToken} refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
