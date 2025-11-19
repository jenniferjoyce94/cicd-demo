import { useState } from 'react'
import SignupForm from './components/SignupForm'
import './App.css'
import { parseICS } from './helpers/ICSparser'

function App() {
  const [count, setCount] = useState(0)

  const handleClick = async () => {
    const events = await parseICS("https://horaro.org/vikingtv/test.ical");
    console.log(events);
  }


  return (
    <>
       <div>
      <h1>DevOps Demo</h1>
      <h2> Ni ska sätta upp CI/CD för.
        Pipen ska köra tester och bygga projektet innan deploy.</h2>
      <SignupForm />
      <button onClick={handleClick}>Hämta data</button>
    </div>
    </>
  )
}

export default App
