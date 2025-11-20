import SignupForm from "./components/SignupForm";
import "./App.css";

function App() {
  const secret = import.meta.env.VITE_MYSECRITVARIABLE;

  return (
    <>
      <div>
        <p>{secret}</p>
        <h1>DevOps Demo</h1>
        <h2>
          {" "}
          Ni ska sätta upp CI/CD för. Pipen ska köra tester och bygga projektet
          innan deploy.
        </h2>
        <SignupForm />
      </div>
    </>
  );
}

export default App;
