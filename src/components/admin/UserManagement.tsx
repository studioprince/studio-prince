import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // Load users - removed role checks
    // We'll just show a placeholder instead
    setUsers([]);
  }, [user]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-semibold">User Management</h2>
      </div>
      
      <p className="text-gray-500 text-center py-10">No users found.</p>
    </div>
  );
};

export default UserManagement;
