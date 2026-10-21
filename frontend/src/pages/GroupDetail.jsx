import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/auth-context";

const initial = (name) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

function GroupDetail() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberMessage, setMemberMessage] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/group/${groupId}`)
      .then((data) => {
        if (!cancelled) {
          setGroup(data.group);
          setGroupName(data.group.name);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const loadGroup = async () => {
    const data = await api.get(`/group/${groupId}`);
    setGroup(data.group);
    setGroupName(data.group.name);
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setMemberError("");
    setMemberMessage("");

    if (!addEmail.trim()) {
      setMemberError("Enter the email of the person you want to add");
      return;
    }

    setAdding(true);
    try {
      await api.post(`/group/${groupId}/members`, {
        newMemberEmail: addEmail.trim(),
      });
      setAddEmail("");
      await loadGroup();
      setMemberMessage("Member added successfully");
    } catch (error) {
      setMemberError(error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    const confirmed = window.confirm("Remove this member from the group?");
    if (!confirmed) {
      return;
    }

    setMemberError("");
    setMemberMessage("");
    try {
      await api.delete(`/group/${groupId}/members/${memberId}`);
      await loadGroup();
      setMemberMessage("Member removed successfully");
    } catch (error) {
      setMemberError(error.message);
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    setSettingsError("");

    if (!groupName.trim()) {
      setSettingsError("Group name cannot be empty");
      return;
    }

    setSavingName(true);
    try {
      await api.patch(`/group/${groupId}`, { name: groupName.trim() });
      await loadGroup();
      setMemberMessage("Group name updated");
    } catch (error) {
      setSettingsError(error.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      "Delete this group and all its expenses? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setSettingsError("");
    setDeleting(true);
    try {
      await api.delete(`/group/${groupId}`);
      navigate("/");
    } catch (error) {
      setSettingsError(error.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <div className="loading">
          <div className="spinner"></div>
          Loading group...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <Link to="/" className="back-link">
          ← All groups
        </Link>
        <div className="alert alert-error mt-16">{error}</div>
      </div>
    );
  }

  const isOwner = group.createdBy._id === user.id;

  return (
    <div className="container page">
      <Link to="/" className="back-link">
        ← All groups
      </Link>

      <div className="page-head">
        <div className="row">
          <span className="group-avatar group-avatar-lg">
            {initial(group.name)}
          </span>
          <div>
            <h1 className="section-title">{group.name}</h1>
            <p className="section-subtitle">
              {group.members.length} member
              {group.members.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? "Close settings" : "Group settings"}
          </button>
        )}
      </div>

      {showSettings && isOwner && (
        <div className="card mb-16">
          <div className="card-header">
            <div>
              <div className="card-title">Group settings</div>
              <div className="card-subtitle">
                Rename or delete this group.
              </div>
            </div>
          </div>

          {settingsError && (
            <div className="alert alert-error mb-16">{settingsError}</div>
          )}

          <form className="form" onSubmit={handleRename}>
            <div className="field">
              <label htmlFor="groupName">Group name</label>
              <input
                id="groupName"
                type="text"
                className="input"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingName}
              >
                {savingName ? "Saving..." : "Save name"}
              </button>
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={handleDeleteGroup}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete group"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Members</div>
            <div className="card-subtitle">Everyone who shares this group.</div>
          </div>
        </div>

        {memberMessage && (
          <div className="alert alert-info mb-16">{memberMessage}</div>
        )}
        {memberError && (
          <div className="alert alert-error mb-16">{memberError}</div>
        )}

        <div className="list">
          {group.members.map((member) => (
            <div className="list-row" key={member._id}>
              <div className="list-main">
                <span className="avatar avatar-sm">{initial(member.name)}</span>
                <div>
                  <div className="list-title">{member.name}</div>
                  <div className="list-meta">{member.email}</div>
                </div>
              </div>
              <div className="row">
                {member._id === group.createdBy._id && (
                  <span className="badge">Owner</span>
                )}
                {member._id !== group.createdBy._id &&
                  member._id !== user.id && (
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm"
                      onClick={() => handleRemoveMember(member._id)}
                    >
                      Remove
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>

        <form className="add-member" onSubmit={handleAddMember}>
          <div className="field">
            <label htmlFor="memberEmail">Add a member by email</label>
            <div className="inline-form">
              <input
                id="memberEmail"
                type="email"
                className="input"
                placeholder="friend@example.com"
                value={addEmail}
                onChange={(event) => setAddEmail(event.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add member"}
              </button>
            </div>
            <span className="field-hint">
              The person needs a Splitwise account already.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupDetail;
