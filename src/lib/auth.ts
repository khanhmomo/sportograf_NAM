export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false
  const role = localStorage.getItem('admin_role')
  return role === 'admin'
}

export function isTeamLeader(): boolean {
  if (typeof window === 'undefined') return false
  const role = localStorage.getItem('admin_role')
  return role === 'team-leader'
}

export function getAdminRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_role')
}

export function getAdminUsername(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('admin_username')
}

export function canEdit(): boolean {
  return isAdmin()
}

export function canDelete(): boolean {
  return isAdmin()
}
