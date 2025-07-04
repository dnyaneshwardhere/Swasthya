
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login({ email, password });
      if (success) {
        navigate('/');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid email or password. Please try again.',
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoPatientLogin = async () => {
    setIsSubmitting(true);
    try {
      console.log("Demo patient login attempt");
      const success = await login({ 
        email: 'john@example.com', 
        password: 'password123' 
      });
      
      if (success) {
        toast({
          title: 'Demo Patient Login',
          description: 'Successfully logged in as demo patient',
        });
        navigate('/');
      } else {
        console.error("Demo patient login failed");
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Error logging in as demo patient',
        });
      }
    } catch (error) {
      console.error("Error during demo patient login:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Error logging in as demo patient',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoDoctorLogin = async () => {
    setIsSubmitting(true);
    try {
      console.log("Demo doctor login attempt");
      const success = await login({ 
        email: 'dr.smith@example.com', 
        password: 'password123' 
      });
      
      if (success) {
        toast({
          title: 'Demo Doctor Login',
          description: 'Successfully logged in as demo doctor',
        });
        navigate('/');
      } else {
        console.error("Demo doctor login failed");
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Error logging in as demo doctor',
        });
      }
    } catch (error) {
      console.error("Error during demo doctor login:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Error logging in as demo doctor',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your health passport
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-health-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="grid grid-cols-2 gap-2 w-full mb-4">
              <Button
                variant="outline"
                onClick={handleDemoPatientLogin}
                disabled={isSubmitting}
                className="w-full"
                type="button"
              >
                Demo Patient
              </Button>
              <Button
                variant="outline"
                onClick={handleDemoDoctorLogin}
                disabled={isSubmitting}
                className="w-full"
                type="button"
              >
                Demo Doctor
              </Button>
            </div>
            <div className="text-center text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
