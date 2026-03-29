import React, { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';

export function Profile() {
  const { user, setCurrentScreen } = useAppContext();

  const safeUser = user || {};
  const showValue = (value) => {
    const text = String(value ?? '').trim();
    return text || 'Not provided';
  };

  const profileData = [
    { label: 'Name', value: showValue(safeUser.name) },
    { label: 'ID', value: showValue(safeUser.id || safeUser.studentId) },
    { label: 'Department', value: showValue(safeUser.department) },
    { label: 'Intake', value: showValue(safeUser.intake) },
    { label: 'Email', value: showValue(safeUser.email) },
    { label: 'Mobile', value: showValue(safeUser.mobile) },
    { label: 'Gender', value: showValue(safeUser.gender) },
    { label: 'Blood Group', value: showValue(safeUser.bloodGroup) },
    { label: 'Admission Semester', value: showValue(safeUser.admissionSemester) },
  ];

  const primaryImage = safeUser.avatar || safeUser.avatarSmall || '';
  const [profileImageSrc, setProfileImageSrc] = useState(primaryImage);
  const [showImageFallback, setShowImageFallback] = useState(!primaryImage);

  useEffect(() => {
    setProfileImageSrc(primaryImage);
    setShowImageFallback(!primaryImage);
  }, [primaryImage]);

  const initials = useMemo(() => {
    const nameParts = String(safeUser.name || 'Student')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (nameParts.length === 0) return 'ST';
    if (nameParts.length === 1) return nameParts[0].slice(0, 2).toUpperCase();
    return `${nameParts[0][0] || ''}${nameParts[nameParts.length - 1][0] || ''}`.toUpperCase();
  }, [safeUser.name]);

  if (!user) {
    return <div className="pending-alert">Loading profile...</div>;
  }

  const handleProfileImageError = () => {
    if (profileImageSrc !== safeUser.avatarSmall && safeUser.avatarSmall) {
      setProfileImageSrc(safeUser.avatarSmall);
      return;
    }

    setShowImageFallback(true);
  };

  return (
    <div className="page-container">
      <header className="profile-hero">
        <div className="profile-hero__inner">
          <button
            className="profile-hero__back"
            type="button"
            aria-label="Back to dashboard"
            onClick={() => setCurrentScreen('home')}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="profile-hero__content">
            <p className="profile-hero__name">{user.name}</p>
            <p className="profile-hero__badge">{user.program}</p>
          </div>
        </div>
      </header>

      <div className="profile-photo-wrap">
        <div className="profile-photo-frame">
          {!showImageFallback ? (
            <img
              className="profile-photo"
              src={profileImageSrc}
              alt={`${user.name} profile photo`}
              onError={handleProfileImageError}
            />
          ) : (
            <div className="profile-photo-placeholder" aria-label="Profile initials avatar">
              {initials}
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <h2 className="profile-content__title">Personal Information</h2>

        <div className="profile-table">
          {profileData.map((item, index) => (
            <div key={index} className="profile-row">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
