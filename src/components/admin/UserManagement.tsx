
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/services/supabaseClient';
import { User, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'client';
  created_at: string;
  phone?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'client' as const,
    password: '',
    phone: ''
  });
  
  const { toast } = useToast();
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data as UserProfile[]);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleCreateUser = async () => {
    try {
      // Create user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            phone: newUser.phone || null
          }]);
          
        if (profileError) throw profileError;
        
        toast({
          title: "User created",
          description: "The user has been created successfully."
        });
        
        // Reset form
        setNewUser({
          email: '',
          name: '',
          role: 'client',
          password: '',
          phone: ''
        });
        
        // Close dialog
        setIsCreateDialogOpen(false);
        
        // Refresh user list
        fetchUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditUser = async () => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: currentUser.name,
          role: currentUser.role,
          phone: currentUser.phone || null
        })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      toast({
        title: "User updated",
        description: "The user has been updated successfully."
      });
      
      // Close dialog
      setIsEditDialogOpen(false);
      
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteUser = async () => {
    if (!currentUser) return;
    
    try {
      // Delete from auth (cascade will delete profile)
      const { error } = await supabase.auth.admin.deleteUser(currentUser.id);
        
      if (error) throw error;
      
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully."
      });
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const openEditDialog = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const getRoleBadgeColor = (role: UserProfile['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'client':
      default:
        return 'bg-green-100 text-green-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-playfair font-semibold">User Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === 'super_admin' ? 'Super Admin' : (user.role === 'admin' ? 'Admin' : 'Client')}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditDialog(user)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openDeleteDialog(user)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as 'super_admin' | 'admin' | 'client'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone (optional)
                </label>
                <input
                  id="phone"
                  type="text"
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      {currentUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={currentUser.name}
                    onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="edit-role" className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    id="edit-role"
                    value={currentUser.role}
                    onChange={e => setCurrentUser({...currentUser, role: e.target.value as 'super_admin' | 'admin' | 'client'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">
                    Phone (optional)
                  </label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={currentUser.phone || ''}
                    onChange={e => setCurrentUser({...currentUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEditUser}>Update User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete User Confirmation Dialog */}
      {currentUser && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete {currentUser.name}? This action cannot be undone.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
