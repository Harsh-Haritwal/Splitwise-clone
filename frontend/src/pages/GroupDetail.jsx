import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

const initial = (name) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

function GroupDetail() {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/group/${groupId}`)
      .then((data) => setGroup(data.group))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [groupId]);

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
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Members</div>
            <div className="card-subtitle">Everyone who shares this group.</div>
          </div>
        </div>

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
              {member._id === group.createdBy._id && (
                <span className="badge">Owner</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GroupDetail;
