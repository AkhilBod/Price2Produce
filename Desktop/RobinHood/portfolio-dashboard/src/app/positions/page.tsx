'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Position {
  id: string
  symbol: string
  shares: number // Now supports decimals like 10.5 shares
  costBasis: number
  purchaseDate: string
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'AAPL',
      shares: 0.025158,
      costBasis: 211.20,
      purchaseDate: '2024-12-01'
    },
    {
      id: '2',
      symbol: 'SOUN',
      shares: 3.93,
      costBasis: 12.76,
      purchaseDate: '2024-12-15'
    },
    {
      id: '3',
      symbol: 'IONQ',
      shares: 1.08,
      costBasis: 46.21,
      purchaseDate: '2024-11-20'
    },
    {
      id: '4',
      symbol: 'PLTR',
      shares: 0.6524,
      costBasis: 153.37,
      purchaseDate: '2024-11-15'
    },
    {
      id: '5',
      symbol: 'NVDA',
      shares: 0.43511,
      costBasis: 172.35,
      purchaseDate: '2024-11-10'
    }
  ])

  const [newPosition, setNewPosition] = useState({
    symbol: '',
    shares: 0,
    costBasis: 0,
    purchaseDate: ''
  })

  const [isAddingPosition, setIsAddingPosition] = useState(false)
  const [editingPosition, setEditingPosition] = useState<string | null>(null)
  const [editPosition, setEditPosition] = useState<Position | null>(null)

  const handleAddPosition = () => {
    if (newPosition.symbol && newPosition.shares > 0 && newPosition.costBasis > 0) {
      const position: Position = {
        id: Date.now().toString(),
        ...newPosition
      }
      setPositions([...positions, position])
      setNewPosition({ symbol: '', shares: 0, costBasis: 0, purchaseDate: '' })
      setIsAddingPosition(false)
    }
  }

  const handleDeletePosition = (id: string) => {
    setPositions(positions.filter(p => p.id !== id))
  }

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position.id)
    setEditPosition({ ...position })
  }

  const handleSaveEdit = () => {
    if (editPosition && editPosition.shares > 0 && editPosition.costBasis > 0) {
      setPositions(positions.map(p => p.id === editPosition.id ? editPosition : p))
      setEditingPosition(null)
      setEditPosition(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingPosition(null)
    setEditPosition(null)
  }

  return (
    <main className="min-h-screen bg-rh-dark p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Positions
          </h1>
          <p className="text-gray-400">
            Add, edit, or remove your stock positions
          </p>
        </header>

        {/* Add New Position */}
        <div className="bg-rh-card rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add New Position</h2>
            <button
              onClick={() => setIsAddingPosition(!isAddingPosition)}
              className="flex items-center gap-2 px-4 py-2 bg-rh-green text-rh-dark rounded-lg font-semibold hover:bg-green-400 transition-colors"
            >
              <Plus size={20} />
              Add Position
            </button>
          </div>

          {isAddingPosition && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Symbol (e.g., AAPL)"
                value={newPosition.symbol}
                onChange={(e) => setNewPosition({...newPosition, symbol: e.target.value.toUpperCase()})}
                className="px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rh-green"
              />
              <input
                type="number"
                step="0.001"
                placeholder="Shares"
                value={newPosition.shares || ''}
                onChange={(e) => setNewPosition({...newPosition, shares: parseFloat(e.target.value) || 0})}
                className="px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rh-green"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Cost Basis"
                value={newPosition.costBasis || ''}
                onChange={(e) => setNewPosition({...newPosition, costBasis: parseFloat(e.target.value) || 0})}
                className="px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rh-green"
              />
              <input
                type="date"
                value={newPosition.purchaseDate}
                onChange={(e) => setNewPosition({...newPosition, purchaseDate: e.target.value})}
                className="px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
              />
              <button
                onClick={handleAddPosition}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-rh-green text-rh-dark rounded-lg font-semibold hover:bg-green-400 transition-colors"
              >
                <Save size={20} />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Positions Table */}
        <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Current Positions</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-300">Symbol</th>
                  <th className="text-right py-3 text-gray-300">Shares</th>
                  <th className="text-right py-3 text-gray-300">Cost Basis</th>
                  <th className="text-right py-3 text-gray-300">Total Cost</th>
                  <th className="text-right py-3 text-gray-300">Purchase Date</th>
                  <th className="text-right py-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    {editingPosition === position.id ? (
                      // Edit mode
                      <>
                        <td className="py-3 font-bold text-lg text-white">{position.symbol}</td>
                        <td className="text-right">
                          <input
                            type="number"
                            step="0.001"
                            value={editPosition?.shares || 0}
                            onChange={(e) => setEditPosition(prev => prev ? {...prev, shares: Number(e.target.value)} : null)}
                            className="w-20 px-2 py-1 bg-rh-dark border border-gray-700 rounded text-white text-right focus:outline-none focus:ring-1 focus:ring-rh-green text-sm"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={editPosition?.costBasis || 0}
                            onChange={(e) => setEditPosition(prev => prev ? {...prev, costBasis: Number(e.target.value)} : null)}
                            className="w-24 px-2 py-1 bg-rh-dark border border-gray-700 rounded text-white text-right focus:outline-none focus:ring-1 focus:ring-rh-green text-sm"
                          />
                        </td>
                        <td className="text-right text-white">${((editPosition?.shares || 0) * (editPosition?.costBasis || 0)).toFixed(2)}</td>
                        <td className="text-right">
                          <input
                            type="date"
                            value={editPosition?.purchaseDate || ''}
                            onChange={(e) => setEditPosition(prev => prev ? {...prev, purchaseDate: e.target.value} : null)}
                            className="w-32 px-2 py-1 bg-rh-dark border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-rh-green"
                          />
                        </td>
                        <td className="text-right space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-2 text-rh-green hover:bg-rh-green/20 rounded-lg transition-colors"
                            title="Save changes"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Cancel edit"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      // View mode
                      <>
                        <td className="py-3 font-bold text-lg text-white">{position.symbol}</td>
                        <td className="text-right text-gray-300">{position.shares % 1 === 0 ? position.shares : position.shares.toFixed(3)}</td>
                        <td className="text-right text-white">${position.costBasis.toFixed(2)}</td>
                        <td className="text-right text-white">${(position.shares * position.costBasis).toFixed(2)}</td>
                        <td className="text-right text-gray-300">{new Date(position.purchaseDate).toLocaleDateString()}</td>
                        <td className="text-right space-x-2">
                          <button
                            onClick={() => handleEditPosition(position)}
                            className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit position"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePosition(position.id)}
                            className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete position"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {positions.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No positions found. Add your first position above.
            </div>
          )}
        </div>

        {/* Portfolio Summary */}
        {positions.length > 0 && (
          <div className="bg-rh-card rounded-lg shadow-lg p-6 mt-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Portfolio Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-rh-green/10 p-4 rounded-lg border border-rh-green/20">
                <div className="text-rh-green font-semibold">Total Positions</div>
                <div className="text-2xl font-bold text-white">{positions.length}</div>
              </div>
              <div className="bg-rh-green/10 p-4 rounded-lg border border-rh-green/20">
                <div className="text-rh-green font-semibold">Total Invested</div>
                <div className="text-2xl font-bold text-white">
                  ${positions.reduce((sum, p) => sum + (p.shares * p.costBasis), 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-rh-green/10 p-4 rounded-lg border border-rh-green/20">
                <div className="text-rh-green font-semibold">Avg. Position Size</div>
                <div className="text-2xl font-bold text-white">
                  ${(positions.reduce((sum, p) => sum + (p.shares * p.costBasis), 0) / positions.length).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
