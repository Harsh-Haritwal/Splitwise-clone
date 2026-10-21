import { useAuth } from "../context/auth-context";

function Home() {
  const { user } = useAuth();

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1 className="section-title">Hi, {user.name}</h1>
          <p className="section-subtitle">
            Welcome back. Here is where your groups will live.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="empty">
          <div className="empty-title">No groups yet</div>
          <p>Create a group to start splitting expenses with your friends.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
