import { Schema, model } from 'mongoose';

export interface IStoreSettings {
  storeName: string;
  storeLogo?: string | null;
  contactEmail: string;
  emailTemplate: string;
}

const defaultEmailTemplate = 'Thank you for your purchase. Your books are ready in My Library.';

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, required: true, trim: true, default: 'EBookN' },
    storeLogo: { type: String, default: null, trim: true },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    emailTemplate: { type: String, required: true, trim: true, default: defaultEmailTemplate },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

export const StoreSettings = model<IStoreSettings>('StoreSettings', storeSettingsSchema);
export { defaultEmailTemplate };
