'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createCounsel } from '@/app/actions/counsels';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Loader2 } from 'lucide-react';

export default function CounselPage() {
  const [formData, setFormData] = useState({
    name: '',
    cellPhone: '',
    email: '',
    memo: '',
    address: '',
    addressDetail: '',
    zipCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.cellPhone || !formData.email) {
        setError('Name, phone number, and email are required.');
        setIsSubmitting(false);
        return;
      }
      
      // Submit form
      try {
        await createCounsel(formData);
        setSuccess(true);
        // Reset form
        setFormData({
          name: '',
          cellPhone: '',
          email: '',
          memo: '',
          address: '',
          addressDetail: '',
          zipCode: '',
        });
      } catch (err: unknown) {
        // Handle error from createCounsel
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('Failed to submit consultation request.');
        }
      }
    } catch (err) {
      console.error('Error submitting consultation request:', err);
      setError('Failed to submit consultation request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-12 px-4"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Loan Consultation</h1>
        <p className="text-lg text-center mb-6">
          Fill out the form below to request a consultation with our loan specialists.
          We'll get back to you within 24 hours.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 rounded-xl overflow-hidden border bg-card shadow-sm"
        >
          <div className="p-6 bg-muted/30">
            <h2 className="text-xl font-semibold mb-2">Consultation Process</h2>
            <p className="text-sm text-muted-foreground mb-6">
              How our consultation service works to help you find the right loan
            </p>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: 1,
                  title: "Request Consultation",
                  description: "Complete the form below to request personalized assistance"
                },
                {
                  step: 2,
                  title: "Expert Assignment",
                  description: "A dedicated loan specialist will be assigned to contact you"
                },
                {
                  step: 3,
                  title: "Tailored Guidance",
                  description: "Receive customized advice on the best loan options for your needs"
                }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                  className="relative"
                >
                  <div className="flex flex-col h-full p-4 rounded-lg bg-background border">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 shrink-0">
                        {item.step}
                      </div>
                      <h3 className="font-medium">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    {index < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="m9 18 6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Note:</span> We'll contact you within 24 hours of your request. Consultations are free and come with no obligation to proceed with a loan application.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-8 text-center"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Consultation Request Submitted</h2>
            <p className="text-green-700 mb-6">
              Thank you for your interest in our loan services. One of our specialists will contact you shortly.
            </p>
            <Button onClick={() => setSuccess(false)}>Submit Another Request</Button>
          </motion.div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Request a Consultation</CardTitle>
              <CardDescription>
                Please provide your contact information and details about your loan needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cellPhone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="cellPhone"
                      name="cellPhone"
                      value={formData.cellPhone}
                      onChange={handleChange}
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="12345"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Main St"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="addressDetail">Address Detail</Label>
                  <Input
                    id="addressDetail"
                    name="addressDetail"
                    value={formData.addressDetail}
                    onChange={handleChange}
                    placeholder="Apt 4B"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="memo">Additional Information</Label>
                  <Textarea
                    id="memo"
                    name="memo"
                    value={formData.memo}
                    onChange={handleChange}
                    placeholder="Please provide any additional information about your loan needs..."
                    rows={5}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Consultation Request'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
} 