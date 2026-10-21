import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/auth-context";

const formatAmount = (value) => {
  return Number(value).toFixed(2);
};

const formatSigned = (value) => {
  if (value === 0) {
    return "₹0.00";
  }
  return `${value > 0 ? "+" : "-"}₹${formatAmount(Math.abs(value))}`;
};

function Dashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overall, setOverall] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadGroups = async () => {
    setError("");
    setLoading(true);
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

  useEffect(() => {
    let cancelled = false;
    api
      .get("/balance/me")
      .then((data) => {
        if (!cancelled) {
          setOverall(data);
        }
      })
      .catch(() => {});

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
      const balanceData = await api.get("/balance/me");
      setOverall(balanceData);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const overallValue = overall ? overall.overallBalance : 0;
  const groupBalanceMap = {};
  if (overall) {
    for (const item of overall.groups) {
      groupBalanceMap[item.group._id] = item.balance;
    }
  }

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date()
    .toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  const owedToYou = overall
    ? overall.groups.reduce(
        (total, item) => (item.balance > 0 ? total + item.balance : total),
        0,
      )
    : 0;
  const youOwe = overall
    ? overall.groups.reduce(
        (total, item) =>
          item.balance < 0 ? total + Math.abs(item.balance) : total,
        0,
      )
    : 0;
  const topGroup =
    overall && overall.groups.length > 0
      ? [...overall.groups].sort(
          (first, second) =>
            Math.abs(second.balance) - Math.abs(first.balance),
        )[0]
      : null;
  const totalMembers = groups.reduce(
    (total, group) => total + (group.members?.length || 0),
    0,
  );
  const balanceTone =
    overallValue > 0 ? "amount-pos" : overallValue < 0 ? "amount-neg" : "";
  const balanceStatus =
    overallValue > 0
      ? "in your favour"
      : overallValue < 0
        ? "to settle"
        : "all square";

  return (
    <div className="container page">
      <section className="dash-hero">
        <div>
          <p className="eyebrow">The shared ledger / {today}</p>
          <h1 className="dash-title">
            {greeting},<br />
            <span>{firstName}.</span>
          </h1>
          <p className="dash-deck">
            A plain-spoken account of who paid, who owes, and what happened at
            dinner. No chasing, no calculator, no group-chat archaeology.
          </p>
        </div>

        <aside className="balance-slip">
          <span className="stamp">Net position</span>
          <p className="eyebrow">Overall balance</p>
          <span className={`balance-big ${balanceTone}`}>
            {formatSigned(overallValue)}
          </span>
          <p className="balance-note">
            {balanceStatus} / across {overall ? overall.groupCount : 0} circle
            {overall && overall.groupCount === 1 ? "" : "s"}
          </p>
          <div className="balance-split">
            <div>
              <span>Owed to you</span>
              <strong>₹{formatAmount(owedToYou)}</strong>
            </div>
            <div>
              <span>You owe</span>
              <strong>₹{formatAmount(youOwe)}</strong>
            </div>
          </div>
        </aside>
      </section>

      <div className="ticker">
        <span>
          {owedToYou > 0
            ? `₹${formatAmount(owedToYou)} owed to you`
            : "No one owes you"}
        </span>
        <span className="ticker-dot">•</span>
        <span>
          {youOwe > 0
            ? `₹${formatAmount(youOwe)} to settle`
            : "Nothing to settle"}
        </span>
        <span className="ticker-dot">•</span>
        <span>
          {groups.length} circle{groups.length === 1 ? "" : "s"} / {totalMembers}{" "}
          people
        </span>
        <span className="ticker-push">Live ledger</span>
      </div>

      <div className="dash-grid">
        <section>
          <div className="section-bar">
            <div className="row">
              <span className="num">01</span>
              <h2 className="section-title">Your circles</h2>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close" : "+ New circle"}
            </button>
          </div>

          {showForm && (
            <div className="card dash-form-card">
              <div className="card-header">
                <div>
                  <div className="card-title">New circle</div>
                  <div className="card-subtitle">
                    You can add friends after creating it.
                  </div>
                </div>
              </div>

              {formError && (
                <div className="alert alert-error mb-16">{formError}</div>
              )}

              <form className="form" onSubmit={handleCreate}>
                <div className="field">
                  <label htmlFor="groupName">Circle name</label>
                  <input
                    id="groupName"
                    type="text"
                    className="input"
                    maxLength="60"
                    placeholder="Goa trip, Flat 4B, Sunday football..."
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
                    {saving ? "Creating..." : "Create circle"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              Loading your circles...
            </div>
          )}

          {!loading && error && (
            <div className="card mt-16">
              <div className="alert alert-error mb-16">{error}</div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={loadGroups}
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="card mt-16">
              <div className="empty">
                <div className="empty-title">No circles yet</div>
                <p>
                  Create your first circle to start splitting expenses with
                  friends, flatmates or your trip group.
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-16"
                  onClick={() => setShowForm(true)}
                >
                  Create a circle
                </button>
              </div>
            </div>
          )}

          {!loading && !error && groups.length > 0 && (
            <div className="circle-grid">
              {groups.map((group, index) => {
                const balance = groupBalanceMap[group._id] || 0;
                const groupTone =
                  balance > 0
                    ? "amount-pos"
                    : balance < 0
                      ? "amount-neg"
                      : "";
                return (
                  <Link
                    to={`/groups/${group._id}`}
                    className="circle-card"
                    key={group._id}
                  >
                    <div className="circle-head">
                      <span className="circle-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="circle-tag">
                        {balance === 0
                          ? "Settled"
                          : balance > 0
                            ? "Owed to you"
                            : "You owe"}
                      </span>
                    </div>
                    <h3 className="circle-name">{group.name}</h3>
                    <p className="circle-meta">
                      {group.members?.length || 0} member
                      {group.members?.length === 1 ? "" : "s"} / opened{" "}
                      {new Date(group.createdAt).toLocaleDateString()}
                    </p>
                    <div className="circle-foot">
                      <p className={`circle-balance ${groupTone}`}>
                        {formatSigned(balance)}
                        <span>
                          {balance === 0
                            ? "All clear"
                            : balance > 0
                              ? "You get back"
                              : "You owe"}
                        </span>
                      </p>
                      <span className="circle-stamp" aria-hidden="true">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="dash-rail">
          <section className="rail-card">
            <div className="rail-head">
              <h2>Settle up</h2>
              <span>
                {overall ? overall.groupCount : 0} circle
                {overall && overall.groupCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="rail-body">
              <p className="rail-copy">
                The shortest path to zero. Open a circle to record a payment or
                see exactly who owes whom.
              </p>

              {topGroup && Math.abs(topGroup.balance) > 0.005 ? (
                <Link
                  to={`/groups/${topGroup.group._id}`}
                  className="rail-debt"
                >
                  <div className="rail-debt-top">
                    <span className="rail-debt-name">
                      {topGroup.group.name}
                    </span>
                    <span
                      className={`amount ${
                        topGroup.balance > 0 ? "amount-pos" : "amount-neg"
                      }`}
                    >
                      {formatSigned(topGroup.balance)}
                    </span>
                  </div>
                  <span className="rail-debt-meta">
                    {topGroup.balance > 0 ? "You get back" : "You owe"} / largest
                    open balance
                  </span>
                </Link>
              ) : (
                <div className="rail-debt">
                  <p className="rail-copy">
                    No open balances. You are all square.
                  </p>
                </div>
              )}

              {topGroup ? (
                <Link
                  to={`/groups/${topGroup.group._id}`}
                  className="btn btn-primary btn-block"
                >
                  Open {topGroup.group.name}
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => setShowForm(true)}
                >
                  Create a circle
                </button>
              )}
            </div>
          </section>

          <section className="receipt-slip">
            <div className="receipt-slip-head">
              <span>Khata / statement</span>
              <span>{today}</span>
            </div>
            <div className="receipt-line">
              <span>Circles</span>
              <span>{groups.length}</span>
            </div>
            <div className="receipt-line">
              <span>People</span>
              <span>{totalMembers}</span>
            </div>
            <div className="receipt-line">
              <span>Owed to you</span>
              <span>₹{formatAmount(owedToYou)}</span>
            </div>
            <div className="receipt-line">
              <span>You owe</span>
              <span>₹{formatAmount(youOwe)}</span>
            </div>
            <div className="barcode"></div>
            <p className="receipt-code">Khata / shared money, kept human</p>
          </section>

          <div className="classified">
            <p className="eyebrow">Classifieds</p>
            <strong>Wanted: friends who pay on time.</strong>
            <p>
              Inquire within. Must be comfortable with UPI and the occasional
              group photo.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Dashboard;
