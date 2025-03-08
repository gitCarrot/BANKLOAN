'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  Eye, 
  MoreHorizontal, 
  Search, 
  Trash, 
  XCircle,
  UserPlus,
  Lock,
  Unlock,
  Mail
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'locked';
  createdAt: Date;
  lastLoginAt?: Date;
  applications: number;
  contracts: number;
}

// Mock data for users
const mockUsers: User[] = [
  {
    id: 'user-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '010-1234-5678',
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-10-15'),
    lastLoginAt: new Date('2023-12-25'),
    applications: 2,
    contracts: 1
  },
  {
    id: 'user-002',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '010-2345-6789',
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-10-20'),
    lastLoginAt: new Date('2023-12-28'),
    applications: 1,
    contracts: 1
  },
  {
    id: 'user-003',
    name: 'Michael Park',
    email: 'michael.park@example.com',
    phone: '010-3456-7890',
    role: 'user',
    status: 'inactive',
    createdAt: new Date('2023-11-05'),
    lastLoginAt: new Date('2023-11-30'),
    applications: 1,
    contracts: 0
  },
  {
    id: 'user-004',
    name: 'Sarah Kim',
    email: 'sarah.kim@example.com',
    phone: '010-4567-8901',
    role: 'user',
    status: 'locked',
    createdAt: new Date('2023-11-10'),
    lastLoginAt: new Date('2023-12-01'),
    applications: 3,
    contracts: 0
  },
  {
    id: 'user-005',
    name: 'David Jung',
    email: 'david.jung@example.com',
    phone: '010-5678-9012',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2023-09-01'),
    lastLoginAt: new Date('2023-12-29'),
    applications: 0,
    contracts: 0
  },
  {
    id: 'user-006',
    name: 'Robert Kang',
    email: 'robert.kang@example.com',
    phone: '010-6789-0123',
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-12-01'),
    lastLoginAt: new Date('2023-12-27'),
    applications: 1,
    contracts: 1
  },
  {
    id: 'user-007',
    name: 'Jennifer Yoon',
    email: 'jennifer.yoon@example.com',
    phone: '010-7890-1234',
    role: 'user',
    status: 'active',
    createdAt: new Date('2023-12-10'),
    lastLoginAt: new Date('2023-12-26'),
    applications: 1,
    contracts: 0
  }
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Use mock data instead of actual API call
        setTimeout(() => {
          setUsers(mockUsers);
          setIsLoading(false);
        }, 500); // Delay for loading effect
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setViewDialogOpen(true);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleLockUser = (user: User) => {
    setSelectedUser(user);
    setLockDialogOpen(true);
  };

  const handleUnlockUser = (user: User) => {
    setSelectedUser(user);
    setUnlockDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      // Remove from mock data instead of API call
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmLock = () => {
    if (selectedUser) {
      // Update mock data instead of API call
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, status: 'locked' as const } : u
      ));
      setLockDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmUnlock = () => {
    if (selectedUser) {
      // Update mock data instead of API call
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id ? { ...u, status: 'active' as const } : u
      ));
      setUnlockDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // Search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && user.status === 'active';
    if (activeTab === 'inactive') return matchesSearch && user.status === 'inactive';
    if (activeTab === 'locked') return matchesSearch && user.status === 'locked';
    if (activeTab === 'admin') return matchesSearch && user.role === 'admin';
    return matchesSearch;
  });

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'locked':
        return <Badge variant="destructive">Locked</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            Manage system users and change account status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-[500px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  <TabsTrigger value="locked">Locked</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                        <div className="mt-2">Loading data...</div>
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        No results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.role === 'admin' ? (
                            <Badge className="bg-purple-500">Admin</Badge>
                          ) : (
                            <Badge variant="outline">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>{format(new Date(user.createdAt), 'yyyy-MM-dd')}</TableCell>
                        <TableCell>
                          {user.lastLoginAt 
                            ? format(new Date(user.lastLoginAt), 'yyyy-MM-dd') 
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {user.status === 'locked' ? (
                                <DropdownMenuItem onClick={() => handleUnlockUser(user)}>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Unlock Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleLockUser(user)}>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Lock Account
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteUser(user)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              User ID: {selectedUser?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-2 rounded-md border">{selectedUser.name}</div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 rounded-md border">{selectedUser.email}</div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="p-2 rounded-md border">{selectedUser.phone}</div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="p-2 rounded-md border">
                  {selectedUser.role === 'admin' ? 'Administrator' : 'Regular User'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="p-2 rounded-md border">
                  {selectedUser.status === 'active' && 'Active'}
                  {selectedUser.status === 'inactive' && 'Inactive'}
                  {selectedUser.status === 'locked' && 'Locked'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Joined Date</Label>
                <div className="p-2 rounded-md border">
                  {format(new Date(selectedUser.createdAt), 'yyyy-MM-dd HH:mm')}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="p-2 rounded-md border">
                  {selectedUser.lastLoginAt 
                    ? format(new Date(selectedUser.lastLoginAt), 'yyyy-MM-dd HH:mm')
                    : 'No login history'}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Applications</Label>
                <div className="p-2 rounded-md border">{selectedUser.applications} application(s)</div>
              </div>
              <div className="space-y-2">
                <Label>Contracts</Label>
                <div className="p-2 rounded-md border">{selectedUser.contracts} contract(s)</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lock Account Confirmation Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to lock this user's account? They will not be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLock}>Lock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlock Account Confirmation Dialog */}
      <AlertDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlock this user's account? They will be able to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlock}>Unlock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 