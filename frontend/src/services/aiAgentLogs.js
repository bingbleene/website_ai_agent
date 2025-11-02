// AI Agent Logs Service
// This service manages logs from AI agents used in article creation

// Mock AI Agent Logs Database
const aiAgentLogsDB = {
  '1': [
    {
      id: 1,
      agentName: 'Content Generator Agent',
      agentType: 'generator',
      timestamp: '2025-10-25T10:15:30Z',
      status: 'completed',
      duration: '2.3s',
      logs: [
        { time: '10:15:30', message: 'Starting content generation for topic: GPT-5 Release' },
        { time: '10:15:31', message: 'Analyzing topic and generating outline...' },
        { time: '10:15:31', message: 'Generated 5 section headings' },
        { time: '10:15:32', message: 'Writing introduction paragraph...' },
        { time: '10:15:32', message: 'Writing section: Key Features and Improvements' },
        { time: '10:15:32', message: 'Writing section: Performance Benchmarks' },
        { time: '10:15:33', message: 'Content generation completed successfully' }
      ],
      output: {
        wordCount: 1250,
        sections: 5,
        readingTime: '8 min'
      }
    },
    {
      id: 2,
      agentName: 'Source Finder Agent',
      agentType: 'research',
      timestamp: '2025-10-25T10:16:00Z',
      status: 'completed',
      duration: '4.7s',
      logs: [
        { time: '10:16:00', message: 'Initializing web search for credible sources...' },
        { time: '10:16:01', message: 'Searching academic databases...' },
        { time: '10:16:02', message: 'Found 15 relevant research papers' },
        { time: '10:16:02', message: 'Searching tech news sources...' },
        { time: '10:16:03', message: 'Found 8 recent articles from TechCrunch, VentureBeat' },
        { time: '10:16:03', message: 'Verifying source credibility...' },
        { time: '10:16:04', message: 'Filtered to 12 high-quality sources' },
        { time: '10:16:05', message: 'Source research completed' }
      ],
      output: {
        sourcesFound: 23,
        sourcesVerified: 12,
        credibilityScore: 9.2,
        topSources: [
          'OpenAI Official Blog',
          'Nature AI Journal',
          'TechCrunch',
          'MIT Technology Review'
        ]
      }
    },
    {
      id: 3,
      agentName: 'Fact Checker Agent',
      agentType: 'verification',
      timestamp: '2025-10-25T10:17:00Z',
      status: 'completed',
      duration: '3.1s',
      logs: [
        { time: '10:17:00', message: 'Starting fact verification process...' },
        { time: '10:17:01', message: 'Checking 45 factual claims in content' },
        { time: '10:17:01', message: 'Cross-referencing with verified sources...' },
        { time: '10:17:02', message: 'Verified 43 claims as accurate' },
        { time: '10:17:02', message: 'Found 2 claims requiring clarification' },
        { time: '10:17:03', message: 'Updated content with corrections' },
        { time: '10:17:03', message: 'Fact checking completed - Accuracy: 95.6%' }
      ],
      output: {
        claimsChecked: 45,
        claimsVerified: 43,
        accuracyScore: 95.6
      }
    },
    {
      id: 4,
      agentName: 'SEO Optimizer Agent',
      agentType: 'optimization',
      timestamp: '2025-10-25T10:18:00Z',
      status: 'completed',
      duration: '1.8s',
      logs: [
        { time: '10:18:00', message: 'Analyzing content for SEO optimization...' },
        { time: '10:18:00', message: 'Keyword density analysis completed' },
        { time: '10:18:01', message: 'Generated meta description' },
        { time: '10:18:01', message: 'Optimized heading structure for H1-H3 tags' },
        { time: '10:18:02', message: 'Added internal linking suggestions' },
        { time: '10:18:02', message: 'SEO score: 92/100' }
      ],
      output: {
        seoScore: 92,
        keywords: ['GPT-5', 'AI', 'Language Models', 'OpenAI'],
        readabilityScore: 88
      }
    },
    {
      id: 5,
      agentName: 'Image Generator Agent',
      agentType: 'media',
      timestamp: '2025-10-25T10:19:00Z',
      status: 'completed',
      duration: '5.2s',
      logs: [
        { time: '10:19:00', message: 'Analyzing content for image suggestions...' },
        { time: '10:19:01', message: 'Identified 3 key sections needing visuals' },
        { time: '10:19:02', message: 'Searching stock image databases...' },
        { time: '10:19:03', message: 'Found 15 relevant images' },
        { time: '10:19:04', message: 'Selected 3 high-quality images' },
        { time: '10:19:05', message: 'Images inserted at optimal positions' }
      ],
      output: {
        imagesFound: 15,
        imagesSelected: 3,
        placementScore: 9.5
      }
    }
  ],
  '2': [
    {
      id: 1,
      agentName: 'Content Generator Agent',
      agentType: 'generator',
      timestamp: '2025-10-24T14:20:15Z',
      status: 'completed',
      duration: '3.1s',
      logs: [
        { time: '14:20:15', message: 'Starting content generation for topic: Quantum Computing AI Training' },
        { time: '14:20:16', message: 'Analyzing technical requirements...' },
        { time: '14:20:17', message: 'Generated outline with 4 main sections' },
        { time: '14:20:18', message: 'Writing technical content...' },
        { time: '14:20:18', message: 'Content generation completed' }
      ],
      output: {
        wordCount: 980,
        sections: 4,
        readingTime: '6 min'
      }
    },
    {
      id: 2,
      agentName: 'Source Finder Agent',
      agentType: 'research',
      timestamp: '2025-10-24T14:21:00Z',
      status: 'completed',
      duration: '6.2s',
      logs: [
        { time: '14:21:00', message: 'Searching quantum computing research databases...' },
        { time: '14:21:02', message: 'Found 28 relevant quantum ML papers' },
        { time: '14:21:04', message: 'Verifying experimental results...' },
        { time: '14:21:06', message: 'Selected 8 peer-reviewed sources' }
      ],
      output: {
        sourcesFound: 28,
        sourcesVerified: 8,
        credibilityScore: 9.8
      }
    },
    {
      id: 3,
      agentName: 'Technical Reviewer Agent',
      agentType: 'verification',
      timestamp: '2025-10-24T14:22:00Z',
      status: 'completed',
      duration: '2.8s',
      logs: [
        { time: '14:22:00', message: 'Reviewing technical accuracy...' },
        { time: '14:22:01', message: 'Checking quantum computing terminology' },
        { time: '14:22:02', message: 'Verifying mathematical claims' },
        { time: '14:22:03', message: 'Technical review passed' }
      ],
      output: {
        technicalAccuracy: 98.2,
        termsVerified: 23,
        formulasChecked: 5
      }
    }
  ]
};

