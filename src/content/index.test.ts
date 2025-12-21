import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageType } from '../types';
import { setupMessageListener } from './index';

// Mock chrome API
const chromeMock = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
    },
  },
};
vi.stubGlobal('chrome', chromeMock);

describe('Content Script Entry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMessageListener();
  });

  it('should register a message listener', () => {
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
  });

  it('should detect tables when requested', async () => {
    const addListenerMock = chrome.runtime.onMessage.addListener as any;
    const callback = addListenerMock.mock.calls[0][0];
    const sendResponse = vi.fn();

    document.body.innerHTML = '<table><tr><td>Data</td></tr></table>';
    
    callback({ type: MessageType.DETECT_TABLES }, {}, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({
      tables: expect.arrayContaining([
        expect.objectContaining({ hasHeader: false })
      ])
    }));
  });
});