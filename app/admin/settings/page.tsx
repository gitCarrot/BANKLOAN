'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Settings as SettingsIcon,
  Trash2,
  Loader2,
  XCircle
} from 'lucide-react';
import { getSettings, createSetting, updateSetting, deleteSetting, getSettingsByCategory } from '@/app/actions/settings';
import { Setting, SettingCreateRequest, SettingUpdateRequest } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

// Mock data for settings when real data is not available
const mockSettings: Setting[] = [
  {
    key: 'site_name',
    value: 'Bank Loan System',
    description: 'The name of the site displayed in the header and title',
    category: 'general',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    isDeleted: false
  },
  {
    key: 'contact_email',
    value: 'support@bankloan.example.com',
    description: 'Contact email for customer support',
    category: 'general',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    isDeleted: false
  },
  {
    key: 'default_interest_rate',
    value: '5.5',
    description: 'Default interest rate for new loan applications',
    category: 'loan',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    isDeleted: false
  },
  {
    key: 'min_loan_amount',
    value: '1000',
    description: 'Minimum loan amount that can be requested',
    category: 'loan',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    isDeleted: false
  },
  {
    key: 'max_loan_amount',
    value: '50000',
    description: 'Maximum loan amount that can be requested',
    category: 'loan',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    isDeleted: false
  },
  {
    key: 'enable_notifications',
    value: 'true',
    description: 'Enable email notifications for users',
    category: 'notification',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    isDeleted: false
  }
];

// Categories for settings
const categories = [
  { value: 'general', label: 'General' },
  { value: 'loan', label: 'Loan' },
  { value: 'notification', label: 'Notification' },
  { value: 'system', label: 'System' }
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [filteredSettings, setFilteredSettings] = useState<Setting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [formData, setFormData] = useState<SettingCreateRequest>({
    key: '',
    value: '',
    description: '',
    category: 'general'
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);

  // Filter by search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      filterSettingsByCategory(activeCategory);
    } else {
      const filtered = settings.filter(setting => 
        setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (setting.description && setting.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSettings(filtered);
    }
  }, [searchTerm, settings]);

  // Filter by category
  useEffect(() => {
    filterSettingsByCategory(activeCategory);
  }, [activeCategory, settings]);

  const filterSettingsByCategory = (category: string) => {
    if (category === 'all') {
      setFilteredSettings(settings);
    } else {
      const filtered = settings.filter(setting => setting.category === category);
      setFilteredSettings(filtered);
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Real API call
      let data: Setting[] = [];
      try {
        data = await getSettings();
      } catch (err) {
        console.error('API call failed, using mock data:', err);
        // Use mock data if API call fails
        data = mockSettings;
      }
      
      setSettings(data);
      setFilteredSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again later.');
      // Use mock data on error
      setSettings(mockSettings);
      setFilteredSettings(mockSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSetting = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      category: 'general'
    });
    setCreateDialogOpen(true);
  };

  const handleEditSetting = (setting: Setting) => {
    setSelectedSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description || '',
      category: setting.category
    });
    setEditDialogOpen(true);
  };

  const handleDeleteSetting = (setting: Setting) => {
    setSelectedSetting(setting);
    setDeleteDialogOpen(true);
  };

  const handleSaveSetting = async () => {
    if (!selectedSetting) return;
    
    try {
      setIsProcessing(true);
      
      const updateData: SettingUpdateRequest = {
        value: formData.value,
        description: formData.description,
        category: formData.category
      };
      
      await updateSetting(selectedSetting.key, updateData);
      
      toast({
        title: "Success",
        description: "Setting has been updated successfully.",
      });
      
      setEditDialogOpen(false);
      fetchSettings();
    } catch (err) {
      console.error('Error updating setting:', err);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitSetting = async () => {
    try {
      setIsProcessing(true);
      
      if (!formData.key || !formData.value) {
        toast({
          title: "Error",
          description: "Key and value are required fields.",
          variant: "destructive"
        });
        return;
      }
      
      await createSetting(formData);
      
      toast({
        title: "Success",
        description: "New setting has been created successfully.",
      });
      
      setCreateDialogOpen(false);
      fetchSettings();
    } catch (err) {
      console.error('Error creating setting:', err);
      toast({
        title: "Error",
        description: "Failed to create setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSetting) return;
    
    try {
      setIsProcessing(true);
      
      await deleteSetting(selectedSetting.key);
      
      toast({
        title: "Success",
        description: "Setting has been deleted successfully.",
      });
      
      setDeleteDialogOpen(false);
      fetchSettings();
    } catch (err) {
      console.error('Error deleting setting:', err);
      toast({
        title: "Error",
        description: "Failed to delete setting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-10"
    >
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Manage system-wide settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search settings..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="loan">Loan</TabsTrigger>
                  <TabsTrigger value="notification">Notification</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={handleCreateSetting}>
              <Plus className="h-4 w-4 mr-2" />
              New Setting
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading settings...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <XCircle className="h-8 w-8 mr-2" />
              {error}
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No settings found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSettings.map((setting) => (
                  <TableRow key={setting.key}>
                    <TableCell className="font-medium">{setting.key}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">{setting.value}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">{setting.description || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {setting.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{setting.updatedAt ? format(new Date(setting.updatedAt), 'yyyy-MM-dd HH:mm') : '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditSetting(setting)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSetting(setting)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Setting Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Update the setting values. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="key" className="text-right">Key</Label>
              <div className="col-span-3">
                <Input
                  id="key"
                  value={selectedSetting?.key || ''}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">Value</Label>
              <div className="col-span-3">
                <Input
                  id="value"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <div className="col-span-3">
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSetting} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Setting Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Setting</DialogTitle>
            <DialogDescription>
              Add a new system setting. Fill in all the fields and click create.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newKey" className="text-right">Key</Label>
              <div className="col-span-3">
                <Input
                  id="newKey"
                  value={formData.key || ''}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  placeholder="e.g. site_name"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newValue" className="text-right">Value</Label>
              <div className="col-span-3">
                <Input
                  id="newValue"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="newDescription" className="text-right pt-2">Description</Label>
              <div className="col-span-3">
                <Textarea
                  id="newDescription"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this setting is used for"
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newCategory" className="text-right">Category</Label>
              <div className="col-span-3">
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSetting} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>Create</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Setting Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Setting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this setting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">
              Key: <span className="font-semibold">{selectedSetting?.key}</span>
            </p>
            <p className="text-center text-muted-foreground">
              Value: <span className="font-semibold">{selectedSetting?.value}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete} 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 