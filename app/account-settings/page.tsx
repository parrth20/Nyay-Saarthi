// app/account-settings/page.tsx
"use client"; // Use client component to easily fetch user data

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react"; // For loading state

// Helper to get initials (same as in header)
const getInitials = (name?: string, email?: string): string => {
   if (name) {
       const nameParts = name.split(' ').filter(Boolean);
       if (nameParts.length > 1) {
           return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
       } else if (nameParts.length === 1 && nameParts[0].length > 0) {
           return nameParts[0][0].toUpperCase();
       }
   }
   if (email) {
       return email[0].toUpperCase();
   }
   return '?';
};

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Add state for password fields if implementing password change
  // const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const supabase = createClient();
    const getUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setName(currentUser?.user_metadata?.name || '');
      setLoading(false);
    };
    getUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
          data: { name: name } // Update user metadata
      });

      if (error) {
          console.error("Error updating profile:", error.message);
          // Add toast notification for error
      } else {
          console.log("Profile updated successfully:", data);
          setUser(data.user); // Update local user state
          // Add toast notification for success
      }
      setIsSaving(false);
  };

  // Add function for password update if needed
  // const handleUpdatePassword = async (e: React.FormEvent) => { ... };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-10 px-4 flex justify-center items-center min-h-[calc(100vh-10rem)]">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
     // Optional: Redirect to login or show message if somehow user is lost
     return (
        <div className="container mx-auto max-w-2xl py-10 px-4">
            <p>Please log in to view account settings.</p>
        </div>
     );
  }

  // Derive display info
  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name;
  const userEmail = user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const userInitials = getInitials(userName, userEmail);


  return (
    <div className="container mx-auto max-w-2xl py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Profile Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl} alt={userName || userEmail || 'User'} />
                    <AvatarFallback className="text-xl bg-green-100 text-green-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {/* Placeholder for upload button if you add avatar changing */}
                  {/* <Button variant="outline" size="sm" type="button">Change Avatar</Button> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={userEmail || ''} disabled readOnly />
              <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password Card (Optional Placeholder) */}
      <Card>
         <CardHeader>
           <CardTitle>Change Password</CardTitle>
           <CardDescription>Update your account password.</CardDescription>
         </CardHeader>
         <CardContent>
           <form /* onSubmit={handleUpdatePassword} */ className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" disabled placeholder="********" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" disabled placeholder="New password"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <Input id="confirmNewPassword" type="password" disabled placeholder="Confirm new password"/>
                </div>
                <Button type="submit" disabled> {/* Disabled until implemented */}
                    Update Password
                </Button>
                <p className="text-xs text-muted-foreground pt-2">Password change functionality coming soon.</p>
           </form>
         </CardContent>
      </Card>

    </div>
  );
}