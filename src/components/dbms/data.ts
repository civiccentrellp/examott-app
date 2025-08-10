// Subjects
export const subjects = ['Polity', 'Geography', 'History']

// Chapters mapped by subject
export const chaptersMap: Record<string, string[]> = {
  Polity: ['Constitutional Framework', 'Judiciary'],
  Geography: ['Physical Geography', 'Indian Geography'],
  History: ['Ancient India', 'Modern India'],
}

// Topics mapped by chapter
export const topicsMap: Record<string, string[]> = {
  'Constitutional Framework': ['Preamble', 'Fundamental Rights'],
  Judiciary: ['Supreme Court', 'High Courts'],
  'Physical Geography': ['Mountains', 'Rivers'],
  'Indian Geography': ['States', 'Climate'],
  'Ancient India': ['Harappan Civilization', 'Vedic Age'],
  'Modern India': ['Freedom Struggle', 'Gandhian Era'],
}

// Subtopics mapped by topic
export const subTopicsMap: Record<string, string[]> = {
  Preamble: ['Meaning of Preamble', 'Key Words'],
  'Fundamental Rights': ['Right to Equality', 'Right to Freedom'],
  'Supreme Court': ['Jurisdiction', 'Judges Appointment'],
  'High Courts': ['Structure', 'Powers'],
  Mountains: ['Himalayas', 'Western Ghats'],
  Rivers: ['Ganga', 'Godavari'],
  States: ['North India', 'South India'],
  Climate: ['Monsoon', 'Seasons'],
  'Harappan Civilization': ['Urban Planning', 'Trade'],
  'Vedic Age': ['Early Vedic', 'Later Vedic'],
  'Freedom Struggle': ['1857 Revolt', 'Indian National Congress'],
  'Gandhian Era': ['Non-Cooperation', 'Civil Disobedience'],
}

// Questions mapped by subtopic
export const questionsMap: Record<string, { id: number; question: string; type: 'objective' | 'descriptive' }[]> = {
  'Meaning of Preamble': [
    { id: 1, question: 'What is the Preamble of the Indian Constitution?', type: 'objective' },
    { id: 2, question: 'Explain the significance of the Preamble.', type: 'descriptive' },
  ],
  'Right to Equality': [
    { id: 3, question: 'Which articles deal with Right to Equality?', type: 'objective' },
    { id: 4, question: 'Discuss the importance of equality in a democratic society.', type: 'descriptive' },
  ],
  Himalayas: [
    { id: 5, question: 'Which is the highest peak in the Himalayas?', type: 'objective' },
    { id: 6, question: 'Explain the role of Himalayas in Indian climate.', type: 'descriptive' },
  ],
  'Urban Planning': [
    { id: 7, question: 'What kind of urban planning was seen in Harappan Civilization?', type: 'descriptive' },
  ],
  '1857 Revolt': [
    { id: 8, question: 'Who led the 1857 revolt in Kanpur?', type: 'objective' },
    { id: 9, question: 'Analyze the causes of the 1857 Revolt.', type: 'descriptive' },
  ],
}

// Flat list of all questions (used for search fallback)
export const allQuestions = Object.values(questionsMap).flat()
