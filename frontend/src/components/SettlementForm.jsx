import { useState } from "react";
import api from "../api";
import { useAuth } from "../context/auth-context";

function SettlementForm({ group, draft, onSaved }) {
  const { user } = useAuth();
  const otherMembers = group.members.filter((member) => {
    return member._id !== user.id;
  });

  const [paidBy, setPaidBy] = useState(draft ? draft.from : user.id);
  const [paidTo, setPaidTo] = useState(
    draft ? draft.to : otherMembers[0] ? otherMembers[0]._id : "",
  );
  const [amount, setAmount] = useState(draft ? String(draft.amount) : "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handlePaidByChange = (event) => {
    const newPaidBy = event.target.value;
    setPaidBy(newPaidBy);
    setError("");
    setSuccess("");

    if (paidTo === newPaidBy) {
      const nextMember = group.members.find((member) => {
        return member._id !== newPaidBy;
      });
      setPaidTo(nextMember ? nextMember._id : "");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const amountNumber = Number(amount);
    if (!paidBy || !paidTo) {
      setError("Choose both members");
      return;
    }
    if (paidBy === paidTo) {
      setError("A member cannot pay themselves");
      return;
    }
    if (!amountNumber || amountNumber <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        groupId: group._id,
        paidBy: paidBy,
        paidTo: paidTo,
        amount: amountNumber,
      };
      if (note.trim()) {
        payload.note = note.trim();
      }

      const data = await api.post("/settlement/add", payload);
      setAmount("");
      setNote("");
      setSuccess("Settlement recorded successfully");
      if (onSaved) {
        onSaved(data.settlement);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const receiverOptions = group.members.filter((member) => {
    return member._id !== paidBy;
  });

  if (group.members.length < 2) {
    return (
      <div className="alert alert-warn">
        Add another member to this group before recording a settlement.
      </div>
    );
  }

  return (
    <div>
      {error && <div className="alert alert-error mb-16">{error}</div>}
      {success && <div className="alert alert-info mb-16">{success}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="settlementPaidBy">Paid by</label>
            <select
              id="settlementPaidBy"
              className="select"
              value={paidBy}
              onChange={handlePaidByChange}
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
            <label htmlFor="settlementPaidTo">Paid to</label>
            <select
              id="settlementPaidTo"
              className="select"
              value={paidTo}
              onChange={(event) => setPaidTo(event.target.value)}
            >
              {receiverOptions.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.name}
                  {member._id === user.id ? " (you)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="settlementAmount">Amount (₹)</label>
            <input
              id="settlementAmount"
              type="number"
              min="0"
              max="10000000"
              step="0.01"
              className="input"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="settlementNote">Note (optional)</label>
            <input
              id="settlementNote"
              type="text"
              className="input"
              maxLength="200"
              placeholder="Paid by UPI"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Recording..." : "Record settlement"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettlementForm;
