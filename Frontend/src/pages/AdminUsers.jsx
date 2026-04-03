import { useState } from 'react'
import { Search, Eye, Lock, Unlock, Trash2 } from 'lucide-react'

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [users, setUsers] = useState([
    { id: 1, name: 'John Patient', email: 'john@example.com', role: 'patient', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Emma Johnson', email: 'emma@example.com', role: 'patient', status: 'active', joinDate: '2024-01-20' },
    { id: 3, name: 'Dr. Sarah Anderson', email: 'sarah@hospital.com', role: 'caregiver', status: 'active', joinDate: '2024-01-10' },
    { id: 4, name: 'Michael Brown', email: 'michael@example.com', role: 'patient', status: 'inactive', joinDate: '2024-02-01' },
    { id: 5, name: 'Dr. James Wilson', email: 'james@hospital.com', role: 'caregiver', status: 'active', joinDate: '2024-01-25' },
    { id: 6, name: 'Lisa Anderson', email: 'lisa@example.com', role: 'patient', status: 'active', joinDate: '2024-02-05' },
  ])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const toggleUserStatus = (id) => {
    setUsers(users.map((user) => 
      user.id === id ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ))
  }

  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id))
    setDeleteConfirm(null)
  }

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all system users</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'patient', 'caregiver'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterRole === role
                  ? 'bg-[#6366F1] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role === 'all' ? 'All' : role === 'patient' ? 'Patients' : 'Caregivers'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'patient' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {user.role === 'patient' ? 'Patient' : 'Caregiver'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[#6366F1] hover:bg-indigo-50 transition text-sm font-medium">
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
                      >
                        {user.status === 'active' ? (
                          <>
                            <Lock size={16} />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Unlock size={16} />
                            Activate
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Active Users</p>
          <p className="text-3xl font-bold text-[#22C55E] mt-2">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Inactive Users</p>
          <p className="text-3xl font-bold text-[#F59E0B] mt-2">{users.filter(u => u.status === 'inactive').length}</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to permanently delete <span className="font-semibold">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700">
                <span className="font-semibold">Warning:</span> All user data, medications, adherence records, and related information will be permanently removed from the system.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm.id)}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
