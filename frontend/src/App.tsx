import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import PublicForm from "./pages/PublicForm"
import CRMLayout from "./layouts/CRMLayout"
import Dashboard from "./pages/crm/Dashboard"
import AppealsList from "./pages/crm/AppealsList"
import AppealDetail from "./pages/crm/AppealDetail"
import Monitoring from "./pages/crm/Monitoring"
import AdminPanel from "./pages/crm/AdminPanel"
import Heatmap from "./pages/crm/Heatmap"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicForm />} />
        
        <Route path="/crm" element={<CRMLayout />}>
          <Route index element={<Navigate to="/crm/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appeals" element={<AppealsList />} />
          <Route path="appeals/:id" element={<AppealDetail />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="heatmap" element={<Heatmap />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Routes>
    </Router>
  )
}
