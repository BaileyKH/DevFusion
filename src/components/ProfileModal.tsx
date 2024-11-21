import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();

  // Sync initial state with user data when modal is open or user data changes
  useEffect(() => {
    if (user) {
      setSelectedColor(user.chat_color || '#FFFFFF');
      setEmail(user.email || '');
      setIsGitHubConnected(!!user.github_token);
    }
  }, [user]);

  // Refetch user data after GitHub connection or disconnection
  const refreshUserData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('username, email, avatar_url, display_color, github_token')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
    } else {
      if (data) {
        setUser({ ...user, ...data });
        setIsGitHubConnected(!!data.github_token);
        setSelectedColor(data.display_color || '#FFFFFF');
        setEmail(data.email || '');
      }
    }
  };

  if (!isOpen) return null;

  const handleSignOut = async () => {
    if (user) {
      await supabase.auth.signOut();
      onClose();
      navigate("/");
    }
  };

  // Handle avatar file upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !user) {
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: true,
          metadata: {
            owner: user.id,
          },
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        setAvatarUploadError('Error uploading avatar. Please try again.');
        return;
      }

      if (data) {
        const publicURL = supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}/${file.name}`);

        if (publicURL.data) {
          const avatarUrl = publicURL.data.publicUrl;

          const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: avatarUrl })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating avatar URL:', updateError);
            toast({
              title: "Error",
              description: "Error updating avatar URL. Please try again",
              variant: "destructive",
            });
            return;
          } else {
            toast({
              title: "Success",
              description: "Avatar updated successfully!",
            });
            await refreshUserData();
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAvatarUploadError('Unexpected error uploading avatar. Please try again.');
    }
  };

  // Handle button click to trigger file input for avatar upload
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle display color update
  const handleConfirmColor = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ display_color: selectedColor })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating color:', error);
        setError('Error updating chat color. Please try again later.');
      } else {
        toast({
          title: "Success",
          description: "Chat color updated successfully.",
        });
        await refreshUserData();
      }
    } catch (error) {
      console.error('Unexpected error while updating chat color:', error);
      setError('Unexpected error occurred. Please try again.');
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!email || !user) {
      setError('Please enter a valid email.');
      return;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ email })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating email:', updateError);
      setError('Error updating email.');
    } else {
      setError(null);
      toast({
        title: "Success",
        description: "Email updated successfully.",
      });
      await refreshUserData();
    }
  };

  // Handle GitHub connect
  const handleGitHubConnect = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=repo`;
  };

  // Handle GitHub disconnect
  const handleDisconnectGitHub = async () => {
    if (!user) return;
  
    const { error } = await supabase
      .from('users')
      .update({ github_token: null })
      .eq('id', user.id);
  
    if (error) {
      console.error('Error disconnecting GitHub:', error);
      setError('Error disconnecting GitHub.');
    } else {
      toast({
        title: "Success",
        description: "GitHub disconnected successfully",
      });
      await refreshUserData();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className='bg-primDark border border-darkAccent/30 rounded-lg w-96 p-4'>
        <div className='mb-2'>
            <h2 className='text-lightAccent/85'>User Settings</h2>
            <p className='text-lightAccent/60 text-xs'>Make changes to your profile here</p>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className='flex flex-col gap-y-6'>
            <div className='flex justify-center items-center space-x-4 mt-1'>
                <Label htmlFor='email' className='text-lightAccent/85 text-xs tracking-wide'>Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-lightAccent/85 border border-darkAccent/30 rounded"
                />
                <Button variant="outline" onClick={handleEmailChange} className='text-xs text-lightAccent/85 tracking-wider px-2 transition duration-300 ease-in'>Update</Button>
            </div>
            <div>
                <Label htmlFor='profile-picture' className='text-lightAccent/85 text-xs tracking-wide'>Profile Picture</Label>
                <div className='flex items-center space-x-4 mt-1'>
                    <Button variant="outline" onClick={handleButtonClick} className='text-xs text-lightAccent/85 px-2 transition duration-300 ease-in'>Upload File</Button>
                    <Input
                        id="profile-picture"
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                        className='text-lightAccent/85'
                    />
                </div>
                {avatarUploadError && (
                    <p className="text-red-500 mt-2">{avatarUploadError}</p>
                )}
            </div>
            <div>
                <Label htmlFor='profile-color' className='text-lightAccent/85 text-xs tracking-wide'>Profile Color</Label>
                <div className='flex items-center space-x-4 mt-1'>
                    <Input 
                        id="profile-color"
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className='w-[100px] p-0 text-lightAccent/85 border border-darkAccent/30 rounded'
                    />
                    <Button variant="outline" onClick={handleConfirmColor} className='text-xs text-lightAccent/85 tracking-wider px-2 transition duration-300 ease-in'>Confirm Color</Button>
                </div>
            </div>
            <div className='flex justify-between items-center my-8'>
                {isGitHubConnected ? (
                  <Button variant="outline" onClick={handleDisconnectGitHub} className='text-xs text-lightAccent/85 tracking-wider px-2 transition duration-300 ease-in'>Disconnect GitHub</Button>
                ) : (
                  <Button variant="outline" onClick={handleGitHubConnect} className='text-xs text-lightAccent/85 tracking-wider px-2 transition duration-300 ease-in'>Connect GitHub</Button>
                )}
                <Button variant="outline" onClick={handleSignOut} className='text-xs text-lightAccent/85 tracking-wider px-2 transition duration-300 ease-in'>Sign Out</Button>
            </div>
            <div className='flex justify-end items-center'>
                <Button variant="outline" onClick={onClose} className='text-xs text-lightAccent/85 border-primDark tracking-wider px-2 transition duration-300 ease-in'>Close</Button>
            </div>
        </div>
      </div>
    </div>
  );
};
