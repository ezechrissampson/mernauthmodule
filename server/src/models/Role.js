import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * A Role is metadata (display name, color, icon) plus a slug that MUST match one of the
 * USER_ROLES constants and one of User.role's enum values — the two are kept in sync by
 * the seed script (see utils/seedRolesAndPermissions.js), never edited independently.
 * This module deliberately assigns ONE role per user (stored directly on User.role) rather
 * than a multi-role join table — see docs/ARCHITECTURE.md for why that's the right call here.
 */
const roleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    color: { type: String, default: '#6B7280' },
    icon: { type: String, default: 'bi-person' },
    isSystem: { type: Boolean, default: true }, // all roles in this simplified module are system-defined
  },
  { timestamps: true }
);

export default mongoose.model('Role', roleSchema);
