import mongoose from 'mongoose';

const { Schema } = mongoose;

const permissionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Permission = mongoose.model('Permission', permissionSchema);

const rolePermissionSchema = new Schema(
  {
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true, index: true },
    permission: { type: Schema.Types.ObjectId, ref: 'Permission', required: true, index: true },
  },
  { timestamps: true }
);
rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

export const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);
