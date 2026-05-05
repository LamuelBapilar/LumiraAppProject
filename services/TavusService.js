// Tavus.io API Service for Video Therapy
// Uses Supabase Edge Function proxy to avoid CORS issues

import { getSupabaseClient } from '@/utils/supabaseWellness';

// Edge Function URL - fetched dynamically from Supabase config
let PROXY_URL = null;

const getProxyUrl = async () => {
  if (PROXY_URL) return PROXY_URL;
  
  // Get Supabase URL from environment or config
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  if (supabaseUrl) {
    PROXY_URL = `${supabaseUrl}/functions/v1/tavus-proxy`;
  } else {
    // Fallback: try to get from Supabase client
    try {
      const client = await getSupabaseClient();
      // Extract URL from client (it's stored internally)
      const url = client.supabaseUrl || 'https://svmiesxzxshywukikqkt.supabase.co';
      PROXY_URL = `${url}/functions/v1/tavus-proxy`;
    } catch (e) {
      // Hardcoded fallback
      PROXY_URL = 'https://svmiesxzxshywukikqkt.supabase.co/functions/v1/tavus-proxy';
    }
  }
  
  console.log('TavusService: Using proxy URL:', PROXY_URL);
  return PROXY_URL;
};

class TavusService {
  constructor() {
    this.proxyUrl = null;
  }

  async getProxyUrl() {
    if (!this.proxyUrl) {
      this.proxyUrl = await getProxyUrl();
    }
    return this.proxyUrl;
  }

  // Create a new conversation via Edge Function proxy
  async createConversation() {
    try {
      const proxyUrl = await this.getProxyUrl();
      console.log('TavusService: Creating conversation via proxy:', proxyUrl);

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create' })
      });

      console.log('TavusService: Proxy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('TavusService: Proxy error:', errorData);
        throw new Error(errorData.error || `Proxy error: ${response.status}`);
      }

      const data = await response.json();
      console.log('TavusService: Conversation created:', data);
      return data;
    } catch (error) {
      console.error('TavusService: Error creating conversation:', error);
      throw error;
    }
  }

  // Get conversation details via Edge Function proxy
  async getConversation(conversationId) {
    try {
      const proxyUrl = await this.getProxyUrl();
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get', conversationId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Proxy error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TavusService: Error getting conversation:', error);
      throw error;
    }
  }

  // End a conversation via Edge Function proxy
  async endConversation(conversationId) {
    try {
      const proxyUrl = await this.getProxyUrl();
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'end', conversationId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Proxy error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('TavusService: Error ending conversation:', error);
      throw error;
    }
  }

  // Delete a conversation via Edge Function proxy
  async deleteConversation(conversationId) {
    try {
      const proxyUrl = await this.getProxyUrl();
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete', conversationId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Proxy error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('TavusService: Error deleting conversation:', error);
      throw error;
    }
  }

  // Get conversation URL for video call
  async getConversationUrl(conversationId) {
    try {
      const conversation = await this.getConversation(conversationId);
      
      // The conversation URL should be available in the response
      if (conversation.conversation_url) {
        return conversation.conversation_url;
      }

      throw new Error('Conversation URL not found in response');
    } catch (error) {
      console.error('TavusService: Error getting conversation URL:', error);
      throw error;
    }
  }

  // Validate API connection
  async validateConnection() {
    try {
      const proxyUrl = await this.getProxyUrl();
      console.log('TavusService: Validating connection to proxy...');
      
      // Test by making a GET request to the proxy (health check)
      const response = await fetch(proxyUrl, {
        method: 'GET',
      });

      console.log('TavusService: Validation response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('TavusService: Proxy health check:', data);
        return data.configured === true;
      }
      
      return false;
    } catch (error) {
      console.error('TavusService: Connection validation failed:', error);
      return false;
    }
  }
}

export default new TavusService();