import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';

// Resume Analyzer subcomponents
import ResumeUploader from './components/ResumeAnalyzer/ResumeUploader';
import AnalysisResults from './components/ResumeAnalyzer/AnalysisResults';
import JobMatcher from './components/ResumeAnalyzer/JobMatcher';
import BulletImprover from './components/ResumeAnalyzer/BulletImprover';
import ResumeVersionManager from './components/ResumeAnalyzer/ResumeVersionManager';

// Interview Prep subcomponents
import MockInterview from './components/InterviewPrep/MockInterview';
import QuestionBank from './components/InterviewPrep/QuestionBank';
import Flashcards from './components/InterviewPrep/Flashcards';

// Dashboard subcomponent
import ReadinessDashboard from './components/Dashboard/ReadinessDashboard';

// Profile subcomponent
import UserProfile from './components/Profile/UserProfile';

import { analyzeResume } from './utils/atsAnalyzer';
import { AuthProvider } from './context/AuthContext';
import { SAMPLE_RESUMES } from './data/sampleResumes';

function MainApp() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Resume Analyzer State
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].rawText);
  const [resumeTitle, setResumeTitle] = useState(SAMPLE_RESUMES[0].title);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const data = analyzeResume(SAMPLE_RESUMES[0].rawText);
    setAnalysisData(data);
  }, []);

  const handleRunAnalysis = (text, title) => {
    setIsAnalyzing(true);
    setResumeText(text);
    if (title) setResumeTitle(title);

    setTimeout(() => {
      const data = analyzeResume(text);
      setAnalysisData(data);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        <main className="container-custom py-8">
          
          {/* TAB 1: RESUME ANALYZER & VERSION MANAGEMENT */}
          {activeTab === 'analyzer' && (
            <div className="space-y-8">
              <ResumeUploader
                onAnalyze={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
              />

              <ResumeVersionManager />

              {analysisData && (
                <AnalysisResults
                  analysisData={analysisData}
                  resumeTitle={resumeTitle}
                />
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <JobMatcher resumeText={resumeText} />
                <BulletImprover />
              </div>
            </div>
          )}

          {/* TAB 2: AI INTERVIEW PREP */}
          {activeTab === 'interview' && (
            <div className="space-y-8">
              <MockInterview />
              <QuestionBank />
            </div>
          )}

          {/* TAB 3: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div>
              <Flashcards />
            </div>
          )}

          {/* TAB 4: CAREER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <ReadinessDashboard
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenAuth={() => setActiveTab('profile')}
              />
            </div>
          )}

          {/* TAB 5: CANDIDATE PROFILE */}
          {activeTab === 'profile' && (
            <div>
              <UserProfile />
            </div>
          )}

        </main>
      </div>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
