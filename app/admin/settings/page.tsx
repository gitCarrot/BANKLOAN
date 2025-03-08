'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Save, 
  RefreshCw, 
  Database, 
  Mail, 
  Shield, 
  CreditCard, 
  Bell, 
  Trash
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';

// Define settings interface
interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    applicationUpdates: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordExpiration: number;
    sessionTimeout: number;
    ipRestriction: boolean;
  };
  payment: {
    paymentGateway: string;
    testMode: boolean;
    apiKey: string;
    secretKey: string;
  };
}

// Mock data for settings
const mockSettings: SystemSettings = {
  general: {
    siteName: 'BankLoan Admin',
    siteDescription: 'Loan management system for financial institutions',
    supportEmail: 'support@bankloan.example.com',
    maintenanceMode: false,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    applicationUpdates: true,
    marketingEmails: false,
  },
  security: {
    twoFactorAuth: true,
    passwordExpiration: 90,
    sessionTimeout: 30,
    ipRestriction: false,
  },
  payment: {
    paymentGateway: 'stripe',
    testMode: true,
    apiKey: 'pk_test_51NxXXXXXXXXXXXXXXXXXXXXX',
    secretKey: 'sk_test_51NxXXXXXXXXXXXXXXXXXXXXX',
  }
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>(mockSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Use mock data instead of actual API call
        setTimeout(() => {
          setSettings(mockSettings);
          setIsLoading(false);
        }, 500); // Delay for loading effect
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load system settings. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message
      setSuccess('Settings saved successfully.');
      setIsSaving(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset to default settings
      setSettings(mockSettings);
      setResetDialogOpen(false);
      setSuccess('Settings reset to default values.');
      setIsLoading(false);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings. Please try again.');
      setIsLoading(false);
    }
  };

  const updateGeneralSettings = (key: keyof SystemSettings['general'], value: any) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }));
  };

  const updateNotificationSettings = (key: keyof SystemSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updateSecuritySettings = (key: keyof SystemSettings['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  const updatePaymentSettings = (key: keyof SystemSettings['payment'], value: any) => {
    setSettings(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        [key]: value
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setResetDialogOpen(true)}
            disabled={isLoading || isSaving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-500">
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <Tabs 
                defaultValue="general" 
                value={activeTab} 
                onValueChange={setActiveTab}
                orientation="vertical" 
                className="w-full"
              >
                <TabsList className="flex flex-col items-start h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="general" 
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payment" 
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-muted"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'general' && 'General Settings'}
                {activeTab === 'notifications' && 'Notification Settings'}
                {activeTab === 'security' && 'Security Settings'}
                {activeTab === 'payment' && 'Payment Settings'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'general' && 'Configure basic system settings'}
                {activeTab === 'notifications' && 'Manage notification preferences'}
                {activeTab === 'security' && 'Configure security options'}
                {activeTab === 'payment' && 'Set up payment processing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <div className="ml-3">Loading settings...</div>
                </div>
              ) : (
                <>
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="siteName">Site Name</Label>
                          <Input 
                            id="siteName" 
                            value={settings.general.siteName}
                            onChange={(e) => updateGeneralSettings('siteName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supportEmail">Support Email</Label>
                          <Input 
                            id="supportEmail" 
                            type="email"
                            value={settings.general.supportEmail}
                            onChange={(e) => updateGeneralSettings('supportEmail', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Textarea 
                          id="siteDescription" 
                          rows={3}
                          value={settings.general.siteDescription}
                          onChange={(e) => updateGeneralSettings('siteDescription', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="maintenanceMode" 
                          checked={settings.general.maintenanceMode}
                          onCheckedChange={(checked) => updateGeneralSettings('maintenanceMode', checked)}
                        />
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="emailNotifications" 
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => updateNotificationSettings('emailNotifications', checked)}
                        />
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="smsNotifications" 
                          checked={settings.notifications.smsNotifications}
                          onCheckedChange={(checked) => updateNotificationSettings('smsNotifications', checked)}
                        />
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      </div>
                      <Separator />
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="applicationUpdates" 
                          checked={settings.notifications.applicationUpdates}
                          onCheckedChange={(checked) => updateNotificationSettings('applicationUpdates', checked)}
                        />
                        <Label htmlFor="applicationUpdates">Application Status Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="marketingEmails" 
                          checked={settings.notifications.marketingEmails}
                          onCheckedChange={(checked) => updateNotificationSettings('marketingEmails', checked)}
                        />
                        <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="twoFactorAuth" 
                          checked={settings.security.twoFactorAuth}
                          onCheckedChange={(checked) => updateSecuritySettings('twoFactorAuth', checked)}
                        />
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="passwordExpiration">Password Expiration (days)</Label>
                          <Input 
                            id="passwordExpiration" 
                            type="number"
                            min={0}
                            value={settings.security.passwordExpiration}
                            onChange={(e) => updateSecuritySettings('passwordExpiration', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input 
                            id="sessionTimeout" 
                            type="number"
                            min={1}
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="ipRestriction" 
                          checked={settings.security.ipRestriction}
                          onCheckedChange={(checked) => updateSecuritySettings('ipRestriction', checked)}
                        />
                        <Label htmlFor="ipRestriction">IP Address Restriction</Label>
                      </div>
                    </div>
                  )}

                  {/* Payment Settings */}
                  {activeTab === 'payment' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="paymentGateway">Payment Gateway</Label>
                        <Select 
                          value={settings.payment.paymentGateway}
                          onValueChange={(value) => updatePaymentSettings('paymentGateway', value)}
                        >
                          <SelectTrigger id="paymentGateway">
                            <SelectValue placeholder="Select payment gateway" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="testMode" 
                          checked={settings.payment.testMode}
                          onCheckedChange={(checked) => updatePaymentSettings('testMode', checked)}
                        />
                        <Label htmlFor="testMode">Test Mode</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input 
                            id="apiKey" 
                            value={settings.payment.apiKey}
                            onChange={(e) => updatePaymentSettings('apiKey', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secretKey">Secret Key</Label>
                          <Input 
                            id="secretKey" 
                            type="password"
                            value={settings.payment.secretKey}
                            onChange={(e) => updatePaymentSettings('secretKey', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetSettings}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
} 