import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { LoginButton } from "./LoginButton";
import { LogoutButton } from "./LogoutButton";
import { Profile } from "./Profile";
import { VerificationButton } from "./VerificationButton";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <div>
          <LoginButton />
        </div>
        <div>
          <LogoutButton />
        </div>
        <div>
          <Profile />
        </div>
        <div>
          <VerificationButton />
        </div>
      </div>
    </>
  );
}

export default App;
