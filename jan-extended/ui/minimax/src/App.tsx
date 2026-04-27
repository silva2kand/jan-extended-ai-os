import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './components/dashboard/Dashboard';
import PDFDocxProcessor from './components/pdf-docx/PDFDocxProcessor';
import Researcher from './components/researcher/Researcher';
import ReportWriter from './components/report-writer/ReportWriter';
import SlideMaker from './components/slide-maker/SlideMaker';
import ComputerExpert from './components/computer-expert/ComputerExpert';
import Settings from './components/settings/Settings';
import { useAppStore } from './stores';

import ModelHub from './components/model-hub/ModelHub';
import PluginManager from './components/plugins/PluginManager';

function App() {
  const { isLoading } = useAppStore();

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pdf-docx" element={<PDFDocxProcessor />} />
          <Route path="/researcher" element={<Researcher />} />
          <Route path="/report-writer" element={<ReportWriter />} />
          <Route path="/slide-maker" element={<SlideMaker />} />
          <Route path="/computer-expert" element={<ComputerExpert />} />
          <Route path="/model-hub" element={<ModelHub />} />
          <Route path="/plugins" element={<PluginManager />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}

export default App;
