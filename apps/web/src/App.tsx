import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Login from './app/routes/Login';
import Lobby from './app/routes/Lobby';
import RoomLobby from './app/routes/RoomLobby';
import MyDecks from './app/routes/MyDecks';
import DeckEditor from './app/routes/DeckEditor';
import CuartoReySolo from './app/routes/CuartoReySolo';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // o un loading spinner
  if (session === null) return <Navigate to="/" replace />;

  return <>{children}</>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/lobby',
    element: (
      <ProtectedRoute>
        <Lobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/room/:id',
    element: (
      <ProtectedRoute>
        <RoomLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/decks',
    element: (
      <ProtectedRoute>
        <MyDecks />
      </ProtectedRoute>
    ),
  },
  {
    path: '/decks/:id',
    element: (
      <ProtectedRoute>
        <DeckEditor />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cuarto-rey-solo',
    element: (
      <ProtectedRoute>
        <CuartoReySolo />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