/**
 * Get AI agent logs for a specific article
 * @param {string|number} articleId - The article ID
 * @returns {Array} Array of AI agent logs
 */
export const getAIAgentLogs = (articleId) => {
  const logs = aiAgentLogsDB[articleId.toString()];
  return logs || [];
};

/**
 * Get summary statistics from AI logs
 * @param {string|number} articleId - The article ID
 * @returns {Object} Summary statistics
 */
export const getAILogsSummary = (articleId) => {
  const logs = getAIAgentLogs(articleId);
  
  if (logs.length === 0) {
    return {
      totalAgents: 0,
      totalTime: 0,
      successRate: 0,
      qualityScore: 0
    };
  }

  const totalTime = logs.reduce((sum, log) => {
    const seconds = parseFloat(log.duration);
    return sum + seconds;
  }, 0);

  const completedCount = logs.filter(log => log.status === 'completed').length;
  const successRate = (completedCount / logs.length) * 100;

  // Calculate quality score from various metrics
  const qualityScores = logs.map(log => {
    if (log.agentType === 'research' && log.output.credibilityScore) {
      return log.output.credibilityScore;
    }
    if (log.agentType === 'verification' && log.output.accuracyScore) {
      return log.output.accuracyScore / 10;
    }
    if (log.agentType === 'optimization' && log.output.seoScore) {
      return log.output.seoScore / 10;
    }
    if (log.agentType === 'media' && log.output.placementScore) {
      return log.output.placementScore;
    }
    return 8.5; // Default score
  });

  const avgQualityScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;

  return {
    totalAgents: logs.length,
    totalTime: totalTime.toFixed(1),
    successRate: successRate.toFixed(0),
    qualityScore: avgQualityScore.toFixed(1)
  };
};

/**
 * Add new AI agent log (for future use when creating articles)
 * @param {string|number} articleId - The article ID
 * @param {Object} logData - The log data to add
 */
export const addAIAgentLog = (articleId, logData) => {
  const id = articleId.toString();
  if (!aiAgentLogsDB[id]) {
    aiAgentLogsDB[id] = [];
  }
  
  const newLog = {
    id: aiAgentLogsDB[id].length + 1,
    timestamp: new Date().toISOString(),
    status: 'in-progress',
    ...logData
  };
  
  aiAgentLogsDB[id].push(newLog);
  return newLog;
};

/**
 * Update AI agent log status
 * @param {string|number} articleId - The article ID
 * @param {number} logId - The log ID
 * @param {string} status - New status
 */
export const updateAIAgentLogStatus = (articleId, logId, status) => {
  const logs = aiAgentLogsDB[articleId.toString()];
  if (logs) {
    const log = logs.find(l => l.id === logId);
    if (log) {
      log.status = status;
    }
  }
};

/**
 * Get all articles with AI logs
 * @returns {Array} Array of article IDs that have AI logs
 */
export const getArticlesWithAILogs = () => {
  return Object.keys(aiAgentLogsDB);
};

export default {
  getAIAgentLogs,
  getAILogsSummary,
  addAIAgentLog,
  updateAIAgentLogStatus,
  getArticlesWithAILogs
};
