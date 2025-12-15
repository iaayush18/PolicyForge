/**
 * src/pages/PHQ9Assessment.jsx
 * PHQ-9 Mental Health Assessment Form
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assessmentAPI, studentAPI } from '../services/api';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PHQ9_QUESTIONS = [
  {
    key: 'q1_interest',
    text: 'Little interest or pleasure in doing things',
  },
  {
    key: 'q2_depressed',
    text: 'Feeling down, depressed, or hopeless',
  },
  {
    key: 'q3_sleep',
    text: 'Trouble falling or staying asleep, or sleeping too much',
  },
  {
    key: 'q4_energy',
    text: 'Feeling tired or having little energy',
  },
  {
    key: 'q5_appetite',
    text: 'Poor appetite or overeating',
  },
  {
    key: 'q6_failure',
    text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  },
  {
    key: 'q7_concentration',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
  },
  {
    key: 'q8_movement',
    text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  },
  {
    key: 'q9_suicidal',
    text: 'Thoughts that you would be better off dead, or of hurting yourself',
  },
];

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

const PHQ9Assessment = () => {
  const navigate = useNavigate();
  const { updateStudentProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState({
    q1_interest: null,
    q2_depressed: null,
    q3_sleep: null,
    q4_energy: null,
    q5_appetite: null,
    q6_failure: null,
    q7_concentration: null,
    q8_movement: null,
    q9_suicidal: null,
  });
  const [notes, setNotes] = useState('');

  const handleAnswerChange = (questionKey, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
  };

  const isFormComplete = () => {
    return Object.values(answers).every((val) => val !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormComplete()) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const response = await assessmentAPI.submit({
        phq9Answers: answers,
        notes: notes.trim() || undefined,
      });

      // Update student profile in context
      const studentResponse = await studentAPI.getMyProfile();
      updateStudentProfile(studentResponse.student);

      toast.success('Assessment submitted successfully!');
      
      // Show result preview
      const { riskScore, riskLevel } = response.assessment;
      toast.success(`Your Risk Score: ${riskScore} - ${riskLevel}`, { duration: 5000 });
      
      navigate('/student');
    } catch (error) {
      const message = error.response?.data?.message || 'Error submitting assessment';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalScore = calculateTotalScore();
  const progress = (Object.values(answers).filter((v) => v !== null).length / 9) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 hover:bg-indigo-700 px-3 py-2 rounded-lg transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold">PHQ-9 Mental Health Assessment</h1>
            <p className="text-sm text-indigo-200">Patient Health Questionnaire</p>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Assessment Progress</h3>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {isFormComplete() && (
            <p className="mt-2 text-sm text-green-600 font-medium">
              ✓ All questions answered. Current total: {totalScore}/27
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
              <p className="text-sm text-blue-800 mb-2">
                Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the following problems?
              </p>
              <p className="text-sm text-blue-800">
                Please answer all questions honestly. Your responses are confidential and will help assess your mental well-being.
              </p>
            </div>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          <div className="space-y-8">
            {PHQ9_QUESTIONS.map((question, index) => (
              <div key={question.key} className="border-b border-gray-200 pb-6 last:border-b-0">
                <p className="font-semibold text-gray-800 mb-4 text-lg">
                  {index + 1}. {question.text}
                </p>
                <div className="space-y-2">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer transition ${
                        answers[question.key] === option.value
                          ? 'bg-indigo-50 border-2 border-indigo-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={option.value}
                        checked={answers[question.key] === option.value}
                        onChange={() => handleAnswerChange(question.key, option.value)}
                        className="w-5 h-5 text-indigo-600"
                        required
                      />
                      <span className="flex-1 font-medium">
                        {option.label} 
                        <span className="text-gray-500 ml-2">({option.value} point{option.value !== 1 ? 's' : ''})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Optional Notes */}
          <div className="mt-8 pt-6 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="4"
              placeholder="Any additional information you'd like to share..."
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">{notes.length}/500 characters</p>
          </div>

          {/* Score Summary */}
          <div className="mt-6 bg-indigo-50 rounded-lg p-6">
            <p className="text-sm text-indigo-800 mb-2">
              <strong>Current Total Score:</strong> {totalScore} / 27
            </p>
            <p className="text-xs text-indigo-700">
              Your risk level will be automatically calculated based on your total score. 
              Scores are mapped as follows: 0-4 (Minimal), 5-9 (Mild), 10-14 (Moderate), 15-27 (Severe).
            </p>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormComplete()}
              className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Assessment
                </>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <p className="mt-6 text-center text-sm text-gray-500">
            🔒 Your responses are confidential and will be used to assess your mental health needs.
            Results are shared with authorized counseling staff only.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PHQ9Assessment;