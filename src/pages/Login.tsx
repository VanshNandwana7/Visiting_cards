import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { admin, login } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (admin) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) return;

    setIsLoading(true);

    try {
      await login(username.trim(), password);
    } catch (err: any) {
      toast({
        title: 'Login failed',
        description: err.message || 'Invalid credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-foreground/10 border border-border">
            <CreditCard className="h-7 w-7 text-foreground" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Smart Visita
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Admin access only
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg space-y-5">

          <div>
            <h2 className="text-lg font-semibold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground">
              Enter your admin credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Username</label>

              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>

              <div className="relative">

                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4"/>
                  ) : (
                    <Eye className="h-4 w-4"/>
                  )}
                </button>

              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;