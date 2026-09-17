import React, { useState, useEffect } from 'react';
import { teamApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { User, UserRole } from '../types/index.js';
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Eye,
  Trash2,
  X,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const TeamManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [team, setTeam] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('viewer');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  const loadTeam = async () => {
    try {
      const data = await teamApi.getTeam();
      setTeam(data.users);
      setAuditLogs(data.auditLogs);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load team data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await teamApi.updateRole(userId, newRole);
      setTeam((prev) => prev.map((u) => (u.id === userId ? { ...u, role: res.user.role } : u)));
      setNotification(`Successfully updated role to ${newRole}`);
      setTimeout(() => setNotification(''), 3000);
      loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDeleteMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await teamApi.deleteMember(userId);
      setTeam((prev) => prev.filter((u) => u.id !== userId));
      setNotification('Team member removed successfully.');
      setTimeout(() => setNotification(''), 3000);
      loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove team member');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await teamApi.inviteMember({ name, email, role, password });
      setTeam((prev) => [...prev, res.user]);
      setIsInviteOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setNotification(`Added ${res.user.name} to team.`);
      setTimeout(() => setNotification(''), 3000);
      loadTeam();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return <Shield className="w-3 h-3 text-rose-500" />;
      case 'manager':
        return <Briefcase className="w-3 h-3 text-amber-500" />;
      default:
        return <Eye className="w-3 h-3 text-emerald-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            Team & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage enterprise team members, grant permissions, and inspect system audit logs
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Team Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs overflow-hidden">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Active Team Members ({team.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <th className="pb-3 px-3">Member</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Assigned Role</th>
                <th className="pb-3 px-3">Permission Level</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                      />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="ml-2 text-[10px] text-sky-600 font-bold">(You)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">{member.email}</td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {getRoleIcon(member.role)}
                      <select
                        value={member.role}
                        disabled={member.id === currentUser?.id}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold capitalize text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                    {member.role === 'admin' && 'Full Administrative Control + API Keys + Team'}
                    {member.role === 'manager' && 'Campaign Orchestration + Post Scheduling & Publishing'}
                    {member.role === 'viewer' && 'Read-Only Insights & Historical Analytics'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {member.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Activity Audit Log</h3>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  <span className="font-mono text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider text-[10px] mr-2">
                    {log.action}
                  </span>
                  {log.details}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">By {log.userName}</div>
              </div>
              <div className="text-[10px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <UserPlus className="w-5 h-5 text-sky-500" />
                <span>Invite New Team Member</span>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defaults to Welcome@123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Role Permission
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 transition"
                >
                  <option value="viewer">Viewer (Read-only analytics)</option>
                  <option value="manager">Manager (Create/Publish posts & view metrics)</option>
                  <option value="admin">Admin (Full access + manage team & API connectors)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
