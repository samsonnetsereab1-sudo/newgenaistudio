/**
 * Retriever Agent
 * Performs RAG against knowledge base, SOP corpus, and external sources
 */
import Agent from './agent.base.js';

class RetrieverAgent extends Agent {
  constructor(config = {}) {
    super('Retriever', 'retriever', config);
    this.knowledgeBase = config.knowledgeBase || [];
    this.maxResults = config.maxResults || 5;
    this.similarityThreshold = config.similarityThreshold || 0.6;
  }

  /**
   * Simple keyword-based retrieval (mock RAG)
   * In production, integrate with vector DB (Pinecone, Qdrant, Weaviate)
   */
  async execute(input) {
    this.status = 'running';
    this.lastAction = 'retrieve';

    try {
      const { query, domain, maxResults = this.maxResults } = input;

      this.log('Starting retrieval', { query, domain, maxResults });

      // Mock knowledge base with domains
      const mockKB = [
        {
          id: 'doc-crispr-001',
          title: 'CRISPR Plasmid Prep Best Practices',
          domain: 'plasmid',
          content: 'Plasmid prep requires careful buffer selection and proper incubation times...',
          relevance: 0.95,
          source: 'internal-sop'
        },
        {
          id: 'doc-expr-001',
          title: 'Protein Expression in E. coli',
          domain: 'expression',
          content: 'Optimize expression by controlling induction temperature and duration...',
          relevance: 0.88,
          source: 'internal-sop'
        },
        {
          id: 'doc-lc-ms-001',
          title: 'LC-MS Sample Prep Protocol',
          domain: 'lc-ms',
          content: 'Sample prep is critical for LC-MS analysis. Use certified reagents...',
          relevance: 0.92,
          source: 'internal-sop'
        },
        {
          id: 'doc-general-001',
          title: 'Lab Safety and Compliance',
          domain: 'compliance',
          content: 'All experiments must follow biosafety level guidelines...',
          relevance: 0.85,
          source: 'policy'
        }
      ];

      // Filter by domain if specified
      let results = mockKB;
      if (domain) {
        results = results.filter((doc) => doc.domain.includes(domain) || domain.includes(doc.domain));
      }

      // Filter by relevance and limit results
      results = results.sort((a, b) => b.relevance - a.relevance).slice(0, maxResults);

      this.lastOutput = {
        query,
        domain: domain || 'general',
        resultCount: results.length,
        documents: results,
        timestamp: new Date().toISOString(),
        confidence: results.length > 0 ? results[0].relevance : 0
      };

      this.log('Retrieval completed', { resultCount: results.length, confidence: this.lastOutput.confidence });
      this.status = 'succeeded';

      return this.lastOutput;
    } catch (err) {
      this.log('Retrieval failed', { error: err.message });
      this.status = 'failed';
      throw err;
    }
  }

  /**
   * Search knowledge base by keyword
   */
  async search(keyword, domain = null) {
    const mockKB = [
      {
        id: 'doc-crispr-001',
        title: 'CRISPR Plasmid Prep Best Practices',
        domain: 'plasmid',
        content: 'Plasmid prep requires careful buffer selection...',
        tags: ['CRISPR', 'plasmid', 'prep', 'cloning']
      },
      {
        id: 'doc-expr-001',
        title: 'Protein Expression in E. coli',
        domain: 'expression',
        content: 'Optimize expression by controlling induction...',
        tags: ['protein', 'expression', 'E.coli']
      },
      {
        id: 'doc-lc-ms-001',
        title: 'LC-MS Sample Prep Protocol',
        domain: 'lc-ms',
        content: 'Sample prep is critical for LC-MS analysis...',
        tags: ['LC-MS', 'sample-prep', 'analysis']
      }
    ];

    const keywordLower = keyword.toLowerCase();
    let results = mockKB.filter(
      (doc) =>
        doc.title.toLowerCase().includes(keywordLower) ||
        doc.content.toLowerCase().includes(keywordLower) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(keywordLower))
    );

    if (domain) {
      results = results.filter((doc) => doc.domain === domain);
    }

    return results;
  }

  /**
   * Fetch document by ID
   */
  async getDocument(docId) {
    const mockDocs = {
      'doc-crispr-001': {
        id: 'doc-crispr-001',
        title: 'CRISPR Plasmid Prep',
        domain: 'plasmid',
        content: 'Detailed plasmid preparation protocol...',
        steps: 8,
        estimatedTime: 240,
        tags: ['CRISPR', 'plasmid']
      },
      'doc-expr-001': {
        id: 'doc-expr-001',
        title: 'Protein Expression',
        domain: 'expression',
        content: 'Detailed expression protocol...',
        steps: 6,
        estimatedTime: 72,
        tags: ['protein', 'expression']
      },
      'doc-lc-ms-001': {
        id: 'doc-lc-ms-001',
        title: 'LC-MS Prep',
        domain: 'lc-ms',
        content: 'Sample prep protocol for LC-MS...',
        steps: 5,
        estimatedTime: 120,
        tags: ['LC-MS', 'prep']
      }
    };

    return mockDocs[docId] || null;
  }
}

export default RetrieverAgent;
