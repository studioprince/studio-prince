
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Edit, Trash, User as UserIcon } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { useAuth, User } from '@/contexts/AuthContext';

// Extended User type to match what we need in the component
interface ExtendedUser extends User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'client';
  phone?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'client' as 'super_admin' | 'admin' | 'client'
  });
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    // Load users from Supabase
    const fetchUsers = async () => {
      if (!currentUser || currentUser.role !== 'super_admin') {
        toast({
          title: "Access denied",
          description: "You don't have permission to view users",
          variant: "destructive"
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setUsers(data as ExtendedUser[]);
        }
      } catch (error: any) {
        toast({
          title: "Error loading users",
          description: error.message || "Could not load users",
          variant: "destructive"
        });
      }
    };
    
    fetchUsers();
  }, [currentUser, toast]);

  const handleEditUser = (user: ExtendedUser) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeleteUser = async (user: ExtendedUser) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        // First delete from user_profiles
        const { error: profileError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', user.id);
          
        if (profileError) throw profileError;
        
        // Then delete from auth.users (requires admin privileges)
        // Note: In a real app, you might want to use Supabase Edge Functions for this
        // as it requires admin privileges that should not be exposed in client code
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (authError) throw authError;
        
        setUsers(users.filter(u => u.id !== user.id));
        
        toast({
          title: "User deleted",
          description: `"${user.name}" has been deleted successfully.`
        });
      } catch (error: any) {
        toast({
          title: "Error deleting user",
          description: error.message || "Could not delete user",
          variant: "destructive"
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedUser: ExtendedUser = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: formData.name,
          role: formData.role
        })
        .eq('id', formData.id);
        
      if (error) throw error;
      
      setUsers(users.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      setEditingUser(null);
      
      toast({
        title: "User updated",
        description: `"${updatedUser.name}" has been updated successfully.`
      });
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message || "Could not update user",
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'super_admin' | 'admin' | 'client') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) throw error;
      
      setUsers(users.map(user => {
        if (user.id === userId) {
          const updatedUser = { ...user, role: newRole };
          toast({
            title: "Role updated",
            description: `"${updatedUser.name}" role has been updated to ${newRole} successfully.`
          });
          return updatedUser;
        }
        return user;
      }));
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message || "Could not update role",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-playfair font-semibold">User Management</h2>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {editingUser?.id === user.id ? (
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUser?.id === user.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateUser}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
