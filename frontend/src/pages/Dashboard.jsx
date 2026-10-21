import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/auth-context";

function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadGroups = async () => {
    try {
      const data = await api.get("/group/my-groups");
      setGroups(data.groups || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get("/group/my-groups")
      .then((data) => {
        if (!cancelled) {
          setGroups(data.groups || []);
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
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Enter a group name");
      return;
    }

    setSaving(true);
    try {
      await api.post("/group/create", {
        name: name.trim(),
        members: [user.id],
      });
      setName("");
      setShowForm(false);
      setLoading(true);
      await loadGroups();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1 className="section-title">Your groups</h1>
          <p className="section-subtitle">
            Create a group for a trip, flat or night out.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "New group"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-16">
          <div className="card-header">
            <div>
              <div className="card-title">New group</div>
              <div className="card-subtitle">
                You can add friends after creating it.
              </div>
            </div>
          </div>

          {formError && <div className="alert alert-error mb-16">{formError}</div>}

          <form className="form" onSubmit={handleCreate}>
            <div className="field">
              <label htmlFor="groupName">Group name</label>
              <input
                id="groupName"
                type="text"
                className="input"
                placeholder="Goa trip"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create group"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Loading your groups...
        </div>
      )}

      {!loading && error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && groups.length === 0 && (
        <div className="card">
          <div className="empty">
            <div className="empty-title">No groups yet</div>
            <p>Create your first group to start splitting expenses.</p>
            <button
              type="button"
              className="btn btn-primary mt-16"
              onClick={() => setShowForm(true)}
            >
              Create a group
            </button>
          </div>
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="groups-grid">
          {groups.map((group) => (
            <Link
              to={`/groups/${group._id}`}
              className="group-card"
              key={group._id}
            >
              <span className="group-avatar">
                {group.name.charAt(0).toUpperCase()}
              </span>
              <span className="group-info">
                <span className="group-name">{group.name}</span>
                <span className="group-meta">
                  {group.members.length} member
                  {group.members.length === 1 ? "" : "s"} · Created{" "}
                  {new Date(group.createdAt).toLocaleDateString()}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
