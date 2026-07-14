import { useRef, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import FormInput from '../components/common/FormInput.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.jsx';
import { userApi } from '../api/authApi.js';
import { getApiErrorMessage, getFieldErrors } from '../utils/validation.js';

export default function EditProfile() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [errors, setErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Username change
  const [newUsername, setNewUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await userApi.updateProfile({ fullName, bio });
      await refreshUser();
      showToast('Profile updated', 'success');
    } catch (err) {
      setErrors(getFieldErrors(err));
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPEG, PNG, and WEBP images are allowed', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Image must be smaller than 3MB', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      await userApi.uploadAvatar(formData);
      await refreshUser();
      showToast('Profile picture updated', 'success');
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await userApi.removeAvatar();
      await refreshUser();
      showToast('Profile picture removed', 'success');
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    }
  };

  const handleUsernameInput = async (e) => {
    const value = e.target.value.toLowerCase();
    setNewUsername(value);
    if (value.length < 3) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus('checking');
    try {
      const { data } = await userApi.checkUsernameAvailability(value);
      setUsernameStatus(data.data.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus(null);
    }
  };

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    setIsSavingUsername(true);
    try {
      await userApi.changeUsername(newUsername);
      await refreshUser();
      showToast('Username updated', 'success');
      setNewUsername('');
      setUsernameStatus(null);
    } catch (err) {
      showToast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSavingUsername(false);
    }
  };

  return (
    <DashboardLayout>
      <h4 className="mb-4">Edit Profile</h4>
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="auth-card p-4 text-center">
            <img
              src={
                user.avatar?.url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=DCFCE7&color=14532D&size=128`
              }
              alt="Profile"
              className="rounded-circle mb-3"
              width="100"
              height="100"
              style={{ objectFit: 'cover' }}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="d-none"
              onChange={handleAvatarChange}
            />
            <div className="d-grid gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-camera me-1" />
                )}
                Change Photo
              </button>
              {user.avatar?.url && (
                <button className="btn btn-outline-danger btn-sm" onClick={handleRemoveAvatar}>
                  Remove Photo
                </button>
              )}
            </div>
            <small className="text-secondary d-block mt-2">JPEG, PNG or WEBP. Max 3MB.</small>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="auth-card p-4 mb-4">
            <h6 className="mb-3">Basic Information</h6>
            <form onSubmit={handleSaveProfile}>
              <FormInput
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
              />
              <div className="mb-3">
                <label htmlFor="bio" className="form-label fw-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  className="form-control"
                  rows={3}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a little about yourself"
                />
                <small className="text-secondary">{bio.length}/300</small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSavingProfile}>
                {isSavingProfile && <span className="spinner-border spinner-border-sm me-2" />}
                Save Changes
              </button>
            </form>
          </div>

          <div className="auth-card p-4">
            <h6 className="mb-3">Change Username</h6>
            <p className="text-secondary small">Current username: @{user.username}</p>
            <form onSubmit={handleSaveUsername} className="d-flex gap-2 align-items-start">
              <div className="flex-grow-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="new_username"
                  value={newUsername}
                  onChange={handleUsernameInput}
                />
                {usernameStatus === 'checking' && <small className="text-secondary">Checking availability...</small>}
                {usernameStatus === 'available' && <small className="text-success">Username is available</small>}
                {usernameStatus === 'taken' && <small className="text-danger">Username is taken</small>}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={usernameStatus !== 'available' || isSavingUsername}
              >
                {isSavingUsername && <span className="spinner-border spinner-border-sm me-2" />}
                Update
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
