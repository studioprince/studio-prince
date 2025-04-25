import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { dbService, User } from '@/services/database';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Edit, Trash, User as UserIcon } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'client'
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load users from database
    const allUsers = dbService.getUsers();
    setUsers(allUsers);
  }, []);

  const handleEditUser = (user: User) => {
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

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      const deleted = dbService.deleteUser(user.id);
      if (deleted) {
        setUsers(users.filter(u => u.id !== user.id));
        toast({
          title: "User deleted",
          description: `"${user.name}" has been deleted successfully.`
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: User = {
      id: formData.id,
      name: formData.name,
      email: formData.email,
      role: formData.role
    };

    const savedUser = dbService.saveUser(updatedUser);

    setUsers(users.map(user =>
      user.id === savedUser.id ? savedUser : user
    ));

    setEditingUser(null);

    toast({
      title: "User updated",
      description: `"${savedUser.name}" has been updated successfully.`
    });
  };

  const handleRoleChange = (userId: string, newRole: 'super_admin' | 'admin' | 'client') => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const updatedUser = { ...user, role: newRole };
        dbService.saveUser(updatedUser);
        toast({
          title: "Role updated",
          description: `"${updatedUser.name}" role has been updated to ${newRole} successfully.`
        });
        return updatedUser;
      }
      return user;
    }));
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
