import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/auth-context";

function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [passError, setPassError] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const joinedAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "";

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    if (!name.trim()) {
      setProfileError("Name cannot be empty");
      return;
    }

    setSavingProfile(true);
    try {
      await api.patch("/user/profile", {
        name: name.trim(),
        avatar: avatar.trim(),
      });
      await refreshUser();
      setAvatarBroken(false);
      setProfileMessage("Profile updated successfully");
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPassMessage("");
    setPassError("");

    if (!currentPass || !newPass || !confirmPass) {
      setPassError("Please fill in all the password fields");
      return;
    }
    if (newPass.length < 8) {
      setPassError("New password must be at least 8 characters");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("New passwords do not match");
      return;
    }

    setSavingPass(true);
    try {
      await api.patch("/user/change-password", {
        currentPass: currentPass,
        updatedPass: newPass,
      });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setPassMessage("Password changed successfully");
    } catch (error) {
      setPassError(error.message);
    } finally {
      setSavingPass(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeleting(true);
    try {
      await api.delete("/user/profile");
      logout();
      navigate("/login");
    } catch (error) {
      setDeleteError(error.message);
      setDeleting(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Account / personal ledger</p>
          <h1 className="section-title">Your profile</h1>
          <p className="section-subtitle">
            Manage your name, photo and password.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card profile-summary">
          <span className="avatar avatar-lg">
            {avatar && !avatarBroken ? (
              <img
                src={avatar}
                alt={user.name}
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </span>
          <h2 className="profile-name">{user.name}</h2>
          <p className="muted small">{user.email}</p>
          {joinedAt && <p className="muted small mt-8">Member since {joinedAt}</p>}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Profile details</div>
              <div className="card-subtitle">This is how friends see you.</div>
            </div>
          </div>

          {profileMessage && (
            <div className="alert alert-info mb-16">{profileMessage}</div>
          )}
          {profileError && (
            <div className="alert alert-error mb-16">{profileError}</div>
          )}

          <form className="form" onSubmit={handleProfileSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                className="input"
                maxLength="50"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="avatar">Avatar image URL</label>
              <input
                id="avatar"
                type="url"
                className="input"
                maxLength="500"
                placeholder="https://example.com/photo.jpg"
                value={avatar}
                onChange={(event) => setAvatar(event.target.value)}
              />
              <span className="field-hint">
                Leave it empty to keep the default picture.
              </span>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mt-16">
        <div className="card-header">
          <div>
            <div className="card-title">Change password</div>
            <div className="card-subtitle">
              Use at least 8 characters for the new password.
            </div>
          </div>
        </div>

        {passMessage && <div className="alert alert-info mb-16">{passMessage}</div>}
        {passError && <div className="alert alert-error mb-16">{passError}</div>}

        <form className="form" onSubmit={handlePasswordSubmit}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="currentPass">Current password</label>
              <input
                id="currentPass"
                type="password"
                className="input"
                value={currentPass}
                onChange={(event) => setCurrentPass(event.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label htmlFor="newPass">New password</label>
              <input
                id="newPass"
                type="password"
                className="input"
                value={newPass}
                onChange={(event) => setNewPass(event.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="confirmPass">Confirm new password</label>
            <input
              id="confirmPass"
              type="password"
              className="input"
              value={confirmPass}
              onChange={(event) => setConfirmPass(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingPass}
            >
              {savingPass ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>

      <div className="card mt-16 danger-zone">
        <div className="card-header">
          <div>
            <div className="card-title">Delete account</div>
            <div className="card-subtitle">
              This removes your account and cannot be undone.
            </div>
          </div>
        </div>

        {deleteError && <div className="alert alert-error mb-16">{deleteError}</div>}

        <button
          type="button"
          className="btn btn-danger-outline"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete my account"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
