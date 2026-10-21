import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ExpenseForm from "../components/ExpenseForm";
import SettlementForm from "../components/SettlementForm";
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

const balanceLabel = (balance) => {
  if (balance > 0) {
    return "gets back";
  }
  if (balance < 0) {
    return "owes";
  }
  return "settled";
};

const EXPENSE_PAGE_SIZE = 20;

const formatAmount = (value) => {
  return Number(value).toFixed(2);
};

function GroupDetail() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [groupVersion, setGroupVersion] = useState(0);

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState("");
  const [expensePage, setExpensePage] = useState(1);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [expenseTotalPages, setExpenseTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [balances, setBalances] = useState([]);
  const [balanceSummary, setBalanceSummary] = useState(null);
  const [debts, setDebts] = useState([]);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [balancesError, setBalancesError] = useState("");
  const [balanceVersion, setBalanceVersion] = useState(0);

  const [settlements, setSettlements] = useState([]);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [settlementsError, setSettlementsError] = useState("");
  const [settlementDraft, setSettlementDraft] = useState(null);

  const [addEmail, setAddEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberMessage, setMemberMessage] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState("expenses");

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
  }, [groupId, groupVersion]);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/expense/group/${groupId}?page=1&limit=${EXPENSE_PAGE_SIZE}`)
      .then((data) => {
        if (!cancelled) {
          setExpenses(data.expenses);
          setExpensePage(data.page);
          setExpenseTotal(data.total);
          setExpenseTotalPages(data.totalPages);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setExpensesError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setExpensesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get(`/balance/group/${groupId}`),
      api.get(`/balance/group/${groupId}/summary`),
      api.get(`/balance/group/${groupId}/settle`),
    ])
      .then(([balanceData, summaryData, settleData]) => {
        if (!cancelled) {
          setBalances(balanceData.balances);
          setBalanceSummary(summaryData.summary);
          setDebts(settleData.settlements);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setBalancesError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBalancesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, balanceVersion]);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/settlement/group/${groupId}`)
      .then((data) => {
        if (!cancelled) {
          setSettlements(data.settlements);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSettlementsError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSettlementsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [groupId, balanceVersion]);

  const loadGroup = async () => {
    const data = await api.get(`/group/${groupId}`);
    setGroup(data.group);
    setGroupName(data.group.name);
  };

  const loadExpenses = async () => {
    const data = await api.get(
      `/expense/group/${groupId}?page=1&limit=${EXPENSE_PAGE_SIZE}`,
    );
    setExpenses(data.expenses);
    setExpensePage(data.page);
    setExpenseTotal(data.total);
    setExpenseTotalPages(data.totalPages);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setExpensesError("");
    try {
      const nextPage = expensePage + 1;
      const data = await api.get(
        `/expense/group/${groupId}?page=${nextPage}&limit=${EXPENSE_PAGE_SIZE}`,
      );
      setExpenses([...expenses, ...data.expenses]);
      setExpensePage(data.page);
      setExpenseTotal(data.total);
      setExpenseTotalPages(data.totalPages);
    } catch (error) {
      setExpensesError(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleExpenseSaved = async () => {
    await loadExpenses();
    setBalanceVersion((version) => version + 1);
  };

  const handleRetryExpenses = () => {
    setExpensesLoading(true);
    setExpensesError("");
    loadExpenses()
      .catch((error) => setExpensesError(error.message))
      .finally(() => setExpensesLoading(false));
  };

  const handleRetryBalances = () => {
    setBalancesLoading(true);
    setBalancesError("");
    setBalanceVersion((version) => version + 1);
  };

  const handleRetrySettlements = () => {
    setSettlementsLoading(true);
    setSettlementsError("");
    setBalanceVersion((version) => version + 1);
  };

  const handleSettlementSaved = () => {
    setBalanceVersion((version) => version + 1);
  };

  const handleStartSettlement = (debt) => {
    setSettlementDraft({
      from: debt.from._id,
      to: debt.to._id,
      amount: debt.amount,
    });
    setTab("settlements");
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
    setSettingsMessage("");

    if (!groupName.trim()) {
      setSettingsError("Group name cannot be empty");
      return;
    }

    setSavingName(true);
    try {
      await api.patch(`/group/${groupId}`, { name: groupName.trim() });
      await loadGroup();
      setSettingsMessage("Group name updated");
    } catch (error) {
      setSettingsError(error.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      "Delete this group and all its expenses and settlements? This cannot be undone.",
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
        <div className="card">
          <div className="alert alert-error mb-16">{error}</div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setError("");
              setLoading(true);
              setGroupVersion((version) => version + 1);
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isOwner = group.createdBy._id === user.id;

  return (
    <div className="container page">
      <Link to="/" className="back-link">
        ← All groups
      </Link>

      <div className="page-head group-page-head">
        <div className="row">
          <span className="group-avatar group-avatar-lg">
            {initial(group.name)}
          </span>
          <div>
            <p className="eyebrow">
              Group ledger / {group.members.length} member
              {group.members.length === 1 ? "" : "s"}
            </p>
            <h1 className="section-title">{group.name}</h1>
            <p className="section-subtitle">
              Opened {formatDate(group.createdAt)}
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

      <div className="group-strip">
        <span>Ledger open</span>
        <span className="dot">/</span>
        <span>{expenseTotal} entries</span>
        <span className="dot">/</span>
        <span>{group.members.length} people</span>
        <span className="push">{tab}</span>
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
          {settingsMessage && (
            <div className="alert alert-info mb-16">{settingsMessage}</div>
          )}

          <form className="form" onSubmit={handleRename}>
            <div className="field">
              <label htmlFor="groupName">Group name</label>
              <input
                id="groupName"
                type="text"
                className="input"
                maxLength="60"
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

      <div className="tabs">
        <button
          type="button"
          className={tab === "expenses" ? "tab active" : "tab"}
          onClick={() => setTab("expenses")}
        >
          Expenses
        </button>
        <button
          type="button"
          className={tab === "balances" ? "tab active" : "tab"}
          onClick={() => setTab("balances")}
        >
          Balances
        </button>
        <button
          type="button"
          className={tab === "settlements" ? "tab active" : "tab"}
          onClick={() => {
            setSettlementDraft(null);
            setTab("settlements");
          }}
        >
          Settlements
        </button>
        <button
          type="button"
          className={tab === "members" ? "tab active" : "tab"}
          onClick={() => setTab("members")}
        >
          Members
        </button>
      </div>

      {tab === "expenses" && (
        <>
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Add an expense</div>
                <div className="card-subtitle">
                  Split it equally, by exact amounts or by percentage.
                </div>
              </div>
            </div>

            <ExpenseForm group={group} onSaved={handleExpenseSaved} />
          </div>

          <div className="card mt-16">
            <div className="card-header">
              <div>
                <div className="card-title">Expense history</div>
                <div className="card-subtitle">
                  {expensesLoading
                    ? "Loading expenses..."
                    : expenses.length === 0
                      ? "No expenses in this group yet."
                      : `Showing ${expenses.length} of ${expenseTotal} expense${
                          expenseTotal === 1 ? "" : "s"
                        }.`}
                </div>
              </div>
            </div>

            {expensesLoading && (
              <div className="loading">
                <div className="spinner"></div>
                Loading expenses...
              </div>
            )}

            {!expensesLoading && expensesError && (
              <div className="mb-16">
                <div className="alert alert-error mb-16">{expensesError}</div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleRetryExpenses}
                >
                  Try again
                </button>
              </div>
            )}

            {!expensesLoading && !expensesError && expenses.length === 0 && (
              <div className="empty">
                <div className="empty-title">Nothing here yet</div>
                Add your first expense above.
              </div>
            )}

            {!expensesLoading && expenses.length > 0 && (
              <>
                <div>
                  {expenses.map((expense) => (
                    <Link
                      className="expense-row"
                      key={expense._id}
                      to={`/groups/${groupId}/expenses/${expense._id}`}
                    >
                      <div className="list-main">
                        <span className="avatar">
                          {initial(expense.description)}
                        </span>
                        <div>
                          <div className="list-title">
                            {expense.description}
                          </div>
                          <div className="list-meta">
                            Paid by {expense.paidBy.name} ·{" "}
                            {formatDate(getCreatedDate(expense))}
                          </div>
                        </div>
                      </div>
                      <div className="list-end">
                        <div className="amount">
                          ₹{formatAmount(expense.amount)}
                        </div>
                        <div className="list-meta">
                          {expense.splits.length} participant
                          {expense.splits.length === 1 ? "" : "s"}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {expensePage < expenseTotalPages && (
                  <div className="form-actions mt-16">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Loading..." : "Load more expenses"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {tab === "balances" && (
        <>
          {balancesLoading && (
            <div className="card">
              <div className="loading">
                <div className="spinner"></div>
                Loading balances...
              </div>
            </div>
          )}

          {!balancesLoading && balancesError && (
            <div className="card">
              <div className="alert alert-error mb-16">{balancesError}</div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleRetryBalances}
              >
                Try again
              </button>
            </div>
          )}

          {!balancesLoading && !balancesError && balanceSummary && (
            <>
              <div className="summary-grid mb-16">
                <div className="summary-card">
                  <span className="detail-label">Your balance</span>
                  <span
                    className={
                      balanceSummary.myBalance > 0
                        ? "summary-value amount-pos"
                        : balanceSummary.myBalance < 0
                          ? "summary-value amount-neg"
                          : "summary-value"
                    }
                  >
                    {balanceSummary.myBalance === 0
                      ? "₹0.00"
                      : `${balanceSummary.myBalance > 0 ? "+" : "-"}₹${formatAmount(
                          Math.abs(balanceSummary.myBalance),
                        )}`}
                  </span>
                  <span className="small muted">
                    {balanceSummary.myStatus === "gets back"
                      ? "You get back"
                      : balanceSummary.myStatus === "owes"
                        ? "You owe"
                        : "You are settled up"}
                  </span>
                </div>

                <div className="summary-card">
                  <span className="detail-label">Total spent</span>
                  <span className="summary-value">
                    ₹{formatAmount(balanceSummary.totalExpenseAmount)}
                  </span>
                  <span className="small muted">
                    {balanceSummary.expenseCount} expense
                    {balanceSummary.expenseCount === 1 ? "" : "s"} ·{" "}
                    {balanceSummary.memberCount} member
                    {balanceSummary.memberCount === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="summary-card">
                  <span className="detail-label">Settled members</span>
                  <span className="summary-value">
                    {balanceSummary.settledMembers}
                  </span>
                  <span className="small muted">
                    {balanceSummary.getBackMembers} getting back ·{" "}
                    {balanceSummary.oweMembers} owing
                  </span>
                </div>
              </div>

              <div className="card mb-16">
                <div className="card-header">
                  <div>
                    <div className="card-title">Member balances</div>
                    <div className="card-subtitle">
                      A positive balance means the member gets money back.
                    </div>
                  </div>
                </div>

                <div className="list">
                  {balances.map((item) => (
                    <div className="list-row" key={item.user._id}>
                      <div className="list-main">
                        <span className="avatar avatar-sm">
                          {initial(item.user.name)}
                        </span>
                        <div>
                          <div className="list-title">
                            {item.user.name}
                            {item.user._id === user.id ? " (you)" : ""}
                          </div>
                          <div className="list-meta">
                            Paid ₹{formatAmount(item.paid)} · Share ₹
                            {formatAmount(item.share)}
                          </div>
                        </div>
                      </div>

                      <div className="list-end">
                        <div
                          className={
                            item.balance > 0
                              ? "amount amount-pos"
                              : item.balance < 0
                                ? "amount amount-neg"
                                : "amount"
                          }
                        >
                          {item.balance === 0
                            ? "₹0.00"
                            : `${item.balance > 0 ? "+" : "-"}₹${formatAmount(
                                Math.abs(item.balance),
                              )}`}
                        </div>
                        <div className="list-meta">
                          {balanceLabel(item.balance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">Settle up</div>
                    <div className="card-subtitle">
                      The fewest payments that clear every debt in this group.
                    </div>
                  </div>
                </div>

                {debts.length === 0 && (
                  <div className="empty">
                    <div className="empty-title">Everyone is settled up</div>
                    No payments are needed right now.
                  </div>
                )}

                {debts.length > 0 && (
                  <div className="list">
                    {debts.map((debt, index) => (
                      <div
                        className="list-row"
                        key={`${debt.from._id}-${debt.to._id}-${index}`}
                      >
                        <div className="list-main">
                          <span className="avatar avatar-sm">
                            {initial(debt.from.name)}
                          </span>
                          <div>
                            <div className="list-title">
                              {debt.from.name} pays {debt.to.name}
                            </div>
                            <div className="list-meta">
                              {debt.from.name} owes {debt.to.name}
                            </div>
                          </div>
                        </div>
                        <div className="list-end">
                          <div className="amount">
                            ₹{formatAmount(debt.amount)}
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm mt-8"
                            onClick={() => handleStartSettlement(debt)}
                          >
                            Record
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {tab === "settlements" && (
        <>
          <div className="card mb-16">
            <div className="card-header">
              <div>
                <div className="card-title">Record a settlement</div>
                <div className="card-subtitle">
                  Use this when someone pays another member back.
                </div>
              </div>
            </div>

            <SettlementForm
              group={group}
              draft={settlementDraft}
              onSaved={handleSettlementSaved}
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Settlement history</div>
                <div className="card-subtitle">
                  {settlements.length === 0
                    ? "No settlements recorded yet."
                    : `${settlements.length} settlement${
                        settlements.length === 1 ? "" : "s"
                      } recorded.`}
                </div>
              </div>
            </div>

            {settlementsLoading && (
              <div className="loading">
                <div className="spinner"></div>
                Loading settlements...
              </div>
            )}

            {!settlementsLoading && settlementsError && (
              <div className="mb-16">
                <div className="alert alert-error mb-16">{settlementsError}</div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleRetrySettlements}
                >
                  Try again
                </button>
              </div>
            )}

            {!settlementsLoading &&
              !settlementsError &&
              settlements.length === 0 && (
                <div className="empty">
                  <div className="empty-title">Nothing settled yet</div>
                  Record a payment above when someone pays you back.
                </div>
              )}

            {!settlementsLoading &&
              !settlementsError &&
              settlements.length > 0 && (
                <div className="list">
                  {settlements.map((settlement) => (
                    <div className="list-row" key={settlement._id}>
                      <div className="list-main">
                        <span className="avatar avatar-sm">
                          {initial(settlement.paidBy.name)}
                        </span>
                        <div>
                          <div className="list-title">
                            {settlement.paidBy.name} paid{" "}
                            {settlement.paidTo.name}
                          </div>
                          <div className="list-meta">
                            {formatDate(settlement.createdAt)}
                            {settlement.note ? ` · ${settlement.note}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="amount">
                        ₹{formatAmount(settlement.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </>
      )}

      {tab === "members" && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Members</div>
              <div className="card-subtitle">
                Everyone who shares this group.
              </div>
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
                maxLength="254"
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
              The person needs a Khata account already.
            </span>
          </div>
        </form>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
