/**
 * config.js — client-side configuration
 * ----------------------------------------------------------------------------
 * Single source of truth for the API address. If the Express server is moved
 * to another machine or port, only this file needs to change.
 */
const LOCAL_API_BASE = 'http://localhost:3000';
const DEPLOYED_API_BASE = ''; // Set this when the API has a separate public origin.
const IS_LOCAL_HOST = window.location.protocol === 'file:'
    || ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = (IS_LOCAL_HOST ? LOCAL_API_BASE : (DEPLOYED_API_BASE || window.location.origin))
    .replace(/\/+$/, '');
