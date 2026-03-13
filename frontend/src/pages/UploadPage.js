import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice', icon: '◉', desc: 'A, B, C, D options' },
  { value: 'true_false', label: 'True / False', icon: '⊕', desc: 'Binary judgment' },
  { value: 'fill_blank', label: 'Fill in Blank', icon: '▭', desc: 'Complete the sentence' },
  { value: 'short_answer', label: 'Short Answer', icon: '≡', desc: '1-3 sentence response' },
  { value: 'long_answer', label: 'Long Answer', icon: '❑', desc: 'Essay response' },
];

const EDUCATION_LEVELS = ['school', 'college', 'undergraduate', 'graduate', 'research'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'analytical', 'creative', 'iq_based'];

const t = {
  bg: '#0e0e18', nav: '#0a0a0f', border: 'rgba(196,164,96,0.15)',
  text: '#e8e4dc', textMuted: 'rgba(232,228,220,0.4)', accent: '#c4a460',
  cardBg: 'rgba(255,255,255,0.02)', input: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(196,164,96,0.2)',
};

export defau
