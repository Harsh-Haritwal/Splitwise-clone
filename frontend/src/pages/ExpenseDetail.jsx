import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ExpenseForm from "../components/ExpenseForm";
import { useAuth } from "../context/auth-context";

const initial = (name) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

const formatDate = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }
  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getCreatedDate = (expense) => {
  if (expense.createdAt) {
    return expense.createdAt;
  }
  return new Date(parseInt(expense._id.substring(0, 8), 16) * 1000);
};

const formatAmount = (value) => {
  return Number(value).toFixed(2);
};

function ExpenseDetail() {
  const { groupId, expenseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get(`/expense/${expenseId}`),
      api.get(`/group/${groupId}`),
    ])
      .then(([expenseData, groupData]) => {
        if (!cancelled) {
          setExpense(expenseData.expense);
          setGroup(groupData.group);
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
  }, [expenseId, groupId, version]);

  const handleSaved = async () => {
    const data = await api.get(`/expense/${expenseId}`);
    setExpense(data.expense);
    setEditing(false);
    setMessage("Expense updated successfully");
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this expense? This cannot be undone.",
    );
    if (!confirmed) {
      return;
    }

    setDeleteError("");
    setDeleting(true);
    try {
      await api.delete(`/expense/${expenseId}`);
      navigate(`/groups/${groupId}`);
    } catch (error) {
      setDeleteError(error.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page">
        <div className="loading">
          <div className="spinner"></div>
          Loading expense...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page">
        <Link to={`/groups/${groupId}`} className="back-link">
          ← Back to group
        </Link>
        <div className="card">
          <div className="alert alert-error mb-16">{error}</div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setError("");
              setLoading(true);
              setVersion((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const canModify =
    expense.paidBy._id === user.id || group.createdBy._id === user.id;

  return (
    <div className="container page">
      <Link to={`/groups/${groupId}`} className="back-link">
        ← Back to {group.name}
      </Link>

      <div className="page-head">
        <div className="row">
          <span className="avatar avatar-lg">
            {initial(expense.description)}
          </span>
          <div>
            <h1 className="section-title">{expense.description}</h1>
            <p className="section-subtitle">
              Added on {formatDate(getCreatedDate(expense))} by{" "}
              {expense.paidBy.name}
            </p>
          </div>
        </div>

        <div className="expense-total">₹{formatAmount(expense.amount)}</div>
      </div>

      {canModify && (
        <div className="form-actions mb-16">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setEditing(!editing);
              setMessage("");
            }}
          >
            {editing ? "Cancel edit" : "Edit expense"}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete expense"}
          </button>
        </div>
      )}

      {message && <div className="alert alert-info mb-16">{message}</div>}

      {deleteError && (
        <div className="alert alert-error mb-16">{deleteError}</div>
      )}

      {editing && (
        <div className="card mb-16">
          <div className="card-header">
            <div>
              <div className="card-title">Edit expense</div>
              <div className="card-subtitle">
                Update the amount, who paid, or how it is split.
              </div>
            </div>
          </div>

          <ExpenseForm group={group} expense={expense} onSaved={handleSaved} />
        </div>
      )}

      <div className="card mb-16">
        <div className="card-header">
          <div>
            <div className="card-title">Details</div>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <div className="detail-label">Amount</div>
            <div className="amount">₹{formatAmount(expense.amount)}</div>
          </div>

          <div>
            <div className="detail-label">Paid by</div>
            <div className="list-main">
              <span className="avatar avatar-sm">
                {initial(expense.paidBy.name)}
              </span>
              <span className="list-title">{expense.paidBy.name}</span>
            </div>
          </div>

          <div>
            <div className="detail-label">Date</div>
            <div>{formatDate(getCreatedDate(expense))}</div>
          </div>

          <div>
            <div className="detail-label">Participants</div>
            <div>{expense.participants.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Who owes what</div>
            <div className="card-subtitle">
              This is how the expense was split.
            </div>
          </div>
        </div>

        <div className="list">
          {expense.splits.map((split) => (
            <div className="list-row" key={split.user._id}>
              <div className="list-main">
                <span className="avatar avatar-sm">
                  {initial(split.user.name)}
                </span>
                <span className="list-title">
                  {split.user.name}
                  {split.user._id === user.id ? " (you)" : ""}
                </span>
              </div>
              <div className="amount">₹{formatAmount(split.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExpenseDetail;
