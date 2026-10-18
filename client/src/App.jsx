import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CreateGroupPage from './pages/CreateGroupPage.jsx';
import GroupDetailsPage from './pages/GroupDetailsPage.jsx';
import EditGroupPage from './pages/EditGroupPage.jsx';
import AddExpensePage from './pages/AddExpensePage.jsx';
import EditExpensePage from './pages/EditExpensePage.jsx';
import ExpenseDetailsPage from './pages/ExpenseDetailsPage.jsx';
import SettlementPlanPage from './pages/SettlementPlanPage.jsx';
import SettlementHistoryPage from './pages/SettlementHistoryPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/groups/new" element={<CreateGroupPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
          <Route path="/groups/:groupId/edit" element={<EditGroupPage />} />
          <Route path="/groups/:groupId/expenses/new" element={<AddExpensePage />} />
          <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<EditExpensePage />} />
          <Route path="/expenses/:expenseId" element={<ExpenseDetailsPage />} />
          <Route path="/expenses/:expenseId/edit" element={<EditExpensePage />} />
          <Route path="/groups/:groupId/settlement-plan" element={<SettlementPlanPage />} />
          <Route path="/groups/:groupId/settlements" element={<SettlementHistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}
