import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import BasicLayout from './layouts/BasicLayout';
import AssetCategory from './pages/asset/category';
import AssetLedger from './pages/asset/ledger';
import PendingTasks from './pages/workflow/tasks';
import MyRequests from './pages/workflow/request';
import WorkflowDefinition from './pages/workflow/definition';
import WorkflowConfig from './pages/workflow/config';
import { useUserStore } from './store/userStore';

function App() {
  const token = useUserStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            token ? (
              <BasicLayout>
                <Routes>
                  <Route path="/" element={<div>首页 - 欢迎使用 EAM</div>} />
                  <Route path="/asset/category" element={<AssetCategory />} />
                  <Route path="/asset/ledger" element={<AssetLedger />} />
                  <Route path="/workflow/tasks" element={<PendingTasks />} />
                  <Route path="/workflow/request" element={<MyRequests />} />
                  <Route path="/workflow/definition" element={<WorkflowDefinition />} />
                  <Route path="/workflow/config" element={<WorkflowConfig />} />
                  <Route path="/system/user" element={<div>用户管理 (建设中)</div>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BasicLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
