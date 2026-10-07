import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserCircle, Skull } from '@phosphor-icons/react';
import styles from './Login.module.css';

export default function Login() {
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/lobby', { replace: true });
      }
    });
  }, [navigate]);

  const handleAnonymousLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Tenís que poner un apodo, po.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) throw authError;
      
      if (data.user) {
        // Update the profile with the nickname
        const { error: updateError } = await supabase
          .from('player_private')
          .update({ nickname: nickname.trim() })
          .eq('id', data.user.id);
          
        if (updateError) throw updateError;
        
        navigate('/lobby');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al entrar al juego');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/lobby`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión con Google');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.splashCard}>
        <div className={styles.logoContainer}>
          <Skull size={64} weight="duotone" className={styles.logoIcon} />
          <h1 className={styles.title}>Hora del ñache</h1>
          <p className={styles.subtitle}>El juego para mentes... cuestionables.</p>
        </div>
        
        <form onSubmit={handleAnonymousLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="nickname" className="sr-only">Apodo</label>
            <div className={styles.inputWrapper}>
              <UserCircle size={24} className={styles.inputIcon} />
              <input
                id="nickname"
                type="text"
                placeholder="¿Cómo te decimos?"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className={styles.input}
                disabled={isLoading}
              />
            </div>
          </div>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <button 
            type="submit" 
            className={styles.buttonPrimary}
            disabled={isLoading || !nickname.trim()}
          >
            {isLoading ? 'Entrando...' : 'Jugar Anónimo'}
          </button>
        </form>
        
        <div className={styles.divider}>
          <span>O entra con</span>
        </div>
        
        <div className={styles.oauthContainer}>
          <button 
            type="button" 
            className={styles.buttonGoogle} 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Conectando...' : 'Google'}
          </button>
        </div>
        </div>
        
        <p className={styles.disclaimer}>
          Solo mayores de 18 años. Al jugar aceptas nuestras políticas.
        </p>
      </div>
    </div>
  );
}
