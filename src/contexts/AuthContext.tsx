
import React, { createContext, useContext, useEffect } from 'react';
import { User, loginUser, registerUser, RegisterData, LoginCredentials } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { authAPI } from '@/lib/apiService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isDoctor: () => boolean;
  isPatient: () => boolean;
  isDoctorOrPatient: (type: 'doctor' | 'patient') => boolean;
  getUserName: () => string;
  getUserId: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define demo users for offline use
const demoDoctorUser: User = {
  id: 'demo-doctor-id',
  name: 'Dr. Sarah Smith',
  email: 'dr.smith@example.com',
  userType: 'doctor',
  phoneNumber: '555-123-4567',
  profileImage: 'default-profile.jpg',
  specialization: 'Cardiology',
  qualifications: [
    {
      degree: 'MD',
      institution: 'Harvard Medical School',
      year: 2010
    },
    {
      degree: 'PhD',
      institution: 'Johns Hopkins University',
      year: 2012
    }
  ],
  experience: 12,
  consultationFee: 150,
  bio: 'Board-certified cardiologist with over 12 years of experience in treating heart conditions and performing cardiac procedures.'
};

const demoPatientUser: User = {
  id: 'demo-patient-id',
  name: 'John Doe',
  email: 'john@example.com',
  userType: 'patient',
  phoneNumber: '555-987-6543',
  profileImage: 'default-profile.jpg',
  dateOfBirth: '1985-05-15',
  bloodType: 'A+',
  height: 175,
  weight: 70,
  allergies: ['Peanuts', 'Penicillin'],
  chronicConditions: ['Asthma'],
  medications: ['Albuterol', 'Vitamin D']
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user session on component mount
    const storedUser = localStorage.getItem('telehealth-user');
    const token = localStorage.getItem('telehealth-token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('telehealth-user');
        localStorage.removeItem('telehealth-token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Login attempt for:", credentials.email);
      
      // Check for demo doctor login
      if (credentials.email === 'dr.smith@example.com' && credentials.password === 'password123') {
        console.log("Demo doctor login detected");
        setUser(demoDoctorUser);
        localStorage.setItem('telehealth-user', JSON.stringify(demoDoctorUser));
        localStorage.setItem('telehealth-token', 'demo-doctor-token');
        
        toast({
          title: 'Login successful',
          description: `Welcome, ${demoDoctorUser.name}!`,
        });
        
        return true;
      }
      
      // Check for demo patient login
      if (credentials.email === 'john@example.com' && credentials.password === 'password123') {
        console.log("Demo patient login detected");
        setUser(demoPatientUser);
        localStorage.setItem('telehealth-user', JSON.stringify(demoPatientUser));
        localStorage.setItem('telehealth-token', 'demo-patient-token');
        
        toast({
          title: 'Login successful',
          description: `Welcome, ${demoPatientUser.name}!`,
        });
        
        return true;
      }

      // Regular login flow - try API service first
      try {
        const response = await authAPI.login(credentials);
        
        if (response && response.success && response.token && response.user) {
          setUser(response.user);
          localStorage.setItem('telehealth-user', JSON.stringify(response.user));
          localStorage.setItem('telehealth-token', response.token);
          
          toast({
            title: 'Login successful',
            description: `Welcome, ${response.user.name}!`,
          });
          
          return true;
        }
      } catch (apiError) {
        console.error("API login failed, but continuing with fallback options:", apiError);
        // Continue to error handling below for non-demo accounts
      }
      
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'An unexpected error occurred. Please try again.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const newUser = await registerUser(userData);
      
      if (newUser) {
        setUser(newUser);
        localStorage.setItem('telehealth-user', JSON.stringify(newUser));
        toast({
          title: 'Registration successful',
          description: `Welcome to TeleHealth, ${newUser.name}!`,
        });
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: 'This email may already be in use. Please try another one.',
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'An unexpected error occurred. Please try again.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('telehealth-user');
    localStorage.removeItem('telehealth-token');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    window.location.href = '/login';
  };

  const isDoctor = () => {
    return user?.userType === 'doctor';
  };

  const isPatient = () => {
    return user?.userType === 'patient';
  };
  
  const isDoctorOrPatient = (type: 'doctor' | 'patient') => {
    return user?.userType === type;
  };
  
  const getUserName = () => {
    return user?.name || 'User';
  };
  
  const getUserId = () => {
    return user?.id || '';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isDoctor, 
      isPatient,
      isDoctorOrPatient,
      getUserName,
      getUserId
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
