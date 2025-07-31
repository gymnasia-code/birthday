'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function DebugPage() {
  const [notionTest, setNotionTest] = useState<any>(null)
  const [posterTest, setPosterTest] = useState<any>(null)
  const [envTest, setEnvTest] = useState<any>(null)
  const [birthdaysTest, setBirthdaysTest] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)

  // Use a placeholder ID - we'll get real IDs from the birthday list
  const [selectedBirthdayId, setSelectedBirthdayId] = useState('123')

  const testParams = new URLSearchParams({
    birthdayId: selectedBirthdayId,
    guests: '5',
    location: 'Gymnasia Lisi',
  })

  const testUrl = `/party-menu?${testParams.toString()}`

  const testAPI = async (endpoint: string, setter: (data: any) => void) => {
    setLoading(endpoint)
    try {
      const response = await fetch(`/api/test/${endpoint}`)
      const data = await response.json()
      setter(data)
    } catch (error) {
      setter({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Debug Party Menu System
        </h1>

        {/* Status Check */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-yellow-200">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            System Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>
                Birthday validation: ✅ Working (ID 1311 found successfully)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>
                Menu loading: ❌ Missing POSTER_TOKEN_CAFE environment variable
              </span>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Action Required:</strong> Restart your development
                server to load new environment variables:
                <br />
                <code className="bg-yellow-100 px-1 rounded">
                  Ctrl+C
                </code> then{' '}
                <code className="bg-yellow-100 px-1 rounded">pnpm dev</code>
              </p>
            </div>
          </div>
        </div>

        {/* Party Menu Test */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Party Menu Test
          </h2>
          <p className="mb-4 text-gray-700">
            Test the party menu with the selected birthday ID:
          </p>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 text-sm">
              <strong>Current Test Parameters:</strong>
              <br />
              Birthday ID:{' '}
              <code className="bg-blue-100 px-1 rounded">
                {selectedBirthdayId}
              </code>
              <br />
              Guests: <code className="bg-blue-100 px-1 rounded">5</code>
              <br />
              Location:{' '}
              <code className="bg-blue-100 px-1 rounded">Gymnasia Lisi</code>
            </p>
          </div>
          <Link
            href={testUrl}
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Party Menu
          </Link>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <strong className="text-gray-900">Test URL:</strong>
            <br />
            <code className="break-all text-gray-800">{testUrl}</code>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <strong className="text-gray-900">Parameters:</strong>
            <ul className="list-disc list-inside mt-2">
              <li>birthdayId: 123</li>
              <li>guests: 5</li>
              <li>location: Gymnasia Lisi</li>
            </ul>
          </div>
        </div>

        {/* API Tests */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Birthday Records Test */}
          <div className="p-6 bg-white rounded-lg shadow-lg md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              List Birthday Records
            </h2>
            <button
              onClick={() => testAPI('birthdays', setBirthdaysTest)}
              disabled={loading === 'birthdays'}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 mb-4"
            >
              {loading === 'birthdays' ? 'Loading...' : 'Get Birthday Records'}
            </button>

            {birthdaysTest && birthdaysTest.success && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Select Birthday ID for testing:
                </label>
                <select
                  value={selectedBirthdayId}
                  onChange={e => setSelectedBirthdayId(e.target.value)}
                  className="w-full p-2 border rounded text-gray-800"
                >
                  <option value="123">123 (Test - doesn't exist)</option>
                  {birthdaysTest.birthdayRecords?.map((record: any) => (
                    <option key={record.uniqueId} value={record.uniqueId}>
                      {record.uniqueId} - {record.name || 'Unnamed'} (
                      {record.location})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  Select a real birthday ID from your Notion database to test
                  the party menu with valid data.
                </p>
              </div>
            )}

            {birthdaysTest && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre className="whitespace-pre-wrap overflow-auto text-gray-800">
                  {JSON.stringify(birthdaysTest, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Environment Test */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Environment Test
            </h2>
            <button
              onClick={() => testAPI('env', setEnvTest)}
              disabled={loading === 'env'}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading === 'env' ? 'Testing...' : 'Check Environment Variables'}
            </button>

            {envTest && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre className="whitespace-pre-wrap overflow-auto text-gray-800">
                  {JSON.stringify(envTest, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Notion API Test */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Notion API Test
            </h2>
            <button
              onClick={() => testAPI('notion', setNotionTest)}
              disabled={loading === 'notion'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading === 'notion' ? 'Testing...' : 'Test Notion Connection'}
            </button>

            {notionTest && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre className="whitespace-pre-wrap overflow-auto text-gray-800">
                  {JSON.stringify(notionTest, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Poster API Test */}
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Poster API Test
            </h2>
            <button
              onClick={() => testAPI('poster', setPosterTest)}
              disabled={loading === 'poster'}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loading === 'poster' ? 'Testing...' : 'Test Poster Connection'}
            </button>

            {posterTest && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <pre className="whitespace-pre-wrap overflow-auto text-gray-800">
                  {JSON.stringify(posterTest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Environment Variables Info */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Environment Variables
          </h2>
          <p className="text-gray-700 mb-4">
            Make sure these environment variables are set in your{' '}
            <code className="bg-gray-200 px-1 rounded text-gray-800">
              .env.local
            </code>{' '}
            file:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
            <li>
              <code className="bg-gray-200 px-1 rounded text-gray-800">
                NOTION_SECRET
              </code>{' '}
              - Your Notion integration secret
            </li>
            <li>
              <code className="bg-gray-200 px-1 rounded text-gray-800">
                NOTION_DATABASE_ID
              </code>{' '}
              - Your Notion database ID (defaults to your provided ID)
            </li>
            <li>
              <code className="bg-gray-200 px-1 rounded text-gray-800">
                POSTER_TOKEN
              </code>{' '}
              - Your Poster API token
            </li>
            <li>
              <code className="bg-gray-200 px-1 rounded text-gray-800">
                POSTER_API_URL
              </code>{' '}
              - Poster API URL (defaults to https://api.joinposter.com/v3)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
