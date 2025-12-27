/**
 * Data Source Registry
 * Central registry for all data source connectors
 */

import { RestConnector } from './restConnector.js';
import { WebSocketConnector } from './websocketConnector.js';

/**
 * Data source connector registry
 * Maps data source types to their connector implementations
 */
export const dataSourceRegistry = {
  rest: RestConnector,
  websocket: WebSocketConnector,
  // Future connectors can be added here:
  // graphql: GraphQLConnector,
  // postgres: PostgresConnector
};

/**
 * Create a connector instance for a data source
 * @param {object} dataSource - Data source configuration
 * @returns {object} - Connector instance
 */
export function createConnector(dataSource) {
  const ConnectorClass = dataSourceRegistry[dataSource.type];
  
  if (!ConnectorClass) {
    throw new Error(`Unknown data source type: ${dataSource.type}`);
  }
  
  return new ConnectorClass(dataSource);
}

/**
 * Get all available connector types
 * @returns {string[]} - Array of connector type names
 */
export function getAvailableConnectors() {
  return Object.keys(dataSourceRegistry);
}

/**
 * Validate data source configuration
 * @param {object} dataSource - Data source to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateDataSource(dataSource) {
  const errors = [];
  
  if (!dataSource || typeof dataSource !== 'object') {
    errors.push('Data source must be an object');
    return { valid: false, errors };
  }
  
  if (!dataSource.id) {
    errors.push('Data source must have an id');
  }
  
  if (!dataSource.type) {
    errors.push('Data source must have a type');
  } else if (!dataSourceRegistry[dataSource.type]) {
    errors.push(`Unknown data source type: ${dataSource.type}`);
  }
  
  if (!dataSource.url) {
    errors.push('Data source must have a url');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
