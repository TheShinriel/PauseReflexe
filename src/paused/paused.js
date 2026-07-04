import { getRandomPauseSuccessMessage } from '../shared/copy.js';
import { debug } from '../shared/debug.js';

const domainEl = document.querySelector('#domain');
const pauseSuccessMessageEl = document.querySelector('#pauseSuccessMessage');
const params = new URLSearchParams(window.location.search);
const domain = params.get('domain');

domainEl.textContent = domain || 'ce site';
pauseSuccessMessageEl.textContent = getRandomPauseSuccessMessage();
debug('paused-page:init', { domain, message: pauseSuccessMessageEl.textContent });
