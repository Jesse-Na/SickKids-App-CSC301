import Header from "./components/Header";
import AllDevicesPage from "./features/pages/AllDevicesPage";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Fragment, useEffect } from "react";
import Admins from "./features/pages/Admins";
import SelectedDevicePage from "./features/pages/SelectedDevicePage";
import AllPatients from "./features/pages/AllPatients";
import PatientPage from "./features/pages/PatientPage";

const Redirect = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return <Fragment />;
};

function App() {

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" Component={AllDevicesPage} />
        <Route path="/admins" Component={Admins} />
        <Route path="/device/:id" Component={SelectedDevicePage} />
        <Route path="/patients" Component={AllPatients} />
        <Route path="/patient/:id" Component={PatientPage} />
        <Route path="*" element={<Redirect to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
