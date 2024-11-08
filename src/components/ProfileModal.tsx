import { useState, useContext, useRef, useEffect } from 'react';
import { supabase } from '../supabaseDB';
import { UserContext } from '../App';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const user = useContext(UserContext);
  const [displayColor, setDisplayColor] = useState<string>('#000000');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);

  // Sync initial state with user data when modal is open or user data changes
  useEffect(() => {
    if (user) {
      setDisplayColor(user.display_color || '#000000');
      setSelectedColor(user.chat_color || '#000000');
      setEmail(user.email || '');
    }
  }, [user]);

  if (!isOpen) return null;

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
            alert('Error updating avatar URL. Please try again.');
          } else {
            alert('Avatar updated successfully!');
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
        alert('Chat color updated successfully.');
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
      alert('Email updated successfully.');
    }
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
      setError(null);
      alert('GitHub disconnected successfully.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">User Settings</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Avatar</label>
          <button
            onClick={handleButtonClick}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Upload Avatar
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
          {avatarUploadError && (
            <p className="text-red-500 mt-2">{avatarUploadError}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mt-4">
            Choose Chat Color
          </label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="mt-2"
          />
          <button
            onClick={handleConfirmColor}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Confirm Color
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
          <button
            onClick={handleEmailChange}
            className="mt-2 p-2 bg-green-500 text-white rounded"
          >
            Update Email
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={handleDisconnectGitHub}
            className="p-2 bg-red-500 text-white rounded"
          >
            Disconnect from GitHub
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="p-2 bg-gray-300 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
