import AuditLog from '../models/AuditLog.js';
import LoginHistory from '../models/LoginHistory.js';

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip || 'Unknown';
}

export function getUserAgent(req) {
  return req.headers['user-agent'] || 'Unknown';
}

export const auditService = {
  async log(event, req, userId = null, metadata = {}) {
    try {
      await AuditLog.create({
        user: userId,
        event,
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
        metadata,
      });
    } catch {
      // audit logging must never break the main request flow
    }
  },

  async recordLogin(req, userId, success, reason = null, suspicious = false) {
    try {
      await LoginHistory.create({
        user: userId,
        success,
        reason,
        ip: getClientIp(req),
        userAgent: getUserAgent(req),
        suspicious,
      });
    } catch {
      // non-fatal
    }
  },

  /**
   * Very lightweight suspicious-login heuristic: flags a login as suspicious
   * if it comes from an IP never seen before for this user's last N logins.
   * Intended as a hook — swap in a real GeoIP / device-fingerprinting service
   * for production use.
   */
  async isSuspiciousLogin(userId, currentIp) {
    const recent = await LoginHistory.find({ user: userId, success: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('ip')
      .lean();

    if (recent.length === 0) return false; // first login ever, nothing to compare
    return !recent.some((entry) => entry.ip === currentIp);
  },
};
