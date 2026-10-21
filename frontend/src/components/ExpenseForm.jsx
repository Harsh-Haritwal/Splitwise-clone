import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/auth-context";

const initial = (name) => {
  return name ? name.charAt(0).toUpperCase() : "?";
};

const roundAmount = (value) => {
  return Math.round(value * 100) / 100;
};

const buildEqualShares = (total, ids) => {
  const shares = {};
  if (ids.length === 0) {
    return shares;
  }

  const each = roundAmount(total / ids.length);
  for (const id of ids) {
    shares[id] = each;
  }

  const difference = roundAmount(total - each * ids.length);
  shares[ids[ids.length - 1]] = roundAmount(each + difference);
  return shares;
};

function ExpenseForm({ group, onSaved }) {
  const { user } = useAuth();
  const memberIds = group.members.map((member) => member._id);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(
    memberIds.includes(user.id) ? user.id : memberIds[0],
  );
  const [participants, setParticipants] = useState(memberIds);
  const [splitType, setSplitType] = useState("equal");
  const [shares, setShares] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const amountNumber = Number(amount);

  const handleSplitTypeChange = (event) => {
    const newType = event.target.value;
    setSplitType(newType);
    setError("");
    setSuccess("");

    if (newType !== "equal") {
      const total = newType === "percentage" ? 100 : amountNumber;
      setShares(buildEqualShares(total || 0, participants));
    }
  };

  const handleParticipantToggle = (memberId) => {
    if (participants.includes(memberId)) {
      setParticipants(participants.filter((id) => id !== memberId));
    } else {
      setParticipants([...participants, memberId]);
    }
    setError("");
    setSuccess("");
  };

  const handleShareChange = (memberId, value) => {
    setShares({ ...shares, [memberId]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!description.trim()) {
      setError("Enter what this expense was for");
      return;
    }
    if (!amountNumber || amountNumber <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    if (!paidBy) {
      setError("Choose who paid");
      return;
    }
    if (participants.length === 0) {
      setError("Select at least one participant");
      return;
    }

    const payload = {
      description: description.trim(),
      amount: amountNumber,
      groupId: group._id,
      paidBy: paidBy,
      participants: participants,
      splitType: splitType,
    };

    if (splitType === "custom") {
      const splits = participants.map((id) => {
        return { user: id, amount: Number(shares[id]) };
      });
      const total = roundAmount(
        splits.reduce((sum, split) => sum + split.amount, 0),
      );
      const hasInvalidShare = splits.some((split) => {
        return !Number.isFinite(split.amount) || split.amount <= 0;
      });

      if (hasInvalidShare) {
        setError("Enter a valid amount for every participant");
        return;
      }
      if (total !== roundAmount(amountNumber)) {
        setError(
          `Shares add up to ₹${total}, but the expense is ₹${roundAmount(amountNumber)}`,
        );
        return;
      }

      payload.splits = splits;
    }

    if (splitType === "percentage") {
      const percentages = participants.map((id) => {
        return { user: id, percentage: Number(shares[id]) };
      });
      const total = roundAmount(
        percentages.reduce((sum, item) => sum + item.percentage, 0),
      );
      const hasInvalidPercentage = percentages.some((item) => {
        return (
          !Number.isFinite(item.percentage) ||
          item.percentage <= 0 ||
          item.percentage > 100
        );
      });

      if (hasInvalidPercentage) {
        setError("Enter a valid percentage for every participant");
        return;
      }
      if (total !== 100) {
        setError(`Percentages add up to ${total}%, they must add up to 100%`);
        return;
      }

      payload.percentages = percentages;
    }

    setSaving(true);
    try {
      const data = await api.post("/expense/add", payload);
      setDescription("");
      setAmount("");
      setShares({});
      setSuccess("Expense added successfully");
      if (onSaved) {
        onSaved(data.newExpense);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const enteredTotal = roundAmount(
    participants.reduce((sum, id) => {
      return sum + (Number(shares[id]) || 0);
    }, 0),
  );

  return (
    <div>
      {error && <div className="alert alert-error mb-16">{error}</div>}
      {success && <div className="alert alert-info mb-16">{success}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              className="input"
              placeholder="Dinner, cab, groceries..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              className="input"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="paidBy">Paid by</label>
            <select
              id="paidBy"
              className="select"
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
            >
              {group.members.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.name}
                  {member._id === user.id ? " (you)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="splitType">Split type</label>
            <select
              id="splitType"
              className="select"
              value={splitType}
              onChange={handleSplitTypeChange}
            >
              <option value="equal">Equally</option>
              <option value="custom">Custom amounts</option>
              <option value="percentage">By percentage</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Participants</label>
          <div className="checkbox-grid">
            {group.members.map((member) => (
              <label className="checkbox-row" key={member._id}>
                <input
                  type="checkbox"
                  checked={participants.includes(member._id)}
                  onChange={() => handleParticipantToggle(member._id)}
                />
                <span>{member.name}</span>
                {member._id === user.id && (
                  <span className="badge badge-muted">You</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {splitType === "equal" && amountNumber > 0 && participants.length > 0 && (
          <div className="alert alert-info">
            Each participant owes about ₹
            {roundAmount(amountNumber / participants.length).toFixed(2)}
          </div>
        )}

        {splitType !== "equal" && participants.length > 0 && (
          <div className="field">
            <label>
              {splitType === "percentage"
                ? "Percentage for each participant"
                : "Amount for each participant"}
            </label>

            <div className="share-list">
              {participants.map((id) => {
                const member = group.members.find((item) => item._id === id);
                return (
                  <div className="share-row" key={id}>
                    <div className="list-main">
                      <span className="avatar avatar-sm">
                        {initial(member.name)}
                      </span>
                      <span className="list-title">{member.name}</span>
                    </div>
                    <div className="row">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input share-input"
                        value={shares[id] || ""}
                        onChange={(event) =>
                          handleShareChange(id, event.target.value)
                        }
                      />
                      <span className="muted small">
                        {splitType === "percentage" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="field-hint">
              {splitType === "percentage"
                ? `Total: ${enteredTotal}% of 100%`
                : `Total: ₹${enteredTotal} of ₹${roundAmount(amountNumber) || 0}`}
            </span>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Adding expense..." : "Add expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;
