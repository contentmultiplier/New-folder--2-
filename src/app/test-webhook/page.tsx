'use client';

import { useState } from 'react';

export default function WebhookTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Sample checkout.session.completed event data
  const sampleEvent = {
    id: "evt_test_webhook",
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: "cs_test_sample",
        object: "checkout.session",
        mode: "subscription",
        status: "complete",
        payment_status: "paid",
        subscription: "sub_test_sample",
        customer: "cus_test_sample",
        metadata: {
          tier: "business",
          userId: "8c9a717e-c0bf-4f3d-b873-7567b3484c95"
        }
      }
    },
    livemode: false,
    type: "checkout.session.completed"
  };

  const testWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: sampleEvent,
          skipSignatureCheck: true
        }),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testRealWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Test the actual webhook endpoint without signature verification
      const response = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-mode': 'true' // We'll check for this header to skip signature verification
        },
        body: JSON.stringify(sampleEvent),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Webhook Test Tool</h1>
        
        {/* Test Buttons */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Test Options</h2>
          <div className="flex gap-4">
            <button
              onClick={testWebhook}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? 'Testing...' : 'Test Dedicated Endpoint'}
            </button>
            <button
              onClick={testRealWebhook}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {loading ? 'Testing...' : 'Test Real Webhook (Skip Signature)'}
            </button>
          </div>
          <p className="text-slate-300 text-sm mt-2">
            These tests simulate a checkout.session.completed event with your user ID
          </p>
        </div>

        {/* Sample Event Data */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Sample Event Data</h2>
          <pre className="text-green-400 text-sm overflow-auto bg-black/30 p-4 rounded-lg">
            {JSON.stringify(sampleEvent, null, 2)}
          </pre>
        </div>

        {/* Results */}
        {result && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Test Results {result.success ? '✅' : '❌'}
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-cyan-400 font-semibold">Status:</span>
                <span className={`ml-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.status || 'Error'} - {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
              <div>
                <span className="text-cyan-400 font-semibold">Timestamp:</span>
                <span className="text-white ml-2">{result.timestamp}</span>
              </div>
              <div>
                <span className="text-cyan-400 font-semibold">Response:</span>
                <pre className="text-white text-sm mt-2 bg-black/30 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <a 
            href="/test-session" 
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            Test Session
          </a>
          <a 
            href="/dashboard" 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Dashboard
          </a>
          <a 
            href="/pricing" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Pricing
          </a>
        </div>
      </div>
    </div>
  );
}